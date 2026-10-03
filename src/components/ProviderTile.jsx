import { useConfig } from '../theme/ThemeProvider.jsx';
import Icon from './Icon.jsx';
import Img from './Img.jsx';
import TierBadge from './TierBadge.jsx';

/** Provider tile in the category grid. `onSelect` opens it (default: direct launch via onPlay). */
export default function ProviderTile({ provider: p = {}, cta, onSelect, onPlay }) {
  const { texts } = useConfig();
  return (
    <button type="button" className="ta-ptile" onClick={() => (onSelect ? onSelect(p) : onPlay?.(null, p))}>
      <span className="ta-ptile-cover">
        <Img src={p.logoURL} alt={p.providerName} fallback={<span className="ta-plogo-fallback">{p.provider}</span>} />
      </span>
      <span className="ta-ptile-row">
        <span className="ta-ptile-name">{p.providerName}</span>
        <TierBadge tier={p.providerTier} />
      </span>
      <span className="ta-ptile-cta">
        {cta || texts.enter}
        <Icon name="chevron" />
      </span>
    </button>
  );
}
