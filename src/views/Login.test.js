/* eslint-disable testing-library/no-unnecessary-act -- Uses native React roots. */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Login from './Login';
import { UserContext } from '../context/UserContext';

const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock('react-router-dom', () => ({ useHistory: () => ({ push: mockPush }) }));
jest.mock('./ForgotPassword/ForgotPassword', () => () => null);

const originalFetch = global.fetch;
let root;
let container;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  localStorage.clear();
  mockPush.mockReset();
  mockRefresh.mockReset();
  global.fetch = jest.fn();
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});
async function submitLogin() {
  await act(async () => root.render(<UserContext.Provider value={{ data: { refreshUser: mockRefresh } }}><Login /></UserContext.Provider>));
  await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}

test.each(['Failed to fetch', 'Network request failed', 'Load failed'])('connection failure (%s) shows a message without crashing', async message => {
  global.fetch.mockRejectedValue(new TypeError(message));
  await submitLogin();
  expect(window.alert).toHaveBeenCalledWith('Cannot connect to the server. Please try again.');
  expect(mockPush).not.toHaveBeenCalled();
  expect(localStorage.getItem('token')).toBeNull();
});

test('failure reading the response body also shows a connection message', async () => {
  global.fetch.mockResolvedValue({ text: () => Promise.reject(new TypeError('connection lost')) });
  await submitLogin();
  expect(window.alert).toHaveBeenCalledWith('Cannot connect to the server. Please try again.');
});

test('incorrect credentials preserve the backend login failure message', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 401, text: async () => JSON.stringify({ message: 'Invalid credentials' }) });
  await submitLogin();
  expect(window.alert).toHaveBeenCalledWith('Login Failed: Invalid credentials');
  expect(mockPush).not.toHaveBeenCalled();
});

test('successful login saves the session and opens the dashboard', async () => {
  global.fetch.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ token: 'test-token', UserAccount: {
    user_id: 22, first_name: 'Test', last_name: 'Researcher', role_name: 'Researcher',
  } }) });
  await submitLogin();
  expect(mockPush).toHaveBeenCalledWith('/dashboard');
  expect(localStorage.getItem('token')).toBe('test-token');
  expect(localStorage.getItem('id')).toBe('22');
  expect(mockRefresh).toHaveBeenCalledTimes(1);
  expect(window.alert).not.toHaveBeenCalled();
});
