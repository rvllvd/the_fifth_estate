import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// @ts-expect-error CSS side-effect import, handled by Vite
import './styles/main.css';;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);