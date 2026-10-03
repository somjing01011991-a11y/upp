import { useConfig } from '../theme/ThemeProvider.jsx';
import Icon from './Icon.jsx';
import Img from './Img.jsx';

/** Zone 2 (left) — category covers. `cover` image from theme.json, else the icon. */
export default function CategorySidebar({ active, onSelect, categories, counts }) {
  const cfg = useConfig();
  const cats = categories || cfg.categories;
  return (
    <nav className="ta-sidebar" aria-label="หมวดเกม">
      {cats.map((c) => (
        <button
          key={c.key}
          type="button"
          className="ta-cat"
          aria-current={c.key === active ? 'true' : undefined}
          onClick={() => onSelect?.(c.key)}
        >
          <span className="ta-cat-cover">
            <Img src={c.cover} fallback={<Icon name={c.icon || c.key} />} />
          </span>
          <span className="ta-cat-label">{c.label}</span>
          {counts?.[c.key] != null && <span className="ta-cat-count">{counts[c.key]}</span>}
        </button>
      ))}
    </nav>
  );
}
