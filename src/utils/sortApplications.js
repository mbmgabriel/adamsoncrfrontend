export const sortApplicationsNewestFirst = (applications, getDate) =>
  [...applications].sort((a, b) => {
    const aDate = Date.parse(getDate(a));
    const bDate = Date.parse(getDate(b));
    const aHasDate = Number.isFinite(aDate);
    const bHasDate = Number.isFinite(bDate);

    if (aHasDate !== bHasDate) return aHasDate ? -1 : 1;
    if (aHasDate && aDate !== bDate) return bDate - aDate;
    return (Number(b.id) || 0) - (Number(a.id) || 0);
  });
