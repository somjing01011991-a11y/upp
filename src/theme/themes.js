import darkRed from '../config/themes/dark-red.json';
import light from '../config/themes/light.json';
import darkPurple from '../config/themes/dark-purple.json';
import baseTheme from '../config/theme.json';

/** ธีมสีที่ผู้ใช้เลือกได้ — `default` คือสีเดิมใน theme.json */
export const THEMES = [
  { key: 'default', label: 'ทองดำ (ค่าเริ่มต้น)', colors: baseTheme.colors },
  darkRed,
  light,
  darkPurple,
];

const STORAGE_KEY = 'ta-theme';

export const findTheme = (key) => THEMES.find((t) => t.key === key) || THEMES[0];

export function loadThemeKey() {
  try {
    return findTheme(localStorage.getItem(STORAGE_KEY)).key;
  } catch {
    return THEMES[0].key;
  }
}

export function saveThemeKey(key) {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // ignore (private mode / storage blocked)
  }
}

/** ตั้ง data-theme บน <html> ให้ไฟล์ CSS ของธีม (styles/themes/*.css) ทำงาน + สีแถบเบราว์เซอร์ */
export function applyDocumentTheme(key) {
  const t = findTheme(key);
  const root = document.documentElement;
  if (t.key === 'default') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', t.key);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.colors.surface);
}
