import { useEffect, useState } from 'react';
import GameApp from './components/GameApp.jsx';
import theme from './config/theme.json';
import { web, user } from './data/session.js';
import { fetchProviders } from './lib/api.js';

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

export default function App() {
  const [providers, setProviders] = useState(null);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('slot');
  const [page, setPage] = useState('home');

  useEffect(() => {
    fetchProviders().then(setProviders).catch((e) => setError(e.message));
  }, []);

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
      initialCategory={category}
      onCategoryChange={(k) => {
        setCategory(k);
        setPage('home');
      }}
      activeNav={page}
      onNavigate={setPage}
      onPlay={handlePlay}
    >
      {page === 'home' ? undefined : <PlaceholderPage title={PAGE_TITLE[page]} />}
    </GameApp>
  );
}
