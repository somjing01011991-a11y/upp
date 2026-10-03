import { useConfig } from '../theme/ThemeProvider.jsx';
import { demoGames } from '../lib/providers.js';
import GameCard from './GameCard.jsx';
import Icon from './Icon.jsx';
import Img from './Img.jsx';
import TierBadge from './TierBadge.jsx';

function ProviderLogo({ provider: p }) {
  return (
    <span className="ta-plogo">
      <Img
        src={p.horizontalWhiteURL || p.logoTransparentURL || p.logoURL}
        alt={p.providerName}
        fallback={<span className="ta-plogo-fallback">{p.provider}</span>}
      />
    </span>
  );
}

/** One provider with N games (layout.gamesPerProvider). detailStatus:false → lobby launch. */
export default function ProviderSection({ provider: p = {}, games, count, full, onPlay, onViewAll }) {
  const { layout, texts } = useConfig();
  const n = count || layout.gamesPerProvider || 8;
  const list = (games?.length ? games : demoGames(p, n)).slice(0, n);
  const lobby = p.detailStatus === false;

  return (
    <section className="ta-section" aria-label={p.providerName}>
      <div className="ta-section-head">
        <ProviderLogo provider={p} />
        <span className="ta-section-name">{p.providerName}</span>
        <TierBadge tier={p.providerTier} />
        {!lobby && !full && (
          <button type="button" className="ta-viewall" onClick={() => onViewAll?.(p)}>
            {texts.viewAll}
            <Icon name="chevron" />
          </button>
        )}
      </div>

      {lobby ? (
        <div className="ta-lobby">
          <span>{texts.lobbyHint}</span>
          <button type="button" className="ta-btn" onClick={() => onPlay?.(null, p)}>
            {texts.lobby}
          </button>
        </div>
      ) : (
        <div className="ta-games">
          {list.map((g) => (
            <GameCard key={g.gameCode || g.gameName} game={g} provider={p} onPlay={onPlay} />
          ))}
        </div>
      )}
    </section>
  );
}
