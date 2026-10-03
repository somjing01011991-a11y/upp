import { useConfig } from '../theme/ThemeProvider.jsx';
import Icon from './Icon.jsx';

/** Zone 3 — always-visible bottom menu. Items from theme.json `nav`; `primary` = raised gold button. */
export default function BottomNav({ active, onSelect, items, fixed = true }) {
  const cfg = useConfig();
  const list = items || cfg.nav;
  return (
    <nav className={`ta-nav${fixed ? '' : ' ta-nav--static'}`} aria-label="เมนูหลัก">
      <div className="ta-nav-in" style={{ gridTemplateColumns: `repeat(${list.length}, 1fr)` }}>
        {list.map((it) => {
          const icon = <Icon name={it.icon || it.key} />;
          return (
            <button
              key={it.key}
              type="button"
              className={`ta-nav-item${it.primary ? ' ta-nav-item--primary' : ''}`}
              aria-current={it.key === active ? 'page' : undefined}
              onClick={() => onSelect?.(it.key)}
            >
              {it.primary ? <span className="ta-nav-orb">{icon}</span> : icon}
              <span className="ta-nav-label">{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
