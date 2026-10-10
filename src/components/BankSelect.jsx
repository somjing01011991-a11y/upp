import { useEffect, useRef, useState } from 'react';
import BankIcon from './BankIcon.jsx';

/**
 * Bank dropdown showing each bank's logo + name (a native <select> can't show images).
 * Keyboard: Enter/Space/↓ opens, ↑/↓ moves, Enter picks, Esc closes.
 */
export default function BankSelect({ banks, value, onChange, invalid, placeholder = 'เลือกธนาคาร' }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const ref = useRef(null);
  const listRef = useRef(null);
  const selected = banks.find((b) => b.BankCode === value);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.children[hi]?.scrollIntoView({ block: 'nearest' });
  }, [open, hi]);

  const openList = () => {
    setHi(Math.max(0, banks.findIndex((b) => b.BankCode === value)));
    setOpen(true);
  };
  const pick = (b) => {
    onChange(b.BankCode);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'ArrowDown') setHi((i) => Math.min(banks.length - 1, i + 1));
    else if (e.key === 'ArrowUp') setHi((i) => Math.max(0, i - 1));
    else if (e.key === 'Enter' && banks[hi]) pick(banks[hi]);
    else return;
    e.preventDefault();
  };

  return (
    <div className="ta-bsel" ref={ref}>
      <button
        type="button"
        className="ta-input ta-bsel-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        {selected ? (
          <>
            <BankIcon code={selected.BankCode} size={28} />
            <span className="ta-bsel-name">{selected.BankName}</span>
          </>
        ) : (
          <span className="ta-bsel-ph">{placeholder}</span>
        )}
        <span className="ta-bsel-caret" aria-hidden="true" />
      </button>
      {open && (
        <ul className="ta-bsel-list" role="listbox" ref={listRef}>
          {banks.map((b, i) => (
            <li
              key={b.BankCode}
              role="option"
              aria-selected={b.BankCode === value}
              className={`ta-bsel-opt${i === hi ? ' is-hi' : ''}${b.BankCode === value ? ' is-on' : ''}`}
              onPointerEnter={() => setHi(i)}
              onClick={() => pick(b)}
            >
              <BankIcon code={b.BankCode} size={28} />
              <span className="ta-bsel-name">{b.BankName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
