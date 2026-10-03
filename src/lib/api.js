import sampleProviders from '../data/sampleProviders.js';

import { API_SERVER } from '../config/api.js';

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
 * Provider types to show in the sidebar: GET {API_SERVER}/member/providertype → { msg: true, data: ['SLOT', ...] }.
 * Returns null (show every type) when API_SERVER is empty.
 */
export async function fetchProviderTypes() {
  if (!API_SERVER) return null;
  const res = await fetch(`${API_SERVER}/member/providertype`);
  if (!res.ok) throw new Error(`Provider type API ${res.status}`);
  const json = await res.json();
  if (json.msg !== true || !Array.isArray(json.data)) {
    throw new Error(typeof json.msg === 'string' ? json.msg : 'Provider type API error');
  }
  return json.data;
}

/**
 * Games of one provider: GET {API_SERVER}/member/gamelistprovider/{provider} → { msg: true, data: [game, ...] }.
 * Returns [{ gameCode, gameName, imageURL, tag }] of ACTIVE games, or null when API_SERVER is empty
 * (the UI then shows placeholders).
 */
export async function fetchGames(provider) {
  if (!API_SERVER) return null;
  const res = await fetch(`${API_SERVER}/member/gamelistprovider/${encodeURIComponent(provider.provider)}`);
  if (!res.ok) throw new Error(`Game list API ${res.status}`);
  const json = await res.json();
  if (json.msg !== true) throw new Error(typeof json.msg === 'string' ? json.msg : 'Game list API error');
  return (json.data || [])
    .filter((g) => g && (!g.status || g.status === 'ACTIVE'))
    .map((g) => ({
      gameCode: g.id,
      gameName: g.gameName,
      imageURL: g.image?.square || g.image?.horizontal || g.image?.vertical || '',
      tag: '',
    }));
}

/**
 * Promotions: GET {API_SERVER}/member/promotion → { msg: true, data: [promotion, ...] }.
 * Returns [] when API_SERVER is empty.
 */
export async function fetchPromotions() {
  if (!API_SERVER) return [];
  const res = await fetch(`${API_SERVER}/member/promotion`);
  if (!res.ok) throw new Error(`Promotion API ${res.status}`);
  const json = await res.json();
  if (json.msg !== true) throw new Error(typeof json.msg === 'string' ? json.msg : 'Promotion API error');
  return json.data || [];
}
