import { useEffect, useMemo, useRef, useState } from 'react';
import GameApp from './components/GameApp.jsx';
import LoginModal from './components/LoginModal.jsx';
import WelcomeModal from './components/WelcomeModal.jsx';
import GamePlayer from './components/GamePlayer.jsx';
import PromotionPage from './components/PromotionPage.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import theme from './config/theme.json';
import { web } from './data/session.js';
import { parsePath, toPath } from './lib/route.js';
import { captureReferral, clearSession, loadSession, saveSession, toHeaderUser } from './lib/session.js';
import { playGame, fetchBalance, fetchGames, fetchCategories, fetchProviders, fetchWebConfig } from './lib/api.js';

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

const BALANCE_INTERVAL_MS = 10_000;

// /register?ref=&pref= — the codes go to sessionStorage for the signup body
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
  // what is on screen, mirrored in the URL (see lib/route.js); category null = first category
  const [route, setRoute] = useState(() => parsePath());
  const { page, category, provider } = route;
  const setPage = (p) => setRoute((r) => ({ ...r, page: p }));
  const [playUrl, setPlayUrl] = useState(null); // launch URL of the game on /play/…
  const [notice, setNotice] = useState(''); // small alert modal (game closed, …)
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

  // refresh the header balance every 10s while logged in; a denied token logs out and reopens login
  const username = member?.Username;
  const token = member?.accesstoken;
  useEffect(() => {
    if (!username || !token) return undefined;
    let stopped = false;
    const tick = async () => {
      try {
        const res = await fetchBalance(username, token);
        if (stopped) return;
        if (res.msg === true && res.data) {
          const { totalWallet, CraditGames, totalCommission } = res.data;
          setMember((m) => {
            if (!m || m.accesstoken !== token) return m;
            const next = { ...m, totalWallet, CraditGames, totalCommission };
            saveSession(next);
            return next;
          });
        } else if (res.msg === false && res.access === 'denied') {
          clearSession();
          setMember(null);
          setPage('home');
          setLoginOpen(true);
        }
      } catch {
        // network hiccup: keep the last balance and try again next tick
      }
    };
    const id = setInterval(tick, BALANCE_INTERVAL_MS);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [username, token]);

  // keep the address bar in step with the page; back/forward and reload come back to the same view
  useEffect(() => {
    const path = toPath(route);
    if (path !== window.location.pathname) window.history.pushState(null, '', path);
  }, [route]);
  useEffect(() => {
    const onPop = () => setRoute(parsePath());
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

  // play: guests get the login form; members open /play/{provider}/{game}, which asks the API for the launch URL
  const handlePlay = (game, p) => {
    if (!member) {
      setLoginOpen(true);
      return;
    }
    setPlayUrl(null);
    setRoute((r) => ({ ...r, page: 'play', play: { provider: p.provider, gameID: game?.gameCode ?? '' } }));
  };
  const exitGame = () => {
    setPlayUrl(null);
    setRoute((r) => ({ ...r, page: 'home', play: null }));
  };
  const play = page === 'play' ? route.play : null;
  useEffect(() => {
    if (!play) return undefined;
    if (!member) {
      // opened /play/… while logged out (or the session ended): back to the games, login first
      exitGame();
      setLoginOpen(true);
      return undefined;
    }
    let cancelled = false;
    // the game returns to the page the player came from (the game list), not to /play/…
    const back = `${window.location.origin}${toPath({ ...route, page: 'home', play: null })}`;
    playGame({
      Username: member.Username,
      accesstoken: member.accesstoken,
      provider: play.provider,
      gameID: play.gameID,
      redirectUrl: back,
    })
      .catch(() => ({ msg: false }))
      .then((res) => {
        if (cancelled) return;
        if (res.msg === true && res.url) {
          setPlayUrl(res.url);
          return;
        }
        exitGame();
        setNotice(typeof res.error === 'string' && res.error ? res.error : 'เกมปิดปรับปรุง');
      });
    return () => {
      cancelled = true;
    };
  }, [play?.provider, play?.gameID, member?.accesstoken]); // eslint-disable-line react-hooks/exhaustive-deps

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
      category={category}
      provider={provider}
      onCategoryChange={(k) => setRoute({ page: 'home', category: k, provider: null })}
      onProviderChange={(code) => setRoute((r) => ({ ...r, page: 'home', provider: code }))}
      activeNav={page === 'play' ? 'home' : page}
      onNavigate={navigate}
      onLogin={() => setLoginOpen(true)}
      onLogout={logout}
      overlay={
        play && member ? (
          <GamePlayer url={playUrl} member={member} onExit={exitGame} />
        ) : notice ? (
          <div className="ta-modal-backdrop" onClick={() => setNotice('')}>
            <div className="ta-modal ta-alert-modal" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <p>{notice}</p>
              <button type="button" className="ta-btn ta-login-submit" onClick={() => setNotice('')} autoFocus>
                ตกลง
              </button>
            </div>
          </div>
        ) : welcomeOpen ? (
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
      {page === 'home' || page === 'play' ? undefined : page === 'promo' ? <PromotionPage /> : page === 'signup' ? <RegisterForm onRegistered={registered} /> : <PlaceholderPage title={PAGE_TITLE[page]} />}
    </GameApp>
  );
}
