import { useEffect, useMemo, useRef, useState } from 'react';
import GameApp from './components/GameApp.jsx';
import LoginModal from './components/LoginModal.jsx';
import PromotionPage from './components/PromotionPage.jsx';
import theme from './config/theme.json';
import { web } from './data/session.js';
import { clearSession, loadSession, saveSession, toHeaderUser } from './lib/session.js';
import { fetchGames, fetchProviderTypes, fetchProviders, fetchWebConfig } from './lib/api.js';

// หน้าของเมนูบาร์ที่ยังไม่ได้ทำ — แทนที่ด้วยหน้าจริง
const PAGE_TITLE = { wallet: 'ฝากถอน', promo: 'โปรโมชั่น', profile: 'โปรไฟล์', contact: 'ติดต่อ' };

function PlaceholderPage({ title }) {
  return (
    <div className="ta-section" style={{ minHeight: 240 }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>{title}</h2>
      <p style={{ margin: 0, color: 'var(--c-muted)' }}>หน้านี้ยังไม่ได้เชื่อมข้อมูล</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="ta-loading" role="status">
      <span className="ta-loading-spin" />
      กำลังโหลด…
    </div>
  );
}

export default function App() {
  const [webConfig, setWebConfig] = useState(undefined); // undefined = loading, null = use built-in theme/logo
  const [providers, setProviders] = useState(null);
  const [providerTypes, setProviderTypes] = useState(null); // sidebar shows only these types (null = all)
  const [error, setError] = useState('');
  const [games, setGames] = useState({}); // { [providerCode]: Game[] | null } — missing = loading
  const [category, setCategory] = useState('slot');
  const [page, setPage] = useState('home');
  const [member, setMember] = useState(loadSession); // login response kept in sessionStorage; null = guest
  const [loginOpen, setLoginOpen] = useState(false);
  const user = useMemo(() => toHeaderUser(member), [member]);

  const onLoggedIn = (res) => {
    saveSession(res);
    setMember(res);
    setLoginOpen(false);
  };
  const logout = () => {
    clearSession();
    setMember(null);
    setPage('home');
  };
  // "สมัครสมาชิก" (guest replacement of the profile menu) opens the login modal too
  const navigate = (k) => {
    if (k === 'register') {
      setLoginOpen(true);
      return false;
    }
    setPage(k);
    return true;
  };

  // site config first (logo + colors); on failure keep the built-in theme and logo
  useEffect(() => {
    fetchWebConfig()
      .catch((e) => {
        console.warn('webconfig:', e.message);
        return null;
      })
      .then(setWebConfig);
  }, []);
  const siteTheme = useMemo(
    () => (webConfig?.colors ? { ...theme, colors: { ...theme.colors, ...webConfig.colors } } : theme),
    [webConfig],
  );
  // browser tab title follows the site name from webconfig
  useEffect(() => {
    if (webConfig?.company) document.title = webConfig.company;
  }, [webConfig]);

  const siteWeb = useMemo(
    () => ({
      ...web,
      ...(webConfig?.logo ? { logo: webConfig.logo } : null),
      ...(webConfig?.company ? { Name: webConfig.company } : null),
    }),
    [webConfig],
  );

  useEffect(() => {
    Promise.all([fetchProviders(), fetchProviderTypes()])
      .then(([list, types]) => {
        setProviderTypes(types);
        setProviders(list);
      })
      .catch((e) => setError(e.message));
  }, []);

  // fetch a provider's game list when its tile is clicked (once each)
  const requested = useRef(new Set());
  const loadGames = (p) => {
    if (requested.current.has(p.provider)) return;
    requested.current.add(p.provider);
    fetchGames(p)
      .catch(() => [])
      .then((list) => setGames((cur) => ({ ...cur, [p.provider]: list })));
  };

  const handlePlay = (game, provider) => {
    // TODO: เรียก API เปิดเกม แล้ว window.open(url)
    console.log('play', provider.provider, game?.gameCode ?? '(lobby)');
  };

  if (error) return <p style={{ color: '#ff5d3a', padding: 16 }}>โหลดรายชื่อค่ายไม่สำเร็จ: {error}</p>;
  if (webConfig === undefined || !providers) return <LoadingScreen />;

  return (
    <GameApp
      config={siteTheme}
      web={siteWeb}
      user={user}
      providers={providers}
      providerTypes={providerTypes}
      games={games}
      initialCategory={category}
      onCategoryChange={(k) => {
        setCategory(k);
        setPage('home');
      }}
      activeNav={page}
      onNavigate={navigate}
      onLogin={() => setLoginOpen(true)}
      onLogout={logout}
      overlay={loginOpen && <LoginModal onSuccess={onLoggedIn} onClose={() => setLoginOpen(false)} />}
      onOpenProvider={loadGames}
      onPlay={handlePlay}
    >
      {page === 'home' ? undefined : page === 'promo' ? <PromotionPage /> : <PlaceholderPage title={PAGE_TITLE[page]} />}
    </GameApp>
  );
}
