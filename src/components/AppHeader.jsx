import { forwardRef, useEffect, useRef, useState } from 'react';
import { useConfig } from '../theme/ThemeProvider.jsx';
import { formatAmount } from '../lib/providers.js';
import Img from './Img.jsx';

function Logo({ logo, name = '' }) {
  const mono =
    name.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'A';
  const monoEl = <span className="ta-logo-mono">{mono}</span>;

  if (typeof logo === 'string' && /^\s*<svg[\s>]/i.test(logo)) {
    return (
      <span className="ta-logo">
        <span className="ta-logo-svg" dangerouslySetInnerHTML={{ __html: logo }} />
      </span>
    );
  }
  if (typeof logo === 'string' && logo && logo !== 'img/svg') {
    return (
      <span className="ta-logo">
        <Img src={logo} alt={name} fallback={<span className="ta-logo ta-logo--mono">{monoEl}</span>} />
      </span>
    );
  }
  return <span className="ta-logo ta-logo--mono">{monoEl}</span>;
}

/** Avatar (first letter of the first name) with a dropdown holding "log out". */
function AvatarMenu({ initial, onLogout }) {
  const { texts } = useConfig();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <span className="ta-avatar-wrap" ref={ref}>
      <button
        type="button"
        className="ta-avatar"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={texts.account}
        onClick={() => setOpen((v) => !v)}
      >
        {initial}
      </button>
      {open && (
        <div className="ta-menu" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
          >
            {texts.logout}
          </button>
        </div>
      )}
    </span>
  );
}

/** Zone 1 — logo + site name, credit / wallet / commission, user card. No `user` = guest: a login button instead. */
const AppHeader = forwardRef(function AppHeader({ web = {}, user, homeHref = '#', onBrandClick, onLogin, onLogout, onWallet }, ref) {
  const { header, texts } = useConfig();
  const cur = header.currency || '';
  const name = web.Name || web.name;

  if (!user) {
    return (
      <header className="ta-header" ref={ref}>
        <div className="ta-header-in">
          <a className="ta-brand" href={homeHref} onClick={onBrandClick}>
            <Logo logo={web.logo} name={name} />
            <span className="ta-brand-name">{name}</span>
          </a>
          <button type="button" className="ta-btn ta-login" onClick={onLogin}>
            {texts.login}
          </button>
        </div>
      </header>
    );
  }

  const initial = (user.fname || user.name || user.username || '?').trim().charAt(0);

  return (
    <header className="ta-header" ref={ref}>
      <div className="ta-header-in">
        <a className="ta-brand" href={homeHref} onClick={onBrandClick}>
          <Logo logo={web.logo} name={name} />
          <span className="ta-brand-name">{name}</span>
        </a>

        <div className="ta-user">
          <div className="ta-user-meta">
            <div className="ta-user-name">{user.username}</div>
            {user.userRank && (
              <div className="ta-user-sub">
                <span className="ta-rank">{user.userRank}</span>
              </div>
            )}
          </div>
          <AvatarMenu initial={initial} onLogout={onLogout} />
        </div>

        <div className="ta-stats">
          {header.showCredit && (
            <div className="ta-stat ta-stat--credit">
              <span className="ta-stat-label">{texts.credit}</span>
              <span className="ta-stat-value">{cur} {formatAmount(user.credit)}</span>
            </div>
          )}
          {header.showWallet && (
            <button type="button" className="ta-stat ta-stat--wallet ta-stat--link" onClick={onWallet}>
              <span className="ta-stat-label">{texts.wallet}</span>
              <span className="ta-stat-value">{cur} {formatAmount(user.wallet)}</span>
            </button>
          )}
          {header.showCommission !== false && (
            <div className="ta-stat ta-stat--commission">
              <span className="ta-stat-label">{texts.commission}</span>
              <span className="ta-stat-value">{cur} {formatAmount(user.commission)}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

export default AppHeader;
