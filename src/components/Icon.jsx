/* 24px line icons, stroke = currentColor. Add a key here and reference it from theme.json (icon). */
const ICONS = {
  slot: (<><rect x="3" y="5" width="16" height="14" rx="3" /><path d="M8.5 9v6M13.5 9v6" /><path d="M19 9h2v4" /></>),
  casino: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></>),
  card: (<><rect x="4" y="4" width="10" height="15" rx="2" /><path d="M16 6.5l3.2 1.1a1.5 1.5 0 0 1 .9 1.9l-3.3 10a1.5 1.5 0 0 1-1.9 1l-1.6-.6" /></>),
  fish: (<><path d="M3 12c3-5 9-6 13-3l4-3v12l-4-3c-4 3-10 2-13-3z" /><circle cx="8" cy="11" r="0.9" fill="currentColor" /></>),
  sport: (<><circle cx="12" cy="12" r="9" /><path d="M12 7.5l4 2.9-1.5 4.6h-5L8 10.4z" /><path d="M12 3v4.5M21 10.5h-5M17.5 19.5l-3-4.5M6.5 19.5l3-4.5M3 10.5h5" /></>),
  lotto: (<><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2.5 2.5 0 0 0 0 5v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2.5 2.5 0 0 0 0-5z" /><path d="M15 5v2M15 10.5v2.5M15 16.5v1.5" /></>),
  poker: (<path d="M12 3c-3 4-7 6-7 10a3.5 3.5 0 0 0 6 2.4L10 20h4l-1-4.6A3.5 3.5 0 0 0 19 13c0-4-4-6-7-10z" />),
  cock: (<><path d="M4 4l9 9M20 4l-9 9" /><path d="M6 15l-2.5 2.5 3 3L9 18M18 15l2.5 2.5-3 3L15 18" /></>),
  esport: (<><path d="M7 8h10a4 4 0 0 1 4 4.5l-.6 3.6a2 2 0 0 1-3.5.9L15 15H9l-1.9 2a2 2 0 0 1-3.5-.9L3 12.5A4 4 0 0 1 7 8z" /><path d="M8 10.5v3M6.5 12h3" /><circle cx="16" cy="12" r="1" fill="currentColor" /></>),
  trade: (<><path d="M3 17l5-5 4 3 7-8" /><path d="M15 7h4v4" /></>),
  wallet: (<><path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" /><path d="M16 13.5h2" /></>),
  gift: (<><rect x="3" y="8.5" width="18" height="4" rx="1" /><path d="M5 12.5V20h14v-7.5M12 8.5V20" /><path d="M12 8.5C10.5 4.5 6 4.5 7 7c.6 1.3 5 1.5 5 1.5zm0 0c1.5-4 6-4 5-1.5-.6 1.3-5 1.5-5 1.5z" /></>),
  home: (<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>),
  chat: (<><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" /><path d="M8 11h.01M12 11h.01M16 11h.01" strokeWidth="2.4" /></>),
  chevron: (<path d="M9 6l6 6-6 6" />),
  play: (<path d="M8 5.5l10 6.5-10 6.5z" fill="currentColor" />),
  grid: (<><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>),
};

export default function Icon({ name, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICONS[name] || ICONS.grid}
    </svg>
  );
}
