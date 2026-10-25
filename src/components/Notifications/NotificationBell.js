import React, { useEffect, useRef, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import NotificationFeed from './NotificationFeed';

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);
  useEffect(() => {
    if (!open) return;
    const outside = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <div className="notification-bell" ref={root}>
    <button type="button" ref={trigger} className="notification-bell-button" aria-label={`Notifications, ${unreadCount} unread`} aria-expanded={open} aria-controls="notification-popover" onClick={() => setOpen(value => !value)}>
      <FiBell aria-hidden="true" />{unreadCount > 0 && <span className="notification-badge" aria-hidden="true">{unreadCount > 99 ? '99+' : unreadCount}</span>}
    </button>
    {open && <div id="notification-popover" className="notification-popover"><NotificationFeed compact onNavigate={() => setOpen(false)} /></div>}
  </div>;
}
