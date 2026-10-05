import { useEffect } from 'react';
import { formatAmount } from '../lib/providers.js';
import Spinner from './Spinner.jsx';

/**
 * Full-screen game: a slim top bar ("ออก" on the left, username + credit on the right) over the
 * launch URL in an iframe. `url` null = still asking the API for it.
 */
export default function GamePlayer({ url, member, onExit }) {
  // the page underneath must not scroll while the game covers it
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="ta-player" role="dialog" aria-modal="true" aria-label="เล่นเกม">
      <div className="ta-player-bar">
        <button type="button" className="ta-player-exit" onClick={onExit}>
          <span aria-hidden="true">‹</span> ออก
        </button>
        {member && (
          <div className="ta-player-user">
            <span className="ta-player-name">{member.Username}</span>
            <span className="ta-player-credit">เครดิต ฿ {formatAmount(member.CraditGames)}</span>
          </div>
        )}
      </div>
      {url ? (
        <iframe className="ta-player-frame" src={url} title="game" allow="autoplay; fullscreen; clipboard-write" allowFullScreen />
      ) : (
        <div className="ta-player-wait" role="status">
          <Spinner size={32} />
          กำลังเข้าเกม…
        </div>
      )}
    </div>
  );
}
