export function remarkDate(entry) {
  for (const value of [entry.reviewed_at, entry.updated_at, entry.created_at]) {
    if (!value) continue;
    const date = new Date(value);
    if (Number.isFinite(date.getTime())) return date;
  }
  return null;
}

export function sortReviewRemarks(entries) {
  return [...entries].sort((a, b) => (remarkDate(b)?.getTime() ?? -Infinity) - (remarkDate(a)?.getTime() ?? -Infinity));
}

export function formatRemarkDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila', month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(date);
}
