/* eslint-disable testing-library/no-unnecessary-act -- Uses native React roots. */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Switch, useLocation } from 'react-router-dom';
import { AuthRoute } from './AuthRoute';
import { PrivateRoute } from './PrivateRoute';
import Header from '../../components/Header/Header';
import { toast } from 'react-toastify';
let root, container;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); localStorage.clear(); });
function Location() { return <span>{useLocation().pathname}</span>; }
test.each([
  ['Administrator', '/', '/admin'],
  ['Administrator', '/dashboard', '/admin'],
  ['Administrator', '/research', '/admin'],
  ['Administrator', '/admin', '/admin'],
  ['Researcher', '/', '/dashboard'],
  ['Researcher', '/dashboard', '/dashboard'],
  ['Researcher', '/research', '/research'],
])('%s visiting %s lands at %s', (role, path, expected) => {
  localStorage.setItem('token', 'test-token'); localStorage.setItem('role', role);
  act(() => root.render(<MemoryRouter initialEntries={[path]}><Switch>
    <AuthRoute path="/" exact component={() => <span>Login</span>} />
    <PrivateRoute workspaceOnly path="/dashboard" component={Location} />
    <PrivateRoute workspaceOnly path="/research" component={Location} />
    <PrivateRoute path="/admin" component={Location} />
  </Switch></MemoryRouter>));
  expect(container.textContent).toBe(expected);
});
test('signed-out users still reach login from a workspace route', () => {
  act(() => root.render(<MemoryRouter initialEntries={['/dashboard']}><Switch>
    <AuthRoute path="/" exact component={() => <span>Login</span>} />
    <PrivateRoute workspaceOnly path="/dashboard" component={Location} />
    <Route component={Location} />
  </Switch></MemoryRouter>));
  expect(container.textContent).toBe('Login');
});
test('administrator header has one compact account control and no duplicate navigation', () => {
  localStorage.setItem('role', 'Administrator');
  localStorage.setItem('name', 'Local Admin');
  act(() => root.render(<MemoryRouter><Header compact /></MemoryRouter>));
  expect(container.querySelector('nav')).toBeNull();
  expect(container.querySelectorAll('.user-div--compact')).toHaveLength(1);
  const account = container.querySelector('button[aria-label="Open account menu for Local Admin"]');
  act(() => account.click());
  expect(container.textContent).toContain('Administrator access');
  expect(container.textContent).toContain('Logout');
  act(() => { account.focus(); document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape',bubbles:true})); });
  expect(account.getAttribute('aria-expanded')).toBe('false');
});

test('researcher header retains primary navigation', () => {
  localStorage.setItem('role', 'Researcher');
  act(() => root.render(<MemoryRouter><Header /></MemoryRouter>));
  expect(container.querySelector('nav').textContent).toContain('Research Proposal');
  expect(container.querySelector('.user-div--compact')).toBeNull();
});


test.each(['FAQs','About CRD'])('%s navigation reports that the page is under development',name=>{
  localStorage.setItem('role','Researcher');
  const notify=jest.spyOn(toast,'info').mockImplementation(()=>{});
  act(()=>root.render(<MemoryRouter initialEntries={['/dashboard']}><Header/><Location/></MemoryRouter>));
  const link=[...container.querySelectorAll('nav button')].find(button=>button.textContent===name);
  act(()=>link.click());
  expect(notify).toHaveBeenCalledWith(`${name} is under development.`);
  expect(container.textContent).toContain('/dashboard');
  notify.mockRestore();
});
