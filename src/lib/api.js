import sampleProviders from '../data/sampleProviders.js';

const PROVIDER_API = import.meta.env.VITE_PROVIDER_API;
const GAMES_API = import.meta.env.VITE_GAMES_API;

/** Provider list. Uses VITE_PROVIDER_API when set, otherwise the bundled sample. */
export async function fetchProviders() {
  if (!PROVIDER_API) return sampleProviders;
  const res = await fetch(PROVIDER_API);
  if (!res.ok) throw new Error(`Provider API ${res.status}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.msg || 'Provider API error');
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

// เบอร์ที่ถือว่าถูกใช้งานแล้ว (mock) — ลองกรอก 0812345678 เพื่อดูกรณีเบอร์ซ้ำ
const USED_PHONES = ['0812345678', '0899999999'];

/**
 * ตรวจเบอร์โทรก่อนสมัคร: true = ใช้สมัครได้, false = เบอร์ถูกใช้งานแล้ว
 * ตอนนี้เป็น mock — เปลี่ยนเป็นเรียก API จริงที่นี่
 */
export async function checkPhone(phone) {
  await new Promise((r) => setTimeout(r, 400));
  return !USED_PHONES.includes(phone);
}

/** ส่งข้อมูลสมัครสมาชิก (mock) — เปลี่ยนเป็นเรียก API จริงที่นี่ */
export async function register(form) {
  await new Promise((r) => setTimeout(r, 400));
  console.log('register', form);
  return true;
}
