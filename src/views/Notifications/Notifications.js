import { FiBell, FiChevronLeft, FiChevronRight, FiMail } from 'react-icons/fi';
import { TABLE_PAGE_SIZE } from '../../constants/pagination';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MainContainer from '../../components/Layout/MainContainer';
import DashboardBackButton from '../../components/Navigation/DashboardBackButton';
import NotificationsAPI from '../../api/NotificationsAPI';
import { useNotifications } from '../../context/NotificationContext';
import NotificationState from '../../components/Notifications/NotificationState';
import { NotificationItems } from '../../components/Notifications/NotificationFeed';

const api = new NotificationsAPI();
export default function Notifications() {
  const { accountId } = useNotifications();
  return <NotificationInbox key={accountId || 'signed-out'} />;
}
function NotificationInbox() {
  const { unreadCount, markRead, markAllRead, openNotification } = useNotifications();
  const [cursors, setCursors] = useState([null]);
  const [unread, setUnread] = useState(false);
  const [state, setState] = useState({ items: [], next: null, loading: true, error: '' });
  const [busy, setBusy] = useState(false);
  const requestId = useRef(0);
  const mounted = useRef(true);
  const cursor = cursors[cursors.length - 1];
  const load = useCallback(async () => {
    const id = ++requestId.current;
    const token = localStorage.getItem('token');
    setState(previous => ({ ...previous, loading: true, error: '' }));
    const response = await api.list({ cursor, unread, limit: TABLE_PAGE_SIZE });
    if (!mounted.current || id !== requestId.current || token !== localStorage.getItem('token')) return;
    if (response.ok) setState({ items: response.data.notifications, next: response.data.next_cursor, loading: false, error: '' });
    else setState(previous => ({ ...previous, loading: false, error: 'Notifications could not be loaded. Please try again.' }));
  }, [cursor, unread]);
  useEffect(() => {
    mounted.current = true;
    load();
    const visibleLoad = () => { if (!document.hidden) load(); };
    const timer = setInterval(visibleLoad, 30000);
    window.addEventListener('notifications:changed', visibleLoad);
    window.addEventListener('focus', visibleLoad);
    document.addEventListener('visibilitychange', visibleLoad);
    return () => {
      mounted.current = false;
      clearInterval(timer);
      window.removeEventListener('notifications:changed', visibleLoad);
      window.removeEventListener('focus', visibleLoad);
      document.removeEventListener('visibilitychange', visibleLoad);
    };
  }, [load]);
  const perform = async action => {
    if (busy) return;
    setBusy(true);
    try { await action(); } catch (error) { setState(previous => ({ ...previous, error: error.message })); }
    finally { setBusy(false); }
  };
  const changeFilter = nextUnread => {
    if (nextUnread === unread) return;
    setUnread(nextUnread);
    setCursors([null]);
    setState({ items: [], next: null, loading: true, error: '' });
  };
  return <MainContainer><div className="notification-page">
    <DashboardBackButton />
    <section className="notification-feed" aria-label="Notification inbox" aria-busy={busy}>
      <div className="notification-feed-heading"><div><span>Your activity</span><h1>Notifications</h1><p>{unreadCount} unread</p></div>
        <button type="button" disabled={busy || unreadCount === 0} onClick={() => perform(markAllRead)}>Mark all read</button></div>
      <div className="notification-toolbar">
        <div className="notification-filter" role="group" aria-label="Filter notifications">
          <button type="button" aria-label="All notifications" aria-pressed={!unread} onClick={() => changeFilter(false)}><FiBell aria-hidden="true" />All</button>
          <button type="button" aria-label="Unread notifications" aria-pressed={unread} onClick={() => changeFilter(true)}><FiMail aria-hidden="true" />Unread<span className="notification-filter-count" aria-hidden="true">{unreadCount}</span></button>
        </div>
        <span className="notification-filter-description">{unread ? 'Showing unread updates' : 'All your recent updates'}</span>
      </div>
      {state.error && <NotificationState kind="error" loading={state.loading} onRetry={load} />}
      {state.loading && !state.error && !state.items.length && <NotificationState kind="loading" />}
      {!state.loading && !state.error && !state.items.length && <NotificationState unreadOnly={unread} />}
      <NotificationItems items={state.items} onOpen={item => perform(() => openNotification(item))} onRead={id => perform(() => markRead(id))} />
      <div className="notification-inbox-footer">
        <span className="notification-page-summary" role="status">{state.loading ? 'Updating notifications…' : `${state.items.length} ${state.items.length === 1 ? 'notification' : 'notifications'} on this page`}</span>
        <nav className="notification-pagination" aria-label="Notification pages">
          <button type="button" disabled={state.loading || cursors.length === 1} onClick={() => setCursors(values => values.slice(0, -1))}><FiChevronLeft aria-hidden="true" />Newer</button>
          <span className="notification-page-indicator" aria-current="page">Page {cursors.length}</span>
          <button type="button" disabled={state.loading || !state.next} onClick={() => setCursors(values => [...values, state.next])}>Older<FiChevronRight aria-hidden="true" /></button>
        </nav>
      </div>
    </section>
  </div></MainContainer>;
}
