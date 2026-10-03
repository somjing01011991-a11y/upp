import { createContext, useContext, useMemo } from 'react';
import defaultConfig from '../config/theme.json';

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

/** Deep-merge `over` onto `base` (arrays are replaced, not merged). */
export function mergeConfig(base, over) {
  if (!isObj(over)) return base;
  const out = { ...base };
  for (const k of Object.keys(over)) {
    out[k] = isObj(base[k]) && isObj(over[k]) ? mergeConfig(base[k], over[k]) : over[k];
  }
  return out;
}

const kebab = (s) => String(s).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** JSON → CSS custom properties: colors.* → --c-*, radius.* → --r-*, layout.* → --l-*, font.* → --f-* */
export function configToVars(cfg) {
  const prefix = { colors: '--c-', radius: '--r-', layout: '--l-', font: '--f-' };
  const vars = {};
  for (const [group, p] of Object.entries(prefix)) {
    for (const [k, val] of Object.entries(cfg[group] || {})) {
      if (val === '' || val == null || typeof val === 'object') continue;
      vars[p + kebab(k)] = String(val);
    }
  }
  return vars;
}

const ConfigContext = createContext(defaultConfig);

/** Read the merged config (texts, categories, nav, header…) from any component. */
export const useConfig = () => useContext(ConfigContext);

export function ThemeProvider({ config, className = '', style, children }) {
  const cfg = useMemo(() => mergeConfig(defaultConfig, config), [config]);
  const vars = useMemo(() => configToVars(cfg), [cfg]);
  return (
    <ConfigContext.Provider value={cfg}>
      <div className={`ta-root ${className}`.trim()} style={{ ...vars, ...style }}>
        {children}
      </div>
    </ConfigContext.Provider>
  );
}

export { defaultConfig };
