import { BANK_ICONS, BANK_ICON_ALIAS } from '../data/bankIcons.js';

/** Bank logo on its brand color. Unknown codes fall back to the code's first letters. */
export default function BankIcon({ code, size = 40 }) {
  const icon = BANK_ICONS[BANK_ICON_ALIAS[code] || code];
  if (!icon) {
    return (
      <span className="ta-bank-icon ta-bank-icon--mono" style={{ width: size, height: size }} aria-hidden="true">
        {String(code).slice(0, 2)}
      </span>
    );
  }
  return (
    <span className="ta-bank-icon" style={{ width: size, height: size, background: icon.color }} aria-hidden="true">
      <svg viewBox={icon.viewBox || '0 0 128 128'} className={icon.viewBox ? 'is-wide' : undefined} dangerouslySetInnerHTML={{ __html: icon.svg }} />
    </span>
  );
}
