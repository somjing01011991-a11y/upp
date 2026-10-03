import { useConfig } from '../theme/ThemeProvider.jsx';
import Icon from './Icon.jsx';
import Img from './Img.jsx';
import TierBadge from './TierBadge.jsx';

/** Provider as a direct-launch tile — categories with display: "providers" (sport, lotto…). */
export default function ProviderTile({ provider: p = {}, onPlay }) {
  const { texts } = useConfig();
  return (
    <button type="button" className="ta-ptile" onClick={() => onPlay?.(null, p)}>
      <span className="ta-ptile-cover">
        <Img src={p.logoURL} alt={p.providerName} fallback={<span className="ta-plogo-fallback">{p.provider}</span>} />
      </span>
      <span className="ta-ptile-row">
        <span className="ta-ptile-name">{p.providerName}</span>
        <TierBadge tier={p.providerTier} />
      </span>
      <span className="ta-ptile-cta">
        {texts.enter}
        <Icon name="chevron" />
      </span>
    </button>
  );
}
