import { remarkDate, sortReviewRemarks, formatRemarkDate } from './reviewRemarks';

test('mixes current and archived remarks by actual time, newest first across versions', () => {
  const entries = [
    { id: 'current', version_number: '3', updated_at: '2026-10-25T04:00:00Z' },
    { id: 'minor', version_number: '3', reviewed_at: '2026-10-25T05:00:00Z' },
    { id: 'old', version_number: '2', reviewed_at: '2026-10-24T05:00:00Z' },
    { id: 'unknown' },
  ];
  expect(sortReviewRemarks(entries).map(entry => entry.id)).toEqual(['minor', 'current', 'old', 'unknown']);
  expect(entries[0].id).toBe('current');
});

test('formats Philippine date and time without seconds and handles unavailable timestamps', () => {
  expect(formatRemarkDate(remarkDate({ reviewed_at: '2026-10-25T06:07:20Z' }))).toBe('Oct 25, 2026, 02:07 PM');
  expect(remarkDate({ reviewed_at: 'invalid', updated_at: '2026-10-25T06:07:20Z' }).toISOString()).toBe('2026-10-25T06:07:20.000Z');
  expect(remarkDate({})).toBeNull();
});
