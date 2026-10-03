import { THEMES } from '../theme/themes.js';

/** ปุ่มเลือกธีมสี — แสดงตัวอย่างสีพื้น / การ์ด / สีหลักของแต่ละธีม */
export default function ThemePicker({ value, onChange, title = 'ธีมสี' }) {
  return (
    <section className="ta-themes">
      <h3 className="ta-themes-title">{title}</h3>
      <div className="ta-themes-list" role="radiogroup" aria-label={title}>
        {THEMES.map((t) => (
          <button
            key={t.key}
            type="button"
            role="radio"
            aria-checked={t.key === value}
            className="ta-theme-opt"
            onClick={() => onChange?.(t.key)}
          >
            <span className="ta-theme-swatch" style={{ background: t.colors.bg, borderColor: t.colors.line }}>
              <span style={{ background: t.colors.card }} />
              <span style={{ background: t.colors.primary }} />
            </span>
            <span className="ta-theme-label">{t.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
