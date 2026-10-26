import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { FiArrowRight, FiBell, FiCheck, FiChevronRight } from 'react-icons/fi';
import { useNotifications } from '../../context/NotificationContext';
import NotificationState from './NotificationState';
import './notifications.scss';

function NotificationRowContent({ item }) {
  const createdAt = new Date(item.created_at);
  return <>
    <span className="notification-row-icon" aria-hidden="true"><FaBell /></span>
    <span className="notification-item-content">
      <time className="notification-timestamp" dateTime={item.created_at}>
        <span className="notification-date">{new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(createdAt)}</span>
        <span className="notification-time">{new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(createdAt)}</span>
      </time>
      <span className="notification-message">{item.notification}</span>
      {item.read_status !== 1 && <span className="notification-unread-label">Unread</span>}
    </span>
    {item.target_path && <FiChevronRight className="notification-row-chevron" aria-hidden="true" />}
  </>;
}

export function NotificationItems({ items, onOpen, onRead }) {
  return <ul className="notification-items">{items.map(item => <li key={item.id} className={[item.read_status !== 1 && 'is-unread', item.target_path && 'is-clickable'].filter(Boolean).join(' ')}>
    {item.target_path
      ? <button type="button" className="notification-row-action" aria-label={item.notification} onClick={() => onOpen(item)}><NotificationRowContent item={item} /></button>
      : <div className="notification-row-action"><NotificationRowContent item={item} /></div>}
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
