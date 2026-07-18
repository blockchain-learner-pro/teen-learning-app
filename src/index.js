import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { getCLS, getFCP, getLCP } from 'web-vitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA + offline support
serviceWorkerRegistration.unregister();

// Measure Web Vitals for performance monitoring
// These help track real user experience metrics (CLS, FCP, LCP)
if (process.env.NODE_ENV === 'production') {
  getCLS(console.log);
  getFCP(console.log);
  getLCP(console.log);
}
