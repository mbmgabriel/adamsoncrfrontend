import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/index.scss';
import 'react-bootstrap'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);