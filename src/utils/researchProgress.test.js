import { buildReviewProgress, getReviewStepLabel } from './researchProgress';

const steps = [
  { id: 7, role: 'CRD Director', endorsed: true },
  { id: 10, role: 'Univ Review Board', isUrb: true, endorsed: false },
  { id: 6, role: 'CRD Staff', endorsed: true },
  { id: 8, role: 'Univ Review Board', isUrb: true, endorsed: true },
  { id: 3, role: 'College Research Coordinator', endorsed: true },
  { id: 5, role: 'College Dean', endorsed: true },
  { id: 4, role: 'Department Chairperson', endorsed: true },
];
const members = [{ user_id: 8 }, { user_id: 10 }];

test('progress puts all URB reviewers before the final director step', () => {
  const result = buildReviewProgress(steps, members);
  expect(result.map(step => step.role)).toEqual([
    'College Research Coordinator', 'Department Chairperson', 'College Dean', 'CRD Staff', 'URB 1', 'URB 2', 'CRD Director',
  ]);
  expect(result[result.length - 1].endorsed).toBe(false);
});
test('assignment or URB approval alone does not complete the director step', () => {
  const approved = steps.map(step => ({ ...step, endorsed: true }));
  expect(buildReviewProgress(approved, members).pop().endorsed).toBe(false);
  expect(buildReviewProgress(approved, members, true).pop().endorsed).toBe(true);
});
test('additional URB members remain ahead of the director', () => {
  const expanded = buildReviewProgress([...steps, { id: 9, role: 'Univ Review Board', isUrb: true, endorsed: false }], [...members, { user_id: 9 }]);
  expect(expanded.slice(-2).map(step => step.role)).toEqual(['URB 3', 'CRD Director']);
});


test('director labels distinguish final completion from endorsement or assignment', () => {
  const pending = buildReviewProgress(steps, members).pop();
  expect(getReviewStepLabel(pending)).toBe('Pending completion');
  expect(getReviewStepLabel(buildReviewProgress(steps, members, true).pop())).toBe('Completed');
  expect(getReviewStepLabel({ isUrb: true, endorsed: true })).toBe('Approved');
});
