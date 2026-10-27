import React, { useId, useState } from 'react';
import { FiBell, FiChevronDown } from 'react-icons/fi';
import './site-content.scss';

export default function SiteAnnouncements({ announcements }) {
  if (!announcements.length) return null;
  return <section className="published-announcements" aria-labelledby="announcements-heading">
    <div className="published-announcements-panel">
      <div className="published-announcements-heading"><span className="published-icon"><FiBell aria-hidden="true" /></span><div><h2 id="announcements-heading">Announcements</h2></div></div>
      <div>{announcements.map(row => <Announcement key={row.id} row={row} />)}</div>
    </div>
  </section>;
}
function Announcement({ row }) {
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();
  const long = String(row.body || '').length > 380;
  return <article className="published-announcement">
    <h3>{row.title}</h3>
    <p id={bodyId} className={`published-copy${long && !expanded ? ' published-copy--collapsed' : ''}`}>{row.body}</p>
    {long && <button type="button" className="published-read-more" aria-expanded={expanded} aria-controls={bodyId} onClick={() => setExpanded(value => !value)}>{expanded ? 'Show less' : 'Read full announcement'}<FiChevronDown className={expanded ? 'is-expanded' : ''} aria-hidden="true" /></button>}
  </article>;
}
