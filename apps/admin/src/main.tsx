import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdminProvider } from './context/AdminContext.js';
import { App } from './App.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminProvider>
      <App />
    </AdminProvider>
  </React.StrictMode>
);
