import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/app.css';
import './styles/themes/index.css';
import { applyDocumentTheme, loadThemeKey } from './theme/themes.js';

// ใส่ธีมที่บันทึกไว้ก่อน render เพื่อไม่ให้สีกระพริบ
applyDocumentTheme(loadThemeKey());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
