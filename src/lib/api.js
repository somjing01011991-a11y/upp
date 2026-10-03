import sampleProviders from '../data/sampleProviders.js';

import { API_SERVER } from '../config/api.js';

const GAMES_API = import.meta.env.VITE_GAMES_API;

/**
 * Provider list: GET {API_SERVER}/member/gameprovider → { msg: true, data: [provider, ...] }.
 * Uses the bundled sample when API_SERVER is empty.
 */
export async function fetchProviders() {
  if (!API_SERVER) return sampleProviders;
  const res = await fetch(`${API_SERVER}/member/gameprovider`);
  if (!res.ok) throw new Error(`Provider API ${res.status}`);
  const json = await res.json();
  if (json.msg !== true) throw new Error(typeof json.msg === 'string' ? json.msg : 'Provider API error');
  return json;
}

/**
 * Games of one provider → [{ gameCode, gameName, imageURL, tag }].
 * Returns null when VITE_GAMES_API is not set (the UI then shows placeholders).
 * Adjust the mapping below to the real response shape once it is known.
 */
export async function fetchGames(provider) {
  if (!GAMES_API) return null;
  const url = GAMES_API.replace('{provider}', encodeURIComponent(provider.provider)).replace(
    '{type}',
    encodeURIComponent(provider.providerType),
  );
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const list = Array.isArray(json) ? json : json.data || [];
  return list.map((g) => ({
    gameCode: g.gameCode ?? g.code ?? g.id,
    gameName: g.gameName ?? g.name,
    imageURL: g.imageURL ?? g.image ?? g.imgUrl ?? '',
    tag: g.tag ?? '',
  }));
}
