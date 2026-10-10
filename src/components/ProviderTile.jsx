import Img from './Img.jsx';
import TierBadge from './TierBadge.jsx';

/** Provider tile in the category grid: logo with the tier badge on its top-left corner, full name. `onSelect` opens it (default: direct launch via onPlay). */
export default function ProviderTile({ provider: p = {}, onSelect, onPlay }) {
  return (
    <button type="button" className="ta-ptile" onClick={() => (onSelect ? onSelect(p) : onPlay?.(null, p))}>
      <span className="ta-ptile-cover">
        <Img src={p.logoURL} alt={p.providerName} fallback={<span className="ta-plogo-fallback">{p.provider}</span>} />
        <span className="ta-ptile-tier">
          <TierBadge tier={p.providerTier} />
        </span>
      </span>
      <span className="ta-ptile-name">{p.providerName}</span>
    </button>
  );
}
