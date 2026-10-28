import { monitoringToday } from './monitoringDates';
test('completion dates use the Philippine calendar day across UTC midnight boundaries', () => {
  expect(monitoringToday(new Date('2026-10-27T15:59:59Z'))).toBe('2026-10-27');
  expect(monitoringToday(new Date('2026-10-27T16:00:00Z'))).toBe('2026-10-28');
});
