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

// Referral codes from a signup link (/register?ref=…&pref=…), kept in sessionStorage and sent with the signup.
const REF_KEY = 'ta-ref';

/**
 * Store ref/pref when the URL carries either of them (a missing one becomes null).
 * A URL with neither leaves what was stored earlier in this tab untouched.
 */
export function captureReferral(search = window.location.search) {
  const q = new URLSearchParams(search);
  if (!q.has('ref') && !q.has('pref')) return;
  try {
    sessionStorage.setItem(REF_KEY, JSON.stringify({ ref: q.get('ref') || null, pref: q.get('pref') || null }));
  } catch {
    // storage blocked — the signup sends nulls
  }
}

/** { ref, pref } — each null when not set. */
export function loadReferral() {
  try {
    const r = JSON.parse(sessionStorage.getItem(REF_KEY) || 'null');
    return { ref: r?.ref ?? null, pref: r?.pref ?? null };
  } catch {
    return { ref: null, pref: null };
  }
}
