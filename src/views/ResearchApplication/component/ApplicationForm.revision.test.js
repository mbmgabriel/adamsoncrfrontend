/* eslint-disable testing-library/no-unnecessary-act -- Native React roots require act; Testing Library is not used. */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import ApplicationForm from './ApplicationForm';

let mockRevisionType;
const mockResubmit = jest.fn();
const mockUpload = jest.fn();
const mockInvestigator = { id_number: '123', first_name: 'Local', last_name: 'Researcher',
  mobile_number: '09123456789', email: 'local@example.test', college: 'COLLEGE OF SCIENCE', dept: 'BIOLOGY DEPARTMENT' };

jest.mock('../../../api/ResearchApplicationAPI', () => class { constructor() { return {
  fetchDepartments: async () => ({ ok: true, data: { Departments: [{ dept_desc: 'COLLEGE OF SCIENCE', dept_name: 'BIOLOGY DEPARTMENT' }] } }),
  fetchCategories: async () => ({ ok: true, data: { ResearchCategory: [{ id: 1, research_name: 'Science' }, { id: 2, research_name: 'Health' }, { id: 3, research_name: 'Environment' }] } }),
  fetchDocumentTypes: async () => ({ ok: true, data: { DocumentTypes: [{ id: 1, document_name: 'Letter of Intent' }] } }),
  fetchResearchDetails: async () => ({ ok: true, data: { Details: { BudgetBreakdownDetails: [], EndorsementRepresentative: [] } } }),
  fetchWorkflow: async () => ({ ok: true, data: { workflow: { can_resubmit: true, revision_type: mockRevisionType }, research: {
    title: 'Returned research', category: '1,3', purpose_id: 1, version_number: '1', research_duration: '2',
    ethical_considerations: 0, submitted_by: 'Local Researcher', ResearchInvestigators: [mockInvestigator], BudgetBreakdowns: [],
    ResearchDocuments: [{ id: 10, document_title_id: 1, document_filepath: '/document_filepath/2/document_filepath-123-original.pdf' }],
  } } }),
  resubmitResearch: (...args) => mockResubmit(...args),
  createDocument: (...args) => mockUpload(...args),
}; } });

let container;
let root;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  window.history.replaceState({}, '', '/new-research-application?revise=42');
  window.scrollTo = jest.fn();
  localStorage.clear();
  mockResubmit.mockReset().mockResolvedValue({ ok: true, data: { Research: { id: 42 } } });
  mockUpload.mockReset();
  mockRevisionType = "coordinator";
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  window.history.replaceState({}, '', '/');
});

test('revision selects Resubmission, restores original affiliations, and retains files unless replaced', async () => {
  await act(async () => root.render(<MemoryRouter><ApplicationForm /></MemoryRouter>));
  expect([...container.querySelectorAll('input[name="category"]')].map(input => input.checked)).toEqual([true, false, true]);
  expect(container.querySelector('#purpose-resubmission').checked).toBe(true);
  expect(container.querySelector('#purpose-initial').checked).toBe(false);
  expect(container.querySelector('input[name="version_number"]').value).toBe('2');
  expect(container.querySelector('select[name="researchers.0.college"]').value).toBe('COLLEGE OF SCIENCE');
  expect(container.querySelector('select[name="researchers.0.dept"]').value).toBe('BIOLOGY DEPARTMENT');
  const next = [...container.querySelectorAll('button')].find(button => button.textContent.trim() === 'Next');
  await act(async () => next.click());
  const link = [...container.querySelectorAll('a')].find(item => item.textContent === 'View current file');
  expect(link).toBeDefined();
  expect(link.getAttribute('href')).toContain('/document_filepath/2/document_filepath-123-original.pdf');
  expect(container.textContent).toContain('original.pdf');
  expect(container.textContent).toContain('Replace file (optional)');
  expect(container.querySelector('input[type="file"]').files.length).toBe(0);
  const submit = [...container.querySelectorAll('button')].find(button => button.textContent.includes('Resubmit Application'));
  await act(async () => submit.click());
  expect(mockResubmit).toHaveBeenCalledTimes(1);
  expect(mockResubmit.mock.calls[0][0]).toBe('42');
  expect(mockResubmit.mock.calls[0][1].category).toBe('1,3');
  expect(mockResubmit.mock.calls[0][1].research_investigators[0].dept).toBe('BIOLOGY DEPARTMENT');
  expect(mockUpload).not.toHaveBeenCalled();
});


test('minor URB revision retains the version and explains direct return to URB', async () => {
  mockRevisionType = 'urb_minor';
  await act(async () => root.render(<MemoryRouter><ApplicationForm /></MemoryRouter>));
  expect(container.querySelector('input[name="version_number"]').value).toBe('1');
  expect([...container.querySelectorAll('input[name="category"]')].map(input => input.checked)).toEqual([true, false, true]);
  expect(container.querySelector('#purpose-resubmission').checked).toBe(true);
  expect(container.textContent).toContain('The version stays the same.');
  expect(container.textContent).toContain('resubmit directly to the assigned URB reviewers');
  const next = [...container.querySelectorAll('button')].find(button => button.textContent.trim() === 'Next');
  await act(async () => next.click());
  const submit = [...container.querySelectorAll('button')].find(button => button.textContent.includes('Resubmit Application'));
  await act(async () => submit.click());
  expect(mockResubmit.mock.calls[0][1].version_number).toBe('1');
  expect(mockUpload).not.toHaveBeenCalled();
});
