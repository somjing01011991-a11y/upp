import { useEffect, useMemo, useRef, useState } from 'react';
import GameApp from './components/GameApp.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import theme from './config/theme.json';
import { web, user } from './data/session.js';
import { fetchGames, fetchProviders } from './lib/api.js';
import { normalizeProviders, providersFor } from './lib/providers.js';

// หน้าของเมนูบาร์ที่ยังไม่ได้ทำ — แทนที่ด้วยหน้าจริง
const PAGE_TITLE = { wallet: 'ฝากถอน', promo: 'โปรโมชั่น', contact: 'ติดต่อ' };

function PlaceholderPage({ title }) {
  return (
    <div className="ta-section" style={{ minHeight: 240 }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>{title}</h2>
      <p style={{ margin: 0, color: 'var(--c-muted)' }}>หน้านี้ยังไม่ได้เชื่อมข้อมูล</p>
    </div>
  );
}

export default function App() {
  const [providers, setProviders] = useState(null);
  const [error, setError] = useState('');
  const [games, setGames] = useState({}); // { [providerCode]: Game[] | null }
  const [category, setCategory] = useState('slot');
  const [page, setPage] = useState('home');

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
      user={user}
      providers={providers}
      games={games}
      initialCategory={category}
      onCategoryChange={(k) => {
        setCategory(k);
        setPage('home');
      }}
      activeNav={page}
      onNavigate={setPage}
      onPlay={handlePlay}
      onViewAll={(p) => console.log('view all', p.provider)}
    >
      {page === 'home' ? undefined : page === 'profile' ? (
        // ตอนนี้เมนูโปรไฟล์เปิดฟอร์มสมัครสมาชิก — ย้ายไปปุ่ม/หน้าที่ต้องการได้
        <RegisterForm />
      ) : (
        <PlaceholderPage title={PAGE_TITLE[page]} />
      )}
    </GameApp>
  );
}
