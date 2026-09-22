import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { MediaPlayerProvider } from './context/MediaPlayerContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './lib/firebase';
import './utils/mediaCoordinator';

// Guard against third-party or cross-origin "Script error." in iframe environments
if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      if (!event.message || event.message === 'Script error.' || event.message === 'Script error') {
        event.stopImmediatePropagation();
        event.preventDefault();
        return true;
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = String(event.reason?.message || event.reason || '');
      if (
        reason.includes('Script error') ||
        reason.includes('AbortError') ||
        reason.includes('NotAllowedError')
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
        return true;
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AdminAuthProvider>
        <MediaPlayerProvider>
          <App />
        </MediaPlayerProvider>
      </AdminAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);

// Register PWA Service Worker for app installability, background lockscreen notifications, and offline cache
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  const registerSW = () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
      console.warn('PWA service worker registration notice:', err);
    });
  };

  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }
}
