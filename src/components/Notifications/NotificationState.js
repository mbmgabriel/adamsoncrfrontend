import React from 'react';
import { FiBell, FiCheck, FiCloudOff, FiRefreshCw } from 'react-icons/fi';
import Loader from '../Loader/Loader';

export default function NotificationState({ kind = 'empty', unreadOnly = false, onRetry, loading = false }) {
  const failed = kind === 'error';
  const pending = kind === 'loading';
  if (pending) return <div className="notification-state notification-state--loading">
    <Loader label="Checking for updates" />
    <p>Your latest activity will appear here shortly.</p>
  </div>;
  return <div className={`notification-state notification-state--${kind}`} role={failed ? 'alert' : 'status'}>
    <span className="notification-state-icon" aria-hidden="true">
      {failed ? <FiCloudOff /> : <><FiBell /><span className="notification-state-check"><FiCheck /></span></>}
    </span>
    <h3>{failed ? 'Updates are temporarily unavailable' : unreadOnly ? 'No unread notifications' : 'You’re all caught up'}</h3>
    <p>{failed ? 'We couldn’t load your notifications. Please try again in a moment.' : unreadOnly ? 'You’ve read all your updates. Switch off the filter to view your history.' : 'New updates will appear here.'}</p>
    {failed && onRetry && <button type="button" className="notification-retry" disabled={loading} onClick={onRetry}><FiRefreshCw className={loading ? 'notification-spinner' : ''} aria-hidden="true" />{loading ? 'Retrying…' : 'Retry'}</button>}
  </div>;
}
