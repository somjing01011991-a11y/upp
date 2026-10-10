import { useEffect, useState } from 'react';
import { useConfig } from '../theme/ThemeProvider.jsx';
import { login } from '../lib/api.js';
import Spinner from './Spinner.jsx';

/** Login modal: PhoneNumber + Password → POST /member/login. Shows the API's `msg` when login fails. */
export default function LoginModal({ onSuccess, onClose, onRegister }) {
  const { texts } = useConfig();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      const res = await login(phone.trim(), password);
      if (res.login === true) onSuccess(res);
      else setError(res.msg || texts.loginFailed);
    } catch {
      setError(texts.loginFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ta-modal-backdrop" onClick={onClose}>
      <form
        className="ta-modal ta-login-modal"
        role="dialog"
        aria-modal="true"
        aria-label={texts.login}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="ta-modal-head">
          <h3>{texts.login}</h3>
          <button type="button" className="ta-modal-close" onClick={onClose} aria-label={texts.close}>
            ×
          </button>
        </div>
        <div className="ta-login-body">
          <label className="ta-field">
            <span>{texts.phone}</span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className="ta-field">
            <span>{texts.password}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && (
            <p className="ta-login-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="ta-btn ta-login-submit" disabled={busy}>
            {busy ? (
              <>
                <Spinner size={18} />
                {texts.loggingIn}
              </>
            ) : (
              texts.login
            )}
          </button>
          {onRegister && (
            <p className="ta-login-switch">
              {texts.noAccount}{' '}
              <button type="button" className="ta-link" onClick={onRegister}>
                {texts.register}
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
