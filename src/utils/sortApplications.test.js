import { sortApplicationsNewestFirst } from "./sortApplications";

test("orders newest timestamps first, breaks ties by ID, and puts missing dates last without mutating the source", () => {
  const applications = [
    { id: 1, date: "2026-10-24" },
    { id: 5, date: null },
    { id: 2, date: "2026-10-25T08:00:00Z" },
    { id: 4, date: "2026-10-25T09:00:00Z" },
    { id: 3, date: "2026-10-25T09:00:00Z" },
    { id: 6, date: "invalid" },
  ];

  const sorted = sortApplicationsNewestFirst(applications, (item) => item.date);

  expect(sorted.map((item) => item.id)).toEqual([4, 3, 2, 1, 6, 5]);
  expect(applications.map((item) => item.id)).toEqual([1, 5, 2, 4, 3, 6]);
});
