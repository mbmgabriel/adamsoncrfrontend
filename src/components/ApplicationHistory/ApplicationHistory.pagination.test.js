/* eslint-disable testing-library/no-unnecessary-act -- Native React roots require act. */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ApplicationHistory from './ApplicationHistory';

const applications = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1, title: `Research ${index + 1}`, status: 'Approved', submittedDate: 'Oct 26, 2026',
}));
let root, container;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); });
const next = () => container.querySelector('[aria-label="Next page"]');
const previous = () => container.querySelector('[aria-label="Previous page"]');
const renderHistory = (rows, onSelect) => act(() => root.render(<ApplicationHistory applications={rows} title="Applications" showCreate={false} onSelect={onSelect} />));

test('shows the shared loader until applications finish loading', () => {
  act(() => root.render(<ApplicationHistory applications={[]} isLoading title="Applications" showCreate={false} />));
  expect(container.querySelector('[role="status"]').textContent).toContain('Loading applications…');
  expect(container.querySelector('.portal-loader__spinner')).not.toBeNull();
  renderHistory(applications);
  expect(container.querySelector('.portal-loader')).toBeNull();
  expect(container.textContent).toContain('Research 1');
});

test('paginates ten records at a time and opens the correct record on later pages', () => {
  const onSelect = jest.fn();
  renderHistory(applications, onSelect);
  expect(container.querySelectorAll('tbody tr')).toHaveLength(10);
  expect(container.textContent).toContain('Showing 1-10 of 25');
  expect(previous().disabled).toBe(true);
  act(() => next().click());
  expect(container.textContent).toContain('Showing 11-20 of 25');
  act(() => container.querySelector('tbody tr').click());
  expect(onSelect).toHaveBeenCalledWith(applications[10]);
  act(() => next().click());
  expect(container.querySelectorAll('tbody tr')).toHaveLength(5);
  expect(container.textContent).toContain('Showing 21-25 of 25');
  expect(next().disabled).toBe(true);
  act(() => previous().click());
  expect(container.textContent).toContain('Showing 11-20 of 25');
});

test('clamps the current page when refreshed data has fewer records', () => {
  renderHistory(applications);
  act(() => next().click());
  act(() => next().click());
  renderHistory(applications.slice(0, 3));
  expect(container.querySelectorAll('tbody tr')).toHaveLength(3);
  expect(container.textContent).toContain('Showing 1-3 of 3');
  expect(previous().disabled).toBe(true);
  expect(next().disabled).toBe(true);
});

test('retains disabled page controls and correct counts for an empty table', () => {
  renderHistory([]);
  expect(container.textContent).toContain('Showing 0-0 of 0');
  expect(previous().disabled).toBe(true);
  expect(next().disabled).toBe(true);
});

test('print actions do not open the row or intercept keyboard activation', () => {
  const onSelect = jest.fn();
  const onPrint = jest.fn();
  act(() => root.render(<ApplicationHistory applications={applications.slice(0, 1)} title="Applications"
    showCreate={false} onSelect={onSelect} onPrint={onPrint} canPrint={() => true} />));
  const button = container.querySelector('.application-history__print-button');
  act(() => button.click());
  expect(onPrint).toHaveBeenCalledWith(applications[0]);
  expect(onSelect).not.toHaveBeenCalled();
  const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
  act(() => button.dispatchEvent(event));
  expect(event.defaultPrevented).toBe(false);
  expect(onSelect).not.toHaveBeenCalled();
});
