import React from 'react';
import { FiBell, FiCheck, FiCloudOff, FiLoader, FiRefreshCw } from 'react-icons/fi';

export default function NotificationState({ kind = 'empty', unreadOnly = false, onRetry, loading = false }) {
  const failed = kind === 'error';
  const pending = kind === 'loading';
  return <div className={`notification-state notification-state--${kind}`} role={failed ? 'alert' : 'status'}>
    <span className="notification-state-icon" aria-hidden="true">
      {failed ? <FiCloudOff /> : pending ? <FiLoader className="notification-spinner" /> : <><FiBell /><span className="notification-state-check"><FiCheck /></span></>}
    </span>
    <h3>{failed ? 'Updates are temporarily unavailable' : pending ? 'Checking for updates' : unreadOnly ? 'No unread notifications' : 'You’re all caught up'}</h3>
    <p>{failed ? 'We couldn’t load your notifications. Please try again in a moment.' : pending ? 'Your latest activity will appear here shortly.' : unreadOnly ? 'You’ve read all your updates. Switch off the filter to view your history.' : 'New updates will appear here.'}</p>
    {failed && onRetry && <button type="button" className="notification-retry" disabled={loading} onClick={onRetry}><FiRefreshCw className={loading ? 'notification-spinner' : ''} aria-hidden="true" />{loading ? 'Retrying…' : 'Retry'}</button>}
  </div>;
}
