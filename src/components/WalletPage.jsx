import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchWallet } from '../lib/api.js';
import { formatAmount } from '../lib/providers.js';
import BonusSelectModal from './BonusSelectModal.jsx';
import Spinner from './Spinner.jsx';

const pad = (n) => String(n).padStart(2, '0');
/** ISO date → "Y-m-d H:mm" in the browser's local time. */
export function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${d.getHours()}:${pad(d.getMinutes())}`;
}

/**
 * กระเป๋าเงิน (/wallet): POST /member/wallet with the session's Username + accesstoken,
 * one row per item — amount, date, "ใช้งาน" button (opens the bonus choice).
 * `access: denied` → onDenied (logout + login). onUse(item, bonusID | null) after a successful use.
 */
export default function WalletPage({ member, onLogin, onDenied, onUse }) {
  const [list, setList] = useState(null);
  const [using, setUsing] = useState(null); // wallet item whose bonus choice is open
  const [done, setDone] = useState(false); // "ทำรายการสำเร็จ" popup
  const [reload, setReload] = useState(0);
  const ref = useRef(null);
  const [error, setError] = useState('');
  const username = member?.Username;
  const token = member?.accesstoken;

  useEffect(() => {
    if (!username || !token) return undefined;
    let cancelled = false;
    if (!reload) setList(null); // keep the old list on screen while refreshing after a use
    setError('');
    fetchWallet(username, token)
      .then((res) => {
        if (cancelled) return;
        if (res.msg === true) setList(Array.isArray(res.data) ? res.data : []);
        else if (res.access === 'denied') onDenied?.();
        else setError(typeof res.msg === 'string' ? res.msg : 'โหลดกระเป๋าเงินไม่สำเร็จ');
      })
      .catch(() => !cancelled && setError('โหลดกระเป๋าเงินไม่สำเร็จ ลองใหม่อีกครั้ง'));
    return () => {
      cancelled = true;
    };
  }, [username, token, reload]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="ta-section ta-wallet" ref={ref}>
      <h2 className="ta-wallet-title">กระเป๋าเงิน</h2>
      {!member ? (
        <div className="ta-wallet-note">
          <p>กรุณาเข้าสู่ระบบเพื่อดูกระเป๋าเงิน</p>
          <button type="button" className="ta-btn ta-login-submit" onClick={onLogin}>
            เข้าสู่ระบบ
          </button>
        </div>
      ) : error ? (
        <p className="ta-wallet-note">{error}</p>
      ) : !list ? (
        <Spinner block label="กำลังโหลด…" />
      ) : list.length === 0 ? (
        <p className="ta-wallet-note">ไม่มีรายการ</p>
      ) : (
        <ul className="ta-wallet-list">
          {list.map((w) => (
            <li key={w.refID || `${w.TransactionDate}-${w.amount}`} className="ta-wallet-item">
              <div className="ta-wallet-info">
                <span className="ta-wallet-amount">฿ {formatAmount(w.amount)}</span>
                <time className="ta-wallet-date" dateTime={w.TransactionDate}>
                  {formatDateTime(w.TransactionDate)}
                </time>
              </div>
              <button type="button" className="ta-btn ta-wallet-use" onClick={() => setUsing(w)}>
                ใช้งาน
              </button>
            </li>
          ))}
        </ul>
      )}
      {done &&
        createPortal(
          <div className="ta-modal-backdrop" onClick={() => setDone(false)}>
            <div
              className="ta-modal ta-alert-modal"
              role="alertdialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <p>ทำรายการสำเร็จ</p>
              <button type="button" className="ta-btn ta-login-submit" onClick={() => setDone(false)} autoFocus>
                ตกลง
              </button>
            </div>
          </div>,
          ref.current?.closest('.ta-root') || document.body,
        )}
      {using && member && (
        <BonusSelectModal
          member={member}
          item={using}
          container={ref.current?.closest('.ta-root') || document.body}
          onDenied={onDenied}
          onClose={() => setUsing(null)}
          onDone={(bonusID) => {
            setUsing(null);
            setDone(true);
            setReload((n) => n + 1); // the used item drops off the list
            onUse?.(using, bonusID);
          }}
        />
      )}
    </section>
  );
}
