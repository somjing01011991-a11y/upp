const LABEL = { starter: 'STARTER', vip: 'VIP', vvip: 'VVIP', exclusive: 'EXCLUSIVE' };

/** Provider tier from `providerTier`; empty tier renders nothing. */
export default function TierBadge({ tier }) {
  const t = String(tier || '').toLowerCase();
  if (!LABEL[t]) return null;
  return <span className={`ta-tier ta-tier--${t}`}>{LABEL[t]}</span>;
}
