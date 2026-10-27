/* eslint-disable testing-library/no-unnecessary-act -- Uses native React roots. */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route } from 'react-router-dom';
import ClearanceForm from './ClearanceForm';
import MonitoringAPI from '../../api/MonitoringAPI';
import { createClearancePdf, printClearance } from '../../utils/monitoringDocuments';
jest.mock('../../components/Layout/MainContainer', () => ({ children }) => <div>{children}</div>);
jest.mock('../../utils/monitoringDocuments', () => ({ createClearancePdf: jest.fn(() => ({ save: jest.fn() })), printClearance: jest.fn(), clearanceOffices: [['CRD', '', '']] }));
jest.mock('../../api/MonitoringAPI', () => {
  const api = { clearance: jest.fn(), saveClearance: jest.fn(), exportClearance: jest.fn() };
  return { __esModule: true, default: jest.fn(() => api) };
});
const api = new MonitoringAPI();
const form = { date_completed: '2026-10-27', college_department: 'Science / Biology', faculty_researchers: ['Local Researcher', ''], student_researchers: ['', '', '', '', ''] };
const payload = { project: { research_id: 23, snapshot: { title: 'Community research', researchers: ['Local Researcher'] } }, clearance: { saved: true, revision: 1, form }, progress: { finished: true } };
let root, container;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true; jest.clearAllMocks(); localStorage.clear();
  api.clearance.mockResolvedValue({ ok: true, data: payload }); api.exportClearance.mockResolvedValue({ ok: true, data: payload });
  api.saveClearance.mockResolvedValue({ ok: true, data: { ...payload, message: 'Clearance details saved.' } });
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); localStorage.clear(); });
async function render(role = 2) {
  localStorage.setItem('role_id', role);
  await act(async () => root.render(<MemoryRouter initialEntries={['/project-monitoring/1/clearance']}><Route path="/project-monitoring/:id/clearance"><ClearanceForm /></Route></MemoryRouter>));
}
const button = text => Array.from(container.querySelectorAll('button')).find(node => node.textContent.includes(text));
test('researcher saves the form with its server revision', async () => {
  await render();
  await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(api.saveClearance).toHaveBeenCalledWith('1', { ...form, revision: 1 });
  expect(container.textContent).toContain('Clearance details saved.');
});
test.each([6, 7])('role %s can view and print but cannot edit researcher details', async role => {
  await render(role); expect(container.querySelector('fieldset').disabled).toBe(true); expect(button('Save clearance')).toBeUndefined();
  await act(async () => button('Print form').click());
  expect(api.exportClearance).toHaveBeenCalledWith('1'); expect(printClearance).toHaveBeenCalledWith(payload);
});
test('unsaved forms can print a blank copy while PDF download requires saving', async () => {
  api.clearance.mockResolvedValue({ ok: true, data: { ...payload, clearance: { ...payload.clearance, saved: false, revision: 0 } } });
  await render(); expect(button('Print blank form').disabled).toBe(false); expect(button('Download PDF').disabled).toBe(true);
  await act(async () => button('Print blank form').click());
  expect(api.exportClearance).not.toHaveBeenCalled();
  expect(printClearance).toHaveBeenCalledWith(expect.objectContaining({ clearance: expect.objectContaining({ saved: false }) }));
});
test('downloads use fresh authorized saved values', async () => {
  await render(); await act(async () => button('Download PDF').click());
  expect(api.exportClearance).toHaveBeenCalledWith('1'); expect(createClearancePdf).toHaveBeenCalledWith(payload);
});
test('a changed server revision prevents exporting an outdated form', async () => {
  api.exportClearance.mockResolvedValue({ ok: true, data: { ...payload, clearance: { ...payload.clearance, revision: 2 } } });
  await render(); await act(async () => button('Print form').click()); expect(printClearance).not.toHaveBeenCalled(); expect(container.textContent).toContain('changed in another session');
});
test('incomplete monitoring displays the API restriction without a form', async () => {
  api.clearance.mockResolvedValue({ ok: false, data: { message: 'Complete all applicable monitoring requirements.' } });
  await render(); expect(container.querySelector('form')).toBeNull(); expect(container.querySelector('[role=alert]').textContent).toContain('Complete all');
});
