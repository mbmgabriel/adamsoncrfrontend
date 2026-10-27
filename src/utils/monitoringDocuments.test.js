/** @jest-environment node */
import { createClearancePdf, createMonitoringPdf, clearancePrintHtml } from './monitoringDocuments';

const payload = {
  project: { form_version: 'F-CRD-003 (09-01-23)', snapshot: { title: 'Research <script>alert(1)</script>', researchers: ['Maria Dela Cruz'], college: 'Science', department: 'Biology', duration: '2' } },
  progress: { finished: true },
  items: [{ section: 'proposal', label: 'Final manuscript', status: 'complete', submitted_on: '2026-10-26', returned_on: '2026-10-27', remarks: 'Verified' }],
  clearance: { saved: true, form_version: 'F-CRD-006 Rev 1 (08-01-19)', form: { date_completed: '2026-10-27', college_department: 'Science / Biology', faculty_researchers: ['Maria Dela Cruz', ''], student_researchers: ['', '', '', '', ''] } },
};
test('completed checklist PDF includes saved research and checklist values', () => {
  const pdf = createMonitoringPdf(payload).output();
  expect(pdf).toContain('Maria Dela Cruz'); expect(pdf).toContain('Verified'); expect(pdf).toContain('Final manuscript');
});
test('clearance PDF fits a normal form on one page and contains no electronic signatures', () => {
  const pdf = createClearancePdf(payload);
  expect(pdf.getNumberOfPages()).toBe(1);
  expect(pdf.output()).toContain('Maria Dela Cruz'); expect(pdf.output()).toContain('Signature above printed name:');
});
test('printable clearance escapes research text and preserves blank office checks', () => {
  const html = clearancePrintHtml(payload);
  expect(html).not.toContain('<script>'); expect(html).toContain('&lt;script&gt;'); expect(html).toContain('[ ] Full budget liquidation');
  expect(html).toContain('Maria Dela Cruz'); expect(html).not.toContain('[x]');
});
test('incomplete projects and unsaved clearance forms cannot produce documents', () => {
  expect(() => createMonitoringPdf({ ...payload, progress: { finished: false } })).toThrow('complete');
  const unsaved = { ...payload, clearance: { ...payload.clearance, saved: false } };
  expect(() => createClearancePdf(unsaved)).toThrow('Save');
  expect(clearancePrintHtml(unsaved)).toContain('RESEARCHER/s CLEARANCE FORM');
  expect(() => clearancePrintHtml({ ...payload, progress: { finished: false } })).toThrow('Complete monitoring');
});
