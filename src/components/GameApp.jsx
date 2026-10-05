import { useEffect, useMemo, useRef, useState } from 'react';
import { ThemeProvider, useConfig } from '../theme/ThemeProvider.jsx';
import { applyCategoryMap, normalizeProviders, providersFor } from '../lib/providers.js';
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
  categoryMap = null,
  games,
  initialCategory,
  activeNav = 'home',
  navFixed = true,
  showCounts = false,
  onPlay,
  onNavigate,
  onCategoryChange,
  onOpenProvider,
  onLogin,
  onLogout,
  overlay,
  children,
}) {
  const cfg = useConfig();
  // categories API decides which providerTypes show and where; theme.json fills the gaps
  const mapped = useMemo(() => applyCategoryMap(cfg.categories, categoryMap), [cfg.categories, categoryMap]);
  const data = useMemo(() => normalizeProviders(providers, mapped.types), [providers, mapped.types]);
  const cats = useMemo(
    () => mapped.categories.filter((c) => providersFor(c, data).length > 0),
    [mapped.categories, data],
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

  // provider-name search in the grid (name or code, case-insensitive, cleared when the category changes)
  const [providerQuery, setProviderQuery] = useState('');
  const pq = providerQuery.trim().toLowerCase();
  const shownProviders = pq
    ? list.filter((p) => `${p.providerName || ''} ${p.provider || ''}`.toLowerCase().includes(pq))
    : list;

  // provider opened from the grid — its game list replaces the grid
  const [openKey, setOpenKey] = useState(null);
  const open = list.find((p) => p.provider === openKey) || null;

  // game-name search inside the open provider (case-insensitive, cleared when the provider changes)
  const [query, setQuery] = useState('');
  useEffect(() => setQuery(''), [openKey]);
  const openGames = open ? games?.[open.provider] : undefined;
  const q = query.trim().toLowerCase();
  const shownGames = q && openGames ? openGames.filter((g) => (g.gameName || '').toLowerCase().includes(q)) : openGames;

  const openProvider = (p) => {
    if (p.detailStatus === false) {
      onPlay?.(null, p);
      return;
    }
    setOpenKey(p.provider);
    onOpenProvider?.(p, cat);
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  // floating buttons once the page is scrolled down: "scroll to top" (+ "back to providers" in a game list)
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toTop = () => window.scrollTo?.({ top: 0, behavior: 'smooth' });
  const closeProvider = () => {
    setOpenKey(null);
    toTop();
  };

  const selectCat = (k) => {
    setCatKey(k);
    setOpenKey(null);
    setProviderQuery('');
    onCategoryChange?.(k);
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="ta-app" ref={rootRef}>
      <AppHeader ref={headerRef} web={web} user={user} onLogin={onLogin} onLogout={onLogout} />

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
                  {/* in a game list: number of games shown (after search); otherwise number of providers */}
                  {open ? (
                    shownGames && (
                      <span className="ta-cat-head-count">
                        {shownGames.length} {cfg.texts.gamesUnit}
                      </span>
                    )
                  ) : (
                    <span className="ta-cat-head-count">
                      {list.length} {cfg.texts.providers}
                    </span>
                  )}
                </div>
              )}

              {open ? (
                <>
                  <div className="ta-open-bar">
                    <button type="button" className="ta-back" onClick={closeProvider}>
                      <Icon name="chevron" />
                      {cfg.texts.back}
                    </button>
                    {openGames?.length > 0 && (
                      <label className="ta-search">
                        <Icon name="search" />
                        <input
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder={cfg.texts.searchGames}
                          aria-label={cfg.texts.searchGames}
                        />
                      </label>
                    )}
                  </div>
                  {q && shownGames?.length === 0 ? (
                    <p className="ta-search-empty">{cfg.texts.noGamesFound}</p>
                  ) : (
                    <ProviderSection provider={open} games={shownGames} full onPlay={onPlay} />
                  )}
                </>
              ) : (
                <>
                  {list.length > 0 && (
                    <label className="ta-search">
                      <Icon name="search" />
                      <input
                        type="search"
                        value={providerQuery}
                        onChange={(e) => setProviderQuery(e.target.value)}
                        placeholder={cfg.texts.searchProviders}
                        aria-label={cfg.texts.searchProviders}
                      />
                    </label>
                  )}
                  {pq && shownProviders.length === 0 ? (
                    <p className="ta-search-empty">{cfg.texts.noProvidersFound}</p>
                  ) : (
                    <div className="ta-ptiles">
                      {shownProviders.map((p) => (
                        <ProviderTile
                          key={p.provider}
                          provider={p}
                          onSelect={openProvider}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {scrolled && (
                <div className="ta-float">
                  {open && (
                    <button type="button" className="ta-float-back" onClick={closeProvider}>
                      <Icon name="chevron" />
                      {cfg.texts.back}
                    </button>
                  )}
                  <button type="button" className="ta-float-top" onClick={toTop} aria-label={cfg.texts.toTop}>
                    <Icon name="chevron" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <BottomNav
        active={navKey}
        fixed={navFixed}
        loggedIn={!!user}
        onSelect={(k) => {
          // onNavigate returning false = handled without a page change (e.g. opens a modal), keep the highlight
          if (onNavigate?.(k) !== false) setNavKey(k);
        }}
      />
      {overlay}
    </div>
  );
}

/**
 * Whole app: header + (category sidebar | provider tiles of the selected category) + bottom nav.
 * Clicking a provider tile shows that provider's games (`games[provider]`, loaded via onOpenProvider).
 * `children`, when given, replaces the provider content (use it for other pages); `overlay` renders on top (modals).
 */
export default function GameApp({ config, className, ...props }) {
  return (
    <ThemeProvider config={config} className={className}>
      <AppInner {...props} />
    </ThemeProvider>
  );
}
