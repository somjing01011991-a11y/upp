import { useEffect, useMemo, useRef, useState } from 'react';
import GameApp from './components/GameApp.jsx';
import LoginModal from './components/LoginModal.jsx';
import WelcomeModal from './components/WelcomeModal.jsx';
import PromotionPage from './components/PromotionPage.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import theme from './config/theme.json';
import { web } from './data/session.js';
import { captureReferral, clearSession, loadSession, saveSession, toHeaderUser } from './lib/session.js';
import { fetchGames, fetchCategories, fetchProviders, fetchWebConfig } from './lib/api.js';

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

// /register opens the signup page directly; its ?ref=&pref= go to sessionStorage for the signup body
const REGISTER_PATH = /\/register\/?$/;
const pageFromUrl = () => (REGISTER_PATH.test(window.location.pathname) ? 'signup' : 'home');
captureReferral();

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
  const [categoryMap, setCategoryMap] = useState(null); // [{ providerType, category }] from the API (null = theme.json)
  const [error, setError] = useState('');
  const [games, setGames] = useState({}); // { [providerCode]: Game[] | null } — missing = loading
  const [category, setCategory] = useState('slot');
  const [page, setPage] = useState(pageFromUrl);
  const [member, setMember] = useState(loadSession); // login response kept in sessionStorage; null = guest
  const [loginOpen, setLoginOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false); // signup success popup
  const user = useMemo(() => toHeaderUser(member), [member]);

  const onLoggedIn = (res) => {
    saveSession(res);
    setMember(res);
    setLoginOpen(false);
  };
  // signup response data has the same shape as a login, so the new member is logged in right away
  const registered = (data) => {
    onLoggedIn(data);
    setPage('home');
    setWelcomeOpen(true);
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

  // keep the address bar in step with the signup page: /register while it is open, / otherwise
  useEffect(() => {
    const onSignupUrl = REGISTER_PATH.test(window.location.pathname);
    if (page === 'signup' && !onSignupUrl) window.history.pushState(null, '', '/register');
    else if (page !== 'signup' && onSignupUrl) window.history.pushState(null, '', '/');
  }, [page]);
  useEffect(() => {
    const onPop = () => setPage(pageFromUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

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
    Promise.all([fetchProviders(), fetchCategories()])
      .then(([list, map]) => {
        setCategoryMap(map);
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
      categoryMap={categoryMap}
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
      overlay={
        welcomeOpen ? (
          <WelcomeModal siteName={siteWeb.Name} onClose={() => setWelcomeOpen(false)} />
        ) : loginOpen && (
          <LoginModal
            onSuccess={onLoggedIn}
            onClose={() => setLoginOpen(false)}
            onRegister={() => {
              setLoginOpen(false);
              setPage('signup');
            }}
          />
        )
      }
      onOpenProvider={loadGames}
      onPlay={handlePlay}
    >
      {page === 'home' ? undefined : page === 'promo' ? <PromotionPage /> : page === 'signup' ? <RegisterForm onRegistered={registered} /> : <PlaceholderPage title={PAGE_TITLE[page]} />}
    </GameApp>
  );
}
