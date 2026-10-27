import React from 'react';
import './loader.scss';

export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="portal-loader" role="status" aria-live="polite">
      <span className="portal-loader__spinner" aria-hidden="true" />
      <span className="portal-loader__label">{label}</span>
    </div>
  );
}
