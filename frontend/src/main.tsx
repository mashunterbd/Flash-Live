import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';
import { frontendLogger } from './utils/errorLogger.js';
import { syncClientConfig } from './services/appwrite.js';

// Initialize frontend automatic error logging
frontendLogger.init();

// Sync dynamic configuration from backend
syncClientConfig();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

