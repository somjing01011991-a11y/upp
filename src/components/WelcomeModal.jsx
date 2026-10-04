import { useEffect } from 'react';

/** Shown once after a successful signup: "สมัครสมาชิกสำเร็จ" + "ยินดีต้อนรับสู่ {site name}". */
export default function WelcomeModal({ siteName, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="ta-modal-backdrop" onClick={onClose}>
      <div
        className="ta-modal ta-welcome-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ta-welcome-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ta-welcome-check" aria-hidden="true">✓</div>
        <h3 id="ta-welcome-title">สมัครสมาชิกสำเร็จ</h3>
        <p>
          ยินดีต้อนรับสู่ <b>{siteName}</b>
        </p>
        <button type="button" className="ta-btn ta-login-submit" onClick={onClose} autoFocus>
          ตกลง
        </button>
      </div>
    </div>
  );
}
