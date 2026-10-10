import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { selectBonus } from '../lib/api.js';
import { formatAmount } from '../lib/providers.js';
import Img from './Img.jsx';
import Spinner from './Spinner.jsx';

const TURNOVER_TYPE = { credit: 'เครดิต', winloss: 'ยอดได้เสีย', bet: 'ยอดเดิมพัน' };
const GAME_TYPE = { sports: 'กีฬา', slots: 'สล็อต', casino: 'คาสิโน', card: 'เกมไพ่', fish: 'ยิงปลา', lotto: 'หวย' };
const label = (map, v) => map[String(v).toLowerCase()] || v;

function Row({ name, children }) {
  return (
    <div className="ta-bonus-row">
      <dt>{name}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** One option: title, figures, "ดูรายละเอียด" (expands the description) and "เลือก". */
function Option({ title, cover, rows, description, onSelect }) {
  const [more, setMore] = useState(false);
  return (
    <li className="ta-bonus">
      <div className="ta-bonus-head">
        {cover !== undefined && (
          <span className="ta-bonus-cover">
            <Img src={cover} alt="" fallback={<span className="ta-plogo-fallback">%</span>} />
          </span>
        )}
        <h4>{title}</h4>
      </div>
      <dl className="ta-bonus-rows">{rows}</dl>
      {more && description && <p className="ta-bonus-desc">{description}</p>}
      <div className="ta-bonus-actions">
        {description && (
          <button type="button" className="ta-link" onClick={() => setMore((v) => !v)} aria-expanded={more}>
            {more ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
          </button>
        )}
        <button type="button" className="ta-btn ta-bonus-pick" onClick={onSelect}>
          เลือก
        </button>
      </div>
    </li>
  );
}

/**
 * Bonus choice for one wallet item: POST /member/selectbonus { Username, accesstoken, refID }.
 * First "ไม่รับโบนัส" (nobonus), then "รับโบนัส" with every bonus. onSelect(bonusID | null).
 */
export default function BonusSelectModal({ member, item, container, onSelect, onDenied, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    selectBonus({ Username: member.Username, accesstoken: member.accesstoken, refID: item.refID })
      .then((res) => {
        if (cancelled) return;
        if (res.msg === true) setData(res);
        else if (res.access === 'denied') onDenied?.();
        else setError(typeof res.error === 'string' && res.error ? res.error : 'โหลดรายการโบนัสไม่สำเร็จ');
      })
      .catch(() => !cancelled && setError('โหลดรายการโบนัสไม่สำเร็จ ลองใหม่อีกครั้ง'));
    return () => {
      cancelled = true;
    };
  }, [item.refID]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const nb = data?.nobonus;
  const bonuses = Array.isArray(data?.bonus) ? data.bonus : [];

  return createPortal(
    <div className="ta-modal-backdrop" onClick={onClose}>
      <div className="ta-modal ta-bonus-modal" role="dialog" aria-modal="true" aria-label="เลือกโบนัส" onClick={(e) => e.stopPropagation()}>
        <div className="ta-modal-head">
          <h3>เลือกโบนัส · ฿ {formatAmount(item.amount)}</h3>
          <button type="button" className="ta-modal-close" onClick={onClose} aria-label="ปิด">
            ×
          </button>
        </div>
        <div className="ta-bonus-body">
          {error ? (
            <p className="ta-wallet-note">{error}</p>
          ) : !data ? (
            <Spinner block label="กำลังโหลด…" />
          ) : (
            <>
              {nb && (
                <ul className="ta-bonus-list">
                  <Option
                    title="ไม่รับโบนัส"
                    rows={
                      <>
                        <Row name="ยอดเครดิต">฿ {formatAmount(nb.amount)}</Row>
                        <Row name="ถอนสูงสุด">฿ {formatAmount(nb.maxWithdraw)}</Row>
                      </>
                    }
                    description={nb.Description}
                    onSelect={() => onSelect(null)}
                  />
                </ul>
              )}
              {bonuses.length > 0 && (
                <>
                  <h4 className="ta-bonus-section">รับโบนัส</h4>
                  <ul className="ta-bonus-list">
                    {bonuses.map((b) => (
                      <Option
                        key={b.bonusID}
                        title={b.bonusName}
                        cover={b.media?.coverImage || ''}
                        rows={
                          <>
                            <Row name="โบนัสที่ได้รับสูงสุด">฿ {formatAmount(b.maxReceiveLimit)}</Row>
                            <Row name="รวม">฿ {formatAmount(b.totalCredit)}</Row>
                            <Row name="ถอนสูงสุด">฿ {formatAmount(b.maxWithdraw)}</Row>
                            <Row name="ประเภทเทิร์นโอเวอร์">{label(TURNOVER_TYPE, b.turnoverType)}</Row>
                            <Row name="จำนวนเทิร์นโอเวอร์">{Number(b.turnoverRequired || 0).toLocaleString('th-TH')}</Row>
                            <Row name="ประเภทเกมที่เล่นได้">{(b.gameTypes || []).map((g) => label(GAME_TYPE, g)).join(', ')}</Row>
                          </>
                        }
                        description={b.bonusDescription}
                        onSelect={() => onSelect(b.bonusID)}
                      />
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    container,
  );
}
