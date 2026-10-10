import { useEffect } from 'react';
import { formatAmount } from '../lib/providers.js';

/** "มียอด ฿x เข้ากระเป๋าเงิน" — shown when the balance check sees the wallet go up. */
export default function DepositModal({ amount, onView, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="ta-modal-backdrop ta-deposit-backdrop" onClick={onClose}>
      <div className="ta-modal ta-alert-modal" role="alertdialog" aria-modal="true" aria-labelledby="ta-deposit-title" onClick={(e) => e.stopPropagation()}>
        <h3 id="ta-deposit-title" className="ta-deposit-title">แจ้งเตือน</h3>
        <p>
          มียอด <b className="ta-deposit-amount">฿ {formatAmount(amount)}</b> เข้ากระเป๋าเงิน
        </p>
        <div className="ta-deposit-actions">
          <button type="button" className="ta-btn ta-deposit-close" onClick={onClose}>
            ปิด
          </button>
          <button type="button" className="ta-btn ta-login-submit" onClick={onView} autoFocus>
            คลิกดู
          </button>
        </div>
      </div>
    </div>
  );
}
