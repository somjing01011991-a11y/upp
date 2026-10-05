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

/**
 * Site config loaded before the page renders: GET {API_SERVER}/member/webconfig → { msg: true, data: [{ company, logo, colors }] }.
 * Returns data[0], or null when API_SERVER is empty.
 */
export async function fetchWebConfig() {
  if (!API_SERVER) return null;
  const res = await fetch(`${API_SERVER}/member/webconfig`);
  if (!res.ok) throw new Error(`Web config API ${res.status}`);
  const json = await res.json();
  if (json.msg !== true) throw new Error(typeof json.msg === 'string' ? json.msg : 'Web config API error');
  return (Array.isArray(json.data) ? json.data[0] : json.data) || null;
}

/**
 * Member login: POST {API_SERVER}/member/login with { PhoneNumber, Password }.
 * Resolves to the response — { login: true, Username, Fname, …, accesstoken } or { login: false, msg }.
 */
export async function login(PhoneNumber, Password) {
  const res = await fetch(`${API_SERVER}/member/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ PhoneNumber, Password }),
  });
  const json = await res.json().catch(() => null);
  if (!json) throw new Error(`Login API ${res.status}`);
  return json;
}

/**
 * Phone check before signup: POST {API_SERVER}/member/checkphonenumber with { PhoneNumber }.
 * Response { verify: true } = not registered yet; false = already used.
 */
export async function checkPhone(PhoneNumber) {
  const res = await fetch(`${API_SERVER}/member/checkphonenumber`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ PhoneNumber }),
  });
  const json = await res.json().catch(() => null);
  if (!json || typeof json.verify !== 'boolean') throw new Error(`Check phone API ${res.status}`);
  return json.verify;
}

/**
 * Signup: POST {API_SERVER}/member/register with
 * { PhoneNumber, Fname, Lname, Channel, Password, LineId, BankCode, AccNumber, ref, pref }.
 * Resolves to the response — { register: true, data: { Username, …, accesstoken } } or { register: false, msg? }.
 */
export async function register(body) {
  const res = await fetch(`${API_SERVER}/member/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!json) throw new Error(`Register API ${res.status}`);
  return json;
}
