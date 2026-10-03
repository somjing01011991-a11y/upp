import { forwardRef } from 'react';
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

/** Zone 1 — logo + site name, credit / wallet, user card. No `user` = guest: shows a login button instead. */
const AppHeader = forwardRef(function AppHeader({ web = {}, user, homeHref = '#', onBrandClick, onLogin }, ref) {
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

  const initial = (user.name || user.username || '?').trim().charAt(0);

  return (
    <header className="ta-header" ref={ref}>
      <div className="ta-header-in">
        <a className="ta-brand" href={homeHref} onClick={onBrandClick}>
          <Logo logo={web.logo} name={name} />
          <span className="ta-brand-name">{name}</span>
        </a>

        <div className="ta-user">
          <div className="ta-user-meta">
            <div className="ta-user-name">{user.name}</div>
            <div className="ta-user-sub">
              <span>{user.username}</span>
              {user.userRank && <span className="ta-rank">{user.userRank}</span>}
            </div>
          </div>
          <span className="ta-avatar" aria-hidden="true">{initial}</span>
        </div>

        <div className="ta-stats">
          {header.showCredit && (
            <div className="ta-stat ta-stat--credit">
              <span className="ta-stat-label">{texts.credit}</span>
              <span className="ta-stat-value">{cur} {formatAmount(user.credit)}</span>
            </div>
          )}
          {header.showWallet && (
            <div className="ta-stat ta-stat--wallet">
              <span className="ta-stat-label">{texts.wallet}</span>
              <span className="ta-stat-value">{cur} {formatAmount(user.wallet)}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

export default AppHeader;
