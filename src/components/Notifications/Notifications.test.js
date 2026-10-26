/* eslint-disable testing-library/no-unnecessary-act -- Native React roots require act. */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useHistory, useLocation } from 'react-router-dom';
import { NotificationProvider } from '../../context/NotificationContext';
import NotificationFeed from './NotificationFeed';
import NotificationBell from './NotificationBell';
import NotificationInbox from '../../views/Notifications/Notifications';
jest.mock('../Layout/MainContainer', () => ({ children }) => <div>{children}</div>);

const mockList = jest.fn();
const mockRead = jest.fn();
const mockReadAll = jest.fn();
jest.mock('../../api/NotificationsAPI', () => class {
  list(options) { return mockList(options); }
  markRead(id) { return mockRead(id); }
  markAllRead() { return mockReadAll(); }
});
let navigate, root, container;
function RouteProbe() {
  navigate = useHistory();
  const location = useLocation();
  return <span id="current-path">{location.pathname}{location.search}</span>;
}
async function renderInbox() {
  await act(async () => root.render(<MemoryRouter initialEntries={['/dashboard']}><NotificationProvider><RouteProbe /><NotificationBell /><NotificationFeed /></NotificationProvider></MemoryRouter>));
}
const button = text => [...container.querySelectorAll('button')].find(item => item.textContent === text || item.getAttribute('aria-label') === text);
const sample = { id: 1, notification: 'Proposal ready for review', created_at: '2026-10-25T12:00:00Z', read_status: 0, target_path: '/review-form/92' };
const result = (items = [sample]) => ({ ok: true, data: { notifications: items, unread_count: items.filter(item => item.read_status !== 1).length, next_cursor: null } });
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  localStorage.clear();
  localStorage.setItem('token', 'account-a-token');
  localStorage.setItem('id', '1');
  mockList.mockReset().mockResolvedValue(result());
  mockRead.mockReset().mockResolvedValue({ ok: true });
  mockReadAll.mockReset().mockResolvedValue({ ok: true });
});
afterEach(() => { act(() => root.unmount()); container.remove(); });

test('shows real notifications and synchronizes the bell after reading', async () => {
  await renderInbox();
  expect(button('Notifications, 1 unread')).toBeDefined();
  mockList.mockResolvedValue(result([{ ...sample, read_status: 1 }]));
  await act(async () => button(`Mark as read: ${sample.notification}`).click());
  expect(mockRead).toHaveBeenCalledWith(1);
  expect(container.querySelector('#current-path').textContent).toBe('/dashboard');
  expect(button('Notifications, 0 unread')).toBeDefined();
  expect(container.querySelector('.notification-unread-label')).toBeNull();
});

test('opening a notification marks it read and follows its application link', async () => {
  await renderInbox();
  expect(button(sample.notification).classList.contains('notification-row-action')).toBe(true);
  await act(async () => container.querySelector('.notification-items time').click());
  expect(container.querySelector('#current-path').textContent).toBe('/review-form/92');
  expect(mockRead).toHaveBeenCalledWith(1);
});

test('shows failure with retry and supports an empty inbox', async () => {
  mockList.mockResolvedValue({ ok: false });
  await renderInbox();
  expect(container.querySelector('[role="alert"]')).not.toBeNull();
  expect(container.textContent).toContain('Updates are temporarily unavailable');
  expect(container.querySelector('.notification-count')).toBeNull();
  expect(container.textContent).not.toContain('You’re all caught up');
  mockList.mockResolvedValue(result([]));
  await act(async () => button('Retry').click());
  expect(container.textContent).toContain('You’re all caught up');
  expect(container.textContent).toContain('New updates will appear here.');
});

test('does not display an old account response after account switching', async () => {
  let resolveOld;
  mockList.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
  await renderInbox();
  localStorage.setItem('token', 'account-b-token');
  localStorage.setItem('id', '2');
  mockList.mockResolvedValue(result([]));
  await act(async () => navigate.push('/notifications'));
  await act(async () => resolveOld(result()));
  expect(container.textContent).not.toContain(sample.notification);
  expect(container.textContent).toContain('You’re all caught up');
});

test('mark all read updates unread counts and bell supports Escape', async () => {
  await renderInbox();
  const bell = button('Notifications, 1 unread');
  act(() => bell.click());
  expect(bell.getAttribute('aria-expanded')).toBe('true');
  act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  expect(bell.getAttribute('aria-expanded')).toBe('false');
  expect(document.activeElement).toBe(bell);
  mockList.mockResolvedValue(result([{ ...sample, read_status: 1 }]));
  await act(async () => button('Mark all read').click());
  expect(button('Notifications, 0 unread')).toBeDefined();
  expect(mockReadAll).toHaveBeenCalledTimes(1);
});

test('rejects external targets even when the notification contains a URL', async () => {
  mockList.mockResolvedValue(result([{ ...sample, target_path: 'https://example.com' }]));
  await renderInbox();
  await act(async () => button(sample.notification).click());
  expect(mockRead).toHaveBeenCalled();
  expect(container.querySelector('#current-path').textContent).toBe('/dashboard');
});

test('polls while visible and stops polling after logout', async () => {
  jest.useFakeTimers();
  try {
    await renderInbox();
    const initial = mockList.mock.calls.length;
    await act(async () => { jest.advanceTimersByTime(30000); });
    expect(mockList.mock.calls.length).toBe(initial + 1);
    localStorage.clear();
    await act(async () => navigate.push('/'));
    expect(container.textContent).not.toContain(sample.notification);
    await act(async () => { jest.advanceTimersByTime(30000); });
    expect(mockList.mock.calls.length).toBe(initial + 1);
  } finally { jest.useRealTimers(); }
});


test('inbox uses its cursor to load older notification history', async () => {
  mockList.mockImplementation(async options => {
    if (!Object.hasOwn(options, 'cursor')) return result();
    if (options.cursor) return { ok: true, data: { notifications: [{ ...sample, id: 2, notification: 'Older application update' }], unread_count: 2, next_cursor: null } };
    return { ok: true, data: { ...result().data, next_cursor: 'older-page' } };
  });
  await act(async () => root.render(<MemoryRouter><NotificationProvider><RouteProbe /><NotificationInbox /></NotificationProvider></MemoryRouter>));
  await act(async () => button('Older').click());
  expect(mockList).toHaveBeenCalledWith({ cursor: 'older-page', unread: false, limit: 10 });
  expect(container.textContent).toContain('Older application update');
  expect(container.textContent).toContain('Page 2');
  expect(button('All notifications').getAttribute('aria-pressed')).toBe('true');
  await act(async () => button('Unread notifications').click());
  expect(mockList).toHaveBeenCalledWith({ cursor: null, unread: true, limit: 10 });
  expect(button('Unread notifications').getAttribute('aria-pressed')).toBe('true');
  expect(button('All notifications').getAttribute('aria-pressed')).toBe('false');
  expect(container.textContent).toContain('Page 1');
  expect(button('Newer').disabled).toBe(true);
});

test('inbox clears loaded history when another account signs in', async () => {
  await act(async () => root.render(<MemoryRouter><NotificationProvider><RouteProbe /><NotificationInbox /></NotificationProvider></MemoryRouter>));
  expect(container.textContent).toContain(sample.notification);
  localStorage.setItem('token', 'account-b-token');
  localStorage.setItem('id', '2');
  mockList.mockResolvedValue(result([]));
  await act(async () => window.dispatchEvent(new Event('storage')));
  expect(container.textContent).not.toContain(sample.notification);
  expect(container.textContent).toContain('You’re all caught up');
});
