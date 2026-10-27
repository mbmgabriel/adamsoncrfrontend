import React, { useState } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { FiActivity, FiArrowRight, FiChevronRight, FiClock, FiShield } from 'react-icons/fi';
import { auditChanges, auditValue, displayDate, humanLabel } from './adminPresentation';
const resourceName = name => ({ users:'User', colleges:'College', departments:'Department', content:'Website content' }[name] || humanLabel(name));
const initials = name => String(name || 'Admin').split(/[\s_]+/).slice(0,2).map(s => s[0]).join('').toUpperCase();
export default function AdminAuditList({ data, page, onPage, session }) {
  const [selected, setSelected] = useState(null);
  const changes = selected ? auditChanges(selected.changes) : [];
  return <>
    <section className="admin-audit-panel" aria-label="Administrator activity">
      <div className="admin-audit-panel-heading"><span className="admin-audit-heading-icon"><FiActivity /></span><div><h2>Recent changes</h2><p>Who changed what, and when.</p></div><span className="admin-audit-count">{data.total} {data.total === 1 ? 'event' : 'events'}</span></div>
      {!data.rows.length && <div className="admin-audit-empty"><FiShield /><h3>No activity to display</h3><p>Account, organization, and content changes will appear here.</p></div>}
      <div className="admin-audit-events">{data.rows.map(row => {
        const fields = auditChanges(row.changes);
        return <article className="admin-audit-event" key={row.id}>
          <div className="admin-audit-avatar" aria-hidden="true">{initials(row.actor_name)}</div>
          <div className="admin-audit-event-main"><div className="admin-audit-event-title"><strong>{row.actor_name || 'Administrator'}</strong><span className={`admin-event-action ${row.action === 'create' ? 'is-created' : ''}`}>{row.action === 'create' ? 'Created' : humanLabel(row.action)}</span><span className="admin-audit-record">{resourceName(row.resource)} <span>#{row.resource_id}</span></span></div>
            <div className="admin-audit-event-meta"><FiClock aria-hidden="true" /><time dateTime={row.created_at}>{displayDate(row.created_at,true)}</time><span className="admin-audit-event-id">Event #{row.id}</span></div>
            <div className="admin-audit-fields">{fields === null ? <span>Change details unavailable</span> : fields.length ? <>{fields.slice(0,3).map(field => <span key={field.path}>{field.field}</span>)}{fields.length > 3 && <span>+{fields.length-3} more</span>}</> : <span>No field values changed</span>}</div>
          </div>
          <Button className="admin-audit-view" variant="link" onClick={() => setSelected(row)}>View changes <FiChevronRight aria-hidden="true" /></Button>
        </article>;
      })}</div>
      <div className="admin-pagination"><span>{data.total} records · Page {page} of {Math.max(1,Math.ceil(data.total/data.pageSize))}</span><div><Button size="sm" variant="outline-secondary" disabled={page === 1} onClick={() => onPage(page-1)}>Previous</Button> <Button size="sm" variant="outline-secondary" disabled={page*data.pageSize >= data.total} onClick={() => onPage(page+1)}>Next</Button></div></div>
    </section>
    <Modal show={Boolean(selected)} onHide={() => setSelected(null)} centered scrollable size="lg" className="admin-modal admin-modal--audit" aria-labelledby="admin-audit-title">
      <Modal.Header closeButton><div className="admin-modal-heading"><span className="admin-modal-icon"><FiActivity /></span><div><span className="admin-eyebrow">Activity details · Event #{selected?.id}</span><Modal.Title id="admin-audit-title">{selected && `${resourceName(selected.resource)} #${selected.resource_id}`}</Modal.Title><p>{selected?.actor_name} · {displayDate(selected?.created_at,true)}</p></div></div></Modal.Header>
      <Modal.Body><div className="admin-change-explainer"><span className="admin-change-before">Previous value</span><FiArrowRight aria-hidden="true" /><span className="admin-change-after">New value</span></div><div className="admin-change-table"><Table responsive><thead><tr><th>Field</th><th>Before</th><th>After</th></tr></thead><tbody>{changes?.map(change => <tr key={change.path}><th scope="row">{change.field}</th><td><div className="admin-change-value">{auditValue(change.before,change.path,session)}</div></td><td><div className="admin-change-value is-new">{auditValue(change.after,change.path,session)}</div></td></tr>)}</tbody></Table>{changes === null ? <p className="admin-empty">These change details could not be read.</p> : !changes.length && <p className="admin-empty">This event did not change any field values.</p>}</div></Modal.Body>
      <Modal.Footer><span className="admin-modal-footer-note"><FiShield /> Activity history is read-only</span><Button variant="outline-secondary" onClick={() => setSelected(null)}>Close</Button></Modal.Footer>
    </Modal>
  </>;
}
