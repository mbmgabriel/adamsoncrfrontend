/* eslint-disable testing-library/no-unnecessary-act -- Native React roots require act. */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, useHistory } from 'react-router-dom';
import Form from './ResearchApplicationReviewForm';
const mockGet = jest.fn();
const mockWorkflow = jest.fn();
jest.mock('../../../api/ResearchApplicationAPI', () => class {
  getResearchById(id) { return mockGet(id); }
  fetchWorkflow(id) { return mockWorkflow(id); }
  getAllEndorsementComments() { return Promise.resolve({ ok: true, data: { Endorsements: [] } }); }
});
let root, container, history;
function Probe() { history = useHistory(); return null; }
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  window.scrollTo = jest.fn();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  mockGet.mockReset();
  mockWorkflow.mockReset();
});
afterEach(() => { act(() => root.unmount()); container.remove(); });
const denied = { ok: false, status: 404, data: { message: 'Application is unavailable.' } };
async function renderReview() {
  await act(async () => root.render(<MemoryRouter initialEntries={['/review-form/92']}><Probe /><Route path="/review-form/:id" component={Form} /></MemoryRouter>));
}
test('an inaccessible notification target shows an unavailable state without proposal fields', async () => {
  mockGet.mockResolvedValue(denied);
  mockWorkflow.mockResolvedValue(denied);
  await renderReview();
  expect(container.querySelector('[role="alert"]').textContent).toContain('no longer have access');
  expect(container.querySelector('textarea')).toBeNull();
});
test('switching to a removed target never leaves the previous proposal visible', async () => {
  mockGet.mockResolvedValueOnce({ ok: true, data: { Research: { title: 'Previous private proposal', category: [], submitted_date: '2026-10-25T12:00:00Z', research_investigators: [], budget_breakdowns: [], endorsements: [] } } }).mockResolvedValue(denied);
  mockWorkflow.mockResolvedValueOnce({ ok: true, data: { workflow: { stage: 'coordinator_review', assigned_urb: [] } } }).mockResolvedValue(denied);
  await renderReview();
  expect(container.querySelector('textarea').value).toBe('Previous private proposal');
  await act(async () => history.push('/review-form/93'));
  expect(container.querySelector('textarea')).toBeNull();
  expect(container.textContent).toContain('This application is unavailable');
});
