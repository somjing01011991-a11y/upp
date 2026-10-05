// Page ↔ URL path. Every view has its own address, so reload, back/forward and shared links land on it.
//   /                              หน้าแรก (หมวดแรก)
//   /category/{หมวด}               หน้าแรก เปิดหมวด เช่น /category/casino
//   /category/{หมวด}/{ค่าย}        รายชื่อเกมของค่าย เช่น /category/slot/PGS
//   /promotion /wallet /profile /contact
//   /register?ref=…&pref=…         สมัครสมาชิก
const PAGE_PATH = { promo: '/promotion', wallet: '/wallet', profile: '/profile', contact: '/contact', signup: '/register' };
const PATH_PAGE = Object.fromEntries(Object.entries(PAGE_PATH).map(([k, v]) => [v, k]));

const HOME = { page: 'home', category: null, provider: null };

/** Current location → { page, category, provider } (unknown paths fall back to the home page). */
export function parsePath(pathname = window.location.pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (PATH_PAGE[path]) return { ...HOME, page: PATH_PAGE[path] };
  const m = path.match(/^\/category\/([^/]+)(?:\/([^/]+))?$/);
  if (m) return { page: 'home', category: decodeURIComponent(m[1]), provider: m[2] ? decodeURIComponent(m[2]) : null };
  return HOME;
}

/** { page, category, provider } → path. */
export function toPath({ page, category, provider }) {
  if (page !== 'home') return PAGE_PATH[page] || '/';
  if (!category) return '/';
  const base = `/category/${encodeURIComponent(category)}`;
  return provider ? `${base}/${encodeURIComponent(provider)}` : base;
}
