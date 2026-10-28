/* eslint-disable testing-library/no-unnecessary-act -- Uses native React roots. */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route } from 'react-router-dom';
import ProjectMonitoring from './ProjectMonitoring';
import MonitoringAPI from '../../api/MonitoringAPI';
jest.mock('../../components/Layout/MainContainer', () => ({ children }) => <div>{children}</div>);
jest.mock('../../utils/monitoringDocuments', () => ({ createMonitoringPdf: jest.fn(() => ({ save: jest.fn() })) }));
jest.mock('../../api/MonitoringAPI', () => {
  const api = { list: jest.fn(), detail: jest.fn(), update: jest.fn(), upload: jest.fn(), download: jest.fn(), exportChecklist: jest.fn() };
  return { __esModule: true, default: jest.fn(() => api) };
});
const api = new MonitoringAPI();
const progress = { completed: 1, applicable: 3, excluded: 1, percent: 33, submitted: 0, changes: 1, finished: false };
const project = { id: 1, research_id: 23, form_version: 'F-CRD-003', snapshot: { title: 'Community research', researchers: ['Local Researcher'], college: 'Science', department: 'Biology', duration: '12 months' }, progress };
const item = { id: 10, key: 'draft', section: 'clearance', label: 'Review of the submitted draft manuscript', requires_file: true, conditional: false, status: 'changes', remarks: 'Revise the abstract.', submitted_on: '2026-10-26', returned_on: '2026-10-27', revision: 2, attachments: [] };
let root, container;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true; localStorage.clear(); jest.clearAllMocks();
  api.detail.mockResolvedValue({ ok: true, data: { project, progress, items: [item], events: [] } });
  api.list.mockResolvedValue({ ok: true, data: { projects: [project] } });
  api.update.mockResolvedValue({ ok: true, data: { message: 'Checklist saved.' } });
  api.upload.mockResolvedValue({ ok: true, data: { message: 'File submitted for CRD review.' } });
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); localStorage.clear(); });
const render = async (role, url = '/project-monitoring/1') => {
  localStorage.setItem('role_id', String(role));
  await act(async () => root.render(<MemoryRouter initialEntries={[url]}><Route path="/project-monitoring/:id?"><ProjectMonitoring /></Route></MemoryRouter>));
};
test('researcher sees feedback and progress, with upload access but no checklist editing', async () => {
  await render(2);
  expect(container.textContent).toContain('Revise the abstract.');
  expect(container.querySelector('progress').value).toBe(33);
  expect(container.querySelector('input[type=file]')).not.toBeNull();
  expect(container.querySelector('form[aria-label="Edit checklist"]')).toBeNull();
});
test.each([6, 7])('role %s can save the checklist with its current revision', async role => {
  await render(role);
  expect(container.querySelector('input[type=file]')).toBeNull();
  await act(async () => container.querySelector('form[aria-label="Edit checklist"]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(api.update).toHaveBeenCalledWith('1', 10, { status: 'changes', remarks: 'Revise the abstract.', submitted_on: '2026-10-26', returned_on: '2026-10-27', revision: 2 });
  expect(container.textContent).toContain('Checklist saved.');
});
test('file submission carries the requirement revision and waits for server progress', async () => {
  await render(2);
  const file = new File(['%PDF-1.4'], 'draft-v2.pdf', { type: 'application/pdf' });
  const input = container.querySelector('input[type=file]');
  Object.defineProperty(input, 'files', { value: [file] });
  await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })));
  await act(async () => container.querySelector('form[aria-label="Submit requirement"]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(api.upload).toHaveBeenCalledWith('1', 10, file, 2);
  expect(container.querySelector('progress').value).toBe(33);
  expect(container.textContent).toContain('File submitted for CRD review.');
});
test('unsupported roles cannot load monitoring data', async () => {
  await render(8); expect(api.detail).not.toHaveBeenCalled(); expect(container.querySelector('[role=alert]').textContent).toContain('available to researchers');
});
test('the project list displays saved progress and the project link', async () => {
  await render(2, '/project-monitoring');
  expect(container.textContent).toContain('Community research');
  expect(container.querySelector('a[href="/project-monitoring/1"]')).not.toBeNull();
  expect(container.querySelector('progress').value).toBe(33);
});
test('failed API requests show a retry action', async () => {
  api.detail.mockResolvedValue({ ok: false, data: { message: 'This project does not belong to you.' } });
  await render(2); expect(container.querySelector('[role=alert]').textContent).toContain('does not belong to you'); expect(container.textContent).toContain('Retry');
});
test('opening a project from the list loads its detail without rendering stale list data', async () => {
  await render(2, '/project-monitoring');
  await act(async () => container.querySelector('a[href="/project-monitoring/1"]').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })));
  expect(api.detail).toHaveBeenCalledWith('1');
  expect(container.querySelector('form[aria-label="Submit requirement"]')).not.toBeNull();
  expect(container.textContent).toContain('Revise the abstract.');
});
test('completed monitoring unlocks the PDF and final clearance actions', async () => {
  const complete = { ...progress, finished: true, percent: 100 };
  api.detail.mockResolvedValue({ ok: true, data: { project, progress: complete, items: [item], events: [] } });
  api.exportChecklist.mockResolvedValue({ ok: true, data: { project, progress: complete, items: [item] } });
  await render(2);
  expect(container.querySelector('a[href="/project-monitoring/1/clearance"]').textContent).toContain('Fill out clearance form');
  await act(async () => Array.from(container.querySelectorAll('button')).find(button => button.textContent.includes('Download monitoring PDF')).click());
  expect(api.exportChecklist).toHaveBeenCalledWith('1');
});
test('incomplete monitoring keeps the final documents locked', async () => {
  await render(2);
  expect(container.querySelector('a[href="/project-monitoring/1/clearance"]')).toBeNull();
  expect(container.textContent).toContain('become available when all applicable monitoring requirements are complete');
});
test('projects paginate in groups of six with no duplicates or skipped records', async () => {
  const projects = Array.from({ length: 14 }, (_, i) => ({ ...project, id: i + 1, research_id: i + 101, snapshot: { ...project.snapshot, title: `Project ${i + 1}` } }));
  api.list.mockResolvedValue({ ok: true, data: { projects } });
  await render(6, '/project-monitoring');
  expect(container.querySelectorAll('.monitoring-project-card')).toHaveLength(6);
  expect(container.querySelector('[aria-label="Previous page"]').disabled).toBe(true);
  expect(container.querySelector('.monitoring-pagination').textContent).toContain('Showing 1–6 of 14 projects');
  await act(async () => container.querySelector('[aria-label="Next page"]').click());
  expect(container.querySelectorAll('.monitoring-project-card')).toHaveLength(6);
  expect(container.querySelector('.monitoring-project-card h2').textContent).toBe('Project 7');
  expect(container.querySelector('.monitoring-pagination').textContent).toContain('Page 2 of 3');
  await act(async () => container.querySelector('[aria-label="Next page"]').click());
  expect(container.querySelectorAll('.monitoring-project-card')).toHaveLength(2);
  expect(container.querySelector('.monitoring-project-card h2').textContent).toBe('Project 13');
  expect(container.querySelector('[aria-label="Next page"]').disabled).toBe(true);
  await act(async () => container.querySelector('[aria-label="Previous page"]').click());
  expect(container.querySelector('.monitoring-project-card h2').textContent).toBe('Project 7');
});
test('single-page cards preserve full long text for hover and accessible reading', async () => {
  const title = 'Very long research title '.repeat(20), names = ['Researcher with a very long full name '.repeat(10)];
  api.list.mockResolvedValue({ ok: true, data: { projects: [{ ...project, snapshot: { ...project.snapshot, title, researchers: names } }] } });
  await render(2, '/project-monitoring');
  expect(container.querySelector('.monitoring-project-card h2').title).toBe(title);
  expect(container.querySelector('.monitoring-project-names').title).toBe(names[0]);
  expect(container.querySelector('[aria-label="Next page"]').disabled).toBe(true);
  expect(container.querySelector('[aria-label="Previous page"]').disabled).toBe(true);
});
