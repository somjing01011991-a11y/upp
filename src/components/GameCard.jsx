import { useConfig } from '../theme/ThemeProvider.jsx';
import Icon from './Icon.jsx';
import Img from './Img.jsx';

/** One game: thumbnail, HOT/NEW tag, name, play overlay on hover/focus. */
export default function GameCard({ game = {}, provider = {}, onPlay }) {
  const { texts } = useConfig();
  const num = /#(\d+)$/.exec(game.gameName || '');
  const placeholder = (
    <span className="ta-game-ph">
      <span>{provider.provider}</span>
      {num && <small>#{num[1]}</small>}
    </span>
  );

  return (
    <button type="button" className="ta-game" onClick={() => onPlay?.(game, provider)} title={game.gameName}>
      <span className="ta-game-thumb">
        <Img src={game.imageURL} alt={game.gameName} fallback={placeholder} />
        {game.tag && <span className={`ta-game-tag ta-game-tag--${String(game.tag).toLowerCase()}`}>{game.tag}</span>}
        <span className="ta-game-play">
          <span className="ta-play-btn">
            <Icon name="play" />
            {texts.play}
          </span>
        </span>
      </span>
      <span className="ta-game-name">{game.gameName}</span>
    </button>
  );
}
