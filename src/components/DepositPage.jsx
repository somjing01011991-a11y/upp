import { useState } from 'react';

const TABS = [
  { key: 'deposit', label: 'ฝาก' },
  { key: 'withdraw', label: 'ถอน' },
];

/** ฝากถอน (/deposit): two tabs, ฝาก first and selected by default. Content not connected yet. */
export default function DepositPage() {
  const [tab, setTab] = useState('deposit');
  const current = TABS.find((t) => t.key === tab);

  return (
    <section className="ta-section ta-dw">
      <h2 className="ta-wallet-title">ฝากถอน</h2>
      <div className="ta-tabs" role="tablist" aria-label="ฝากถอน">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`ta-tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`ta-panel-${t.key}`}
            className={`ta-tab${tab === t.key ? ' is-on' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="ta-tab-panel" role="tabpanel" id={`ta-panel-${tab}`} aria-labelledby={`ta-tab-${tab}`}>
        <p className="ta-wallet-note">หน้า{current.label}ยังไม่ได้เชื่อมข้อมูล</p>
      </div>
    </section>
  );
}
