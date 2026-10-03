import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useConfig } from '../theme/ThemeProvider.jsx';
import { fetchPromotions } from '../lib/api.js';
import Img from './Img.jsx';

/** Promotion modal: bonusName + bonusDescription (line breaks kept). Esc / backdrop / × closes. */
function PromotionModal({ promo, container, onClose }) {
  const { texts } = useConfig();
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // portal to the theme root so the backdrop also covers the header and bottom nav (and keeps the theme vars)
  return createPortal(
    <div className="ta-modal-backdrop" onClick={onClose}>
      <div
        className="ta-modal"
        role="dialog"
        aria-modal="true"
        aria-label={promo.bonusName}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ta-modal-head">
          <h3>{promo.bonusName}</h3>
          <button type="button" className="ta-modal-close" onClick={onClose} aria-label={texts.close}>
            ×
          </button>
        </div>
        <div className="ta-modal-body">{promo.bonusDescription}</div>
      </div>
    </div>,
    container,
  );
}

/** Promotion menu page: list of bonusName + media.coverImage from the promotion API. */
export default function PromotionPage() {
  const { texts } = useConfig();
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    fetchPromotions()
      .then(setList)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <section className="ta-promo-page" ref={ref}>
      <h2 className="ta-promo-title">{texts.promotions}</h2>
      {error ? (
        <p className="ta-promo-note">{texts.promoError}: {error}</p>
      ) : !list ? (
        <p className="ta-promo-note">{texts.promoLoading}</p>
      ) : list.length === 0 ? (
        <p className="ta-promo-note">{texts.promoEmpty}</p>
      ) : (
        <div className="ta-promos">
          {list.map((p, i) => (
            <button type="button" key={`${p.bonusName}-${i}`} className="ta-promo" onClick={() => setOpen(p)}>
              <span className="ta-promo-cover">
                <Img src={p.media?.coverImage} alt={p.bonusName} fallback={<span className="ta-plogo-fallback">%</span>} />
              </span>
              <span className="ta-promo-name">{p.bonusName}</span>
            </button>
          ))}
        </div>
      )}
      {open && (
        <PromotionModal
          promo={open}
          container={ref.current?.closest('.ta-root') || document.body}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
