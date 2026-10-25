import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import NotificationsAPI from '../api/NotificationsAPI';

const NotificationContext = createContext(null);
const api = new NotificationsAPI();
const sessionKey = () => `${localStorage.getItem('token') || ''}:${localStorage.getItem('id') || ''}`;

export function NotificationProvider({ children }) {
  const history = useHistory();
  const location = useLocation();
  const session = useRef(sessionKey());
  const generation = useRef(0);
  const [snapshot, setSnapshot] = useState({ items: [], unreadCount: 0, loading: false, error: '' });
  const mounted = useRef(true);
  const refresh = useCallback(async () => {
    const key = sessionKey();
    if (session.current !== key) {
      session.current = key;
      generation.current++;
      setSnapshot({ items: [], unreadCount: 0, loading: false, error: '' });
    }
    const request = ++generation.current;
    if (!localStorage.getItem('token')) return;
    setSnapshot(previous => ({ ...previous, loading: true }));
    const response = await api.list({ limit: 10 });
    if (!mounted.current || request !== generation.current || key !== sessionKey()) return;
    if (response.ok) setSnapshot({ items: response.data.notifications, unreadCount: response.data.unread_count, loading: false, error: '' });
    else setSnapshot(previous => ({ ...previous, loading: false, error: 'Notifications could not be loaded. Please try again.' }));
  }, []);

  useEffect(() => {
    mounted.current = true;
    const onVisible = () => { if (!document.hidden) refresh(); };
    const timer = setInterval(onVisible, 30000);
    window.addEventListener('focus', onVisible);
    window.addEventListener('storage', onVisible);
    window.addEventListener('notifications:refresh', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      mounted.current = false;
      clearInterval(timer);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('storage', onVisible);
      window.removeEventListener('notifications:refresh', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);
  useEffect(() => { refresh(); }, [location.pathname, refresh]);

  const markRead = useCallback(async id => {
    const key = sessionKey();
    const response = await api.markRead(id);
    if (!response.ok) throw new Error('The notification could not be marked as read. Please try again.');
    if (key !== sessionKey()) return;
    window.dispatchEvent(new Event('notifications:changed'));
    await refresh();
  }, [refresh]);
  const markAllRead = useCallback(async () => {
    const key = sessionKey();
    const response = await api.markAllRead();
    if (!response.ok) throw new Error('Notifications could not be marked as read. Please try again.');
    if (key !== sessionKey()) return;
    window.dispatchEvent(new Event('notifications:changed'));
    await refresh();
  }, [refresh]);
  const openNotification = useCallback(async item => {
    const key = sessionKey();
    if (item.read_status !== 1) await markRead(item.id);
    if (key !== sessionKey()) return;
    const path = item.target_path;
    // Notifications only navigate to this app's known application screens.
    if (path && /^\/(review-form\/\d+|research-presentation-assistance(?:-review)?\?application_id=\d+|research-incentive-(?:request|review)\?application_id=\d+)$/.test(path)) history.push(path);
  }, [history, markRead]);
  return <NotificationContext.Provider value={{ accountId: localStorage.getItem('token') ? localStorage.getItem('id') : null, ...(session.current === sessionKey() && localStorage.getItem('token') ? snapshot : { items: [], unreadCount: 0, loading: false, error: '' }), refresh, markRead, markAllRead, openNotification }}>{children}</NotificationContext.Provider>;
}
export const useNotifications = () => useContext(NotificationContext);
