import { useEffect, useMemo, useRef, useState } from 'react';
import GameApp from './components/GameApp.jsx';
import theme from './config/theme.json';
import { web, user } from './data/session.js';
import { fetchGames, fetchProviders } from './lib/api.js';
import { normalizeProviders, providersFor } from './lib/providers.js';

// หน้าของเมนูบาร์ที่ยังไม่ได้ทำ — แทนที่ด้วยหน้าจริง
const PAGE_TITLE = {
  wallet: 'ฝากถอน',
  promo: 'โปรโมชั่น',
  profile: 'โปรไฟล์',
  contact: 'ติดต่อ',
  login: 'เข้าสู่ระบบ',
  register: 'สมัครสมาชิก',
};

function PlaceholderPage({ title, children }) {
  return (
    <div className="ta-section" style={{ minHeight: 240 }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>{title}</h2>
      <p style={{ margin: 0, color: 'var(--c-muted)' }}>หน้านี้ยังไม่ได้เชื่อมข้อมูล</p>
      {children}
    </div>
  );
}

export default function App() {
  const [providers, setProviders] = useState(null);
  const [error, setError] = useState('');
  const [games, setGames] = useState({}); // { [providerCode]: Game[] | null }
  const [category, setCategory] = useState('slot');
  const [page, setPage] = useState('home');
  // null = ยังไม่ล็อกอิน (แถบบนแสดงปุ่มเข้าสู่ระบบ, เมนูโปรไฟล์เป็นสมัครสมาชิก)
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchProviders().then(setProviders).catch((e) => setError(e.message));
  }, []);

  // fetch the game lists of the providers in the open category (once each)
  const data = useMemo(() => normalizeProviders(providers), [providers]);
  const requested = useRef(new Set());
  useEffect(() => {
    const cat = theme.categories.find((c) => c.key === category);
    if (!cat || cat.display !== 'games') return;
    for (const p of providersFor(cat, data)) {
      if (p.detailStatus === false) continue;
      if (requested.current.has(p.provider)) continue;
      requested.current.add(p.provider);
      fetchGames(p)
        .catch(() => null)
        .then((list) => setGames((cur) => ({ ...cur, [p.provider]: list })));
    }
  }, [category, data]);

  const handlePlay = (game, provider) => {
    // TODO: เรียก API เปิดเกม แล้ว window.open(url)
    console.log('play', provider.provider, game?.gameCode ?? '(lobby)');
  };

  if (error) return <p style={{ color: '#ff5d3a', padding: 16 }}>โหลดรายชื่อค่ายไม่สำเร็จ: {error}</p>;
  if (!providers) return null;

  return (
    <GameApp
      config={theme}
      web={web}
      user={currentUser}
      providers={providers}
      games={games}
      initialCategory={category}
      onCategoryChange={(k) => {
        setCategory(k);
        setPage('home');
      }}
      activeNav={page}
      onNavigate={setPage}
      onLogin={() => setPage('login')}
      onPlay={handlePlay}
      onViewAll={(p) => console.log('view all', p.provider)}
    >
      {page === 'home' ? undefined : (
        <PlaceholderPage title={PAGE_TITLE[page]}>
          {page === 'login' && (
            // TODO: แทนที่ด้วยฟอร์มล็อกอินจริง — ตอนนี้ใช้ผู้ใช้ตัวอย่างจาก session.js
            <button
              type="button"
              className="ta-btn"
              style={{ marginTop: 16 }}
              onClick={() => {
                setCurrentUser(user);
                setPage('home');
              }}
            >
              เข้าสู่ระบบ (ตัวอย่าง)
            </button>
          )}
        </PlaceholderPage>
      )}
    </GameApp>
  );
}
