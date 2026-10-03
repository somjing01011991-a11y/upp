import { useEffect, useMemo, useRef, useState } from 'react';
import { ThemeProvider, useConfig } from '../theme/ThemeProvider.jsx';
import { normalizeProviders, providersFor } from '../lib/providers.js';
import AppHeader from './AppHeader.jsx';
import BottomNav from './BottomNav.jsx';
import CategorySidebar from './CategorySidebar.jsx';
import Icon from './Icon.jsx';
import ProviderSection from './ProviderSection.jsx';
import ProviderTile from './ProviderTile.jsx';

function AppInner({
  web,
  user,
  providers,
  games,
  getGames,
  initialCategory,
  activeNav = 'home',
  navFixed = true,
  showCounts = false,
  onPlay,
  onViewAll,
  onNavigate,
  onCategoryChange,
  onOpenProvider,
  children,
}) {
  const cfg = useConfig();
  const data = useMemo(() => normalizeProviders(providers), [providers]);
  const cats = useMemo(
    () => cfg.categories.filter((c) => providersFor(c, data).length > 0),
    [cfg.categories, data],
  );

  const [catKey, setCatKey] = useState(initialCategory);
  const [navKey, setNavKey] = useState(activeNav);
  useEffect(() => setNavKey(activeNav), [activeNav]);

  // keep the sidebar's sticky offset equal to the real header height (it wraps on mobile)
  const headerRef = useRef(null);
  const rootRef = useRef(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el || !window.ResizeObserver) return undefined;
    const ro = new ResizeObserver(() =>
      rootRef.current?.style.setProperty('--ta-header-actual', `${el.offsetHeight}px`),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cat = cats.find((c) => c.key === catKey) || cats[0];
  const list = cat ? providersFor(cat, data) : [];
  const counts = showCounts ? Object.fromEntries(cats.map((c) => [c.key, providersFor(c, data).length])) : null;

  const gamesOf = (p) => (getGames ? getGames(p, cat) : games?.[p.provider] ?? null);

  // provider opened from the grid (games categories only) — its games replace the grid
  const [openKey, setOpenKey] = useState(null);
  const open = cat?.display === 'games' ? list.find((p) => p.provider === openKey) : null;

  const openProvider = (p) => {
    if (cat?.display !== 'games' || p.detailStatus === false) {
      onPlay?.(null, p);
      return;
    }
    setOpenKey(p.provider);
    onOpenProvider?.(p, cat);
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const selectCat = (k) => {
    setCatKey(k);
    setOpenKey(null);
    onCategoryChange?.(k);
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="ta-app" ref={rootRef}>
      <AppHeader ref={headerRef} web={web} user={user} />

      <div className="ta-body">
        <CategorySidebar active={cat?.key} onSelect={selectCat} categories={cats} counts={counts} />

        <main className="ta-content">
          {children ?? (
            <>
              {cat && (
                <div className="ta-cat-head">
                  <span className="ta-cat-head-icon">
                    <Icon name={cat.icon || cat.key} />
                  </span>
                  <h2>{cat.label}</h2>
                  <span className="ta-cat-head-count">
                    {list.length} {cfg.texts.providers}
                  </span>
                </div>
              )}

              {open ? (
                <>
                  <button type="button" className="ta-back" onClick={() => setOpenKey(null)}>
                    <Icon name="chevron" />
                    {cfg.texts.back}
                  </button>
                  <ProviderSection
                    provider={open}
                    games={gamesOf(open)}
                    count={gamesOf(open)?.length}
                    full
                    onPlay={onPlay}
                  />
                </>
              ) : (
                <div className="ta-ptiles">
                  {list.map((p) => (
                    <ProviderTile
                      key={p.provider}
                      provider={p}
                      cta={cat?.display === 'games' && p.detailStatus !== false ? cfg.texts.games : undefined}
                      onSelect={openProvider}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <BottomNav
        active={navKey}
        fixed={navFixed}
        onSelect={(k) => {
          setNavKey(k);
          onNavigate?.(k);
        }}
      />
    </div>
  );
}

/**
 * Whole app: header + (category sidebar | providers of the selected category) + bottom nav.
 * In `display: "games"` categories a provider tile opens that provider's games.
 * `children`, when given, replaces the provider content (use it for other pages).
 */
export default function GameApp({ config, className, ...props }) {
  return (
    <ThemeProvider config={config} className={className}>
      <AppInner {...props} />
    </ThemeProvider>
  );
}
