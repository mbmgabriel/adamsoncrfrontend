import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBell, FiCheck } from 'react-icons/fi';
import { useNotifications } from '../../context/NotificationContext';
import NotificationState from './NotificationState';
import './notifications.scss';

export function NotificationItems({ items, onOpen, onRead }) {
  return <ul className="notification-items">{items.map(item => <li key={item.id} className={item.read_status === 1 ? '' : 'is-unread'}>
    <FiBell aria-hidden="true" />
    <div className="notification-item-content">
      {item.target_path ? <button type="button" className="notification-message" onClick={() => onOpen(item)}>{item.notification}</button> : <p className="notification-message">{item.notification}</p>}
      <time dateTime={item.created_at}>{new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.created_at))}</time>
      {item.read_status !== 1 && <span className="notification-unread-label">Unread</span>}
    </div>
    {item.read_status !== 1 && <button type="button" className="notification-read" aria-label={`Mark as read: ${item.notification}`} onClick={() => onRead(item.id)}><FiCheck aria-hidden="true" /><span>Mark read</span></button>}
  </li>)}</ul>;
}

export default function NotificationFeed({ compact = false, onNavigate }) {
  const { items, unreadCount, loading, error, refresh, markRead, markAllRead, openNotification } = useNotifications();
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const perform = async (action, navigate = false) => {
    if (busy) return;
    setBusy(true);
    setActionError('');
    try { await action(); if (navigate) onNavigate?.(); }
    catch (failure) { setActionError(failure.message); }
    finally { setBusy(false); }
  };
  const hasItems = items.length > 0;
  return <section className={`notification-feed${compact ? ' notification-feed--compact' : ''}`} aria-label="Notifications" aria-busy={busy || loading}>
    <div className="notification-feed-heading">
      <div className="notification-heading-title">
        <span className="notification-heading-icon" aria-hidden="true"><FiBell /></span>
        <div><span className="notification-eyebrow">Recent activity</span><h2>Notifications</h2></div>
      </div>
      <div className="notification-heading-actions">
        {(!error || hasItems) && (!loading || hasItems) && <span className={`notification-count${unreadCount === 0 ? ' is-current' : ''}`}>{unreadCount > 0 ? `${unreadCount} unread` : 'Up to date'}</span>}
        {unreadCount > 0 && <button type="button" disabled={busy} onClick={() => perform(markAllRead)}>Mark all read</button>}
      </div>
    </div>
    <div className="notification-feed-body">
      {actionError && <div role="alert" className="notification-error">{actionError}</div>}
      {error && <NotificationState kind="error" loading={loading} onRetry={() => { setActionError(''); refresh(); }} />}
      {!error && loading && !hasItems && <NotificationState kind="loading" />}
      {!error && !loading && !hasItems && <NotificationState />}
      {hasItems && <NotificationItems items={items.slice(0, compact ? 5 : 10)} onOpen={item => perform(() => openNotification(item), true)} onRead={id => perform(() => markRead(id))} />}
    </div>
    <div className="notification-feed-footer"><Link className="notification-view-all" to="/notifications" onClick={onNavigate}>View all notifications<FiArrowRight aria-hidden="true" /></Link></div>
  </section>;
}
