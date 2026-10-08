import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// In an embedded iframe (like AI Studio preview), unregister any active service worker
// to prevent reload loops and stale cached asset issues.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (window.self !== window.top) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const reg of registrations) {
          reg.unregister();
        }
      })
      .catch(() => {});
  } else {
    // In standalone browser tab or Android PWA
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        registerSW({ immediate: false });
      })
      .catch(() => {});
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}

