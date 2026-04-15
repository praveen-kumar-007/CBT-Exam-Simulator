
import './src/css/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { registerSW } from 'virtual:pwa-register';

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

if (import.meta.env.PROD) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      window.location.reload();
    },
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
