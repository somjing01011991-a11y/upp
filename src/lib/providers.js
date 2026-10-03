/**
 * Accepts the provider API response ({ msg, data }) or just its `data`, where `data` is either
 * a flat list (grouped here by lowercased providerType: SLOT → slot, AFB → afb) or already keyed.
 * Drops non-ACTIVE providers and duplicates inside each key.
 */
export function normalizeProviders(resp) {
  let data = resp && resp.data ? resp.data : resp || {};
  if (Array.isArray(data)) data = groupByType(data);
  const out = {};
  for (const [key, list] of Object.entries(data)) {
    const seen = new Set();
    out[key] = (list || []).filter((p) => {
      if (!p || (p.status && p.status !== 'ACTIVE') || seen.has(p.provider)) return false;
      seen.add(p.provider);
      return true;
    });
  }
  return out;
}

function groupByType(list) {
  const out = {};
  for (const p of list) {
    if (!p || !p.providerType) continue;
    (out[p.providerType.toLowerCase()] ||= []).push(p);
  }
  return out;
}

/** All providers of a sidebar category (joins every API key listed in `category.sources`). */
export function providersFor(category, data) {
  const seen = new Set();
  const list = [];
  for (const src of category.sources || [category.key]) {
    for (const p of data[src] || []) {
      if (!seen.has(p.provider)) {
        seen.add(p.provider);
        list.push(p);
      }
    }
  }
  return list;
}

/** Placeholder games until the real game-list API is connected. */
export function demoGames(provider, n = 8) {
  const tags = ['HOT', 'NEW'];
  return Array.from({ length: n }, (_, i) => ({
    gameCode: `${provider.provider}-${i + 1}`,
    gameName: `${provider.providerName} #${i + 1}`,
    imageURL: '',
    tag: tags[i] || '',
  }));
}

export const formatAmount = (n) =>
  Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
