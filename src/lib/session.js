// Logged-in member, kept in sessionStorage (cleared when the browser tab closes).
const KEY = 'ta-member';

export function loadSession() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(member) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(member));
  } catch {
    // storage blocked (private mode…) — the member stays logged in until reload
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** Login response → the header's user shape. */
export const toHeaderUser = (m) =>
  m && {
    username: m.Username,
    name: [m.Fname, m.Lname].filter(Boolean).join(' '),
    fname: m.Fname,
    userRank: m.Ranking,
    credit: m.CraditGames,
    wallet: m.totalWallet,
    commission: m.totalCommission,
  };
