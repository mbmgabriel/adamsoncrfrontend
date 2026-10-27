import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiClipboard, FiDownload, FiFileText, FiMessageSquare, FiUpload } from 'react-icons/fi';
import MainContainer from '../../components/Layout/MainContainer';
import Loader from '../../components/Loader/Loader';
import MonitoringAPI from '../../api/MonitoringAPI';
import './monitoring.scss';
import { createMonitoringPdf } from '../../utils/monitoringDocuments';

const api = new MonitoringAPI();
const statuses = { pending: 'Pending', submitted: 'For review', changes: 'Changes requested', complete: 'Complete', na: 'Not applicable' };
const sections = { proposal: 'Proposal & undertaking', implementation: 'Conduct, funds & liquidation', clearance: 'Manuscript & clearance' };
const day = value => value ? new Date(value.length === 10 ? `${value}T00:00:00` : value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const failure = response => response.data?.message || 'Project monitoring is unavailable. Please retry.';
const duration = value => /^\d+(\.\d+)?$/.test(String(value || '')) ? `${value} semester${Number(value) === 1 ? '' : 's'}` : value || '—';

function Progress({ value }) {
  return <div className="monitoring-progress"><div><strong>Checklist completion</strong><strong>{value.percent}%</strong></div><progress aria-label="Project monitoring completion" value={value.percent} max="100" /><div className="monitoring-muted"><span>{value.completed} of {value.applicable} applicable requirements complete</span><span>{value.excluded} not applicable</span></div></div>;
}
function Badge({ status }) { return <span className={`monitoring-badge is-${status}`}>{statuses[status]}</span>; }

export default function ProjectMonitoring() {
  const { id } = useParams();
  const role = Number(localStorage.getItem('role_id'));
  const allowed = [2, 6, 7].includes(role);
  const editor = [6, 7].includes(role);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState(null);
  const selectedRef = useRef(null);
  const [section, setSection] = useState('proposal');
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const fileInput = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setData(null);
    if (!allowed) { setLoading(false); return () => { active = false; }; }
    (id ? api.detail(id) : api.list()).then(response => {
      if (!active) return;
      if (!response.ok) { setError(failure(response)); return; }
      setData(response.data);
      if (id) {
        const items = response.data.items;
        const chosen = items.find(i => i.id === selectedRef.current) || items.find(i => i.status === (editor ? 'submitted' : 'changes')) || items[0];
        setSelected(chosen?.id); setSection(chosen?.section || 'proposal');
      }
    }).catch(() => { if (active) setError('Cannot connect to project monitoring. Please retry.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, allowed, editor, refresh]);

  const item = data?.items?.find(i => i.id === selected);
  useEffect(() => {
    selectedRef.current = item?.id || null;
    setForm(item ? { status: item.status, remarks: item.remarks || '', submitted_on: item.submitted_on || '', returned_on: item.returned_on || '', revision: item.revision } : {});
    setFile(null);
    if (fileInput.current) fileInput.current.value = '';
  }, [item]);

  async function mutate(action) {
    setBusy(true); setActionError(''); setNotice('');
    try {
      const response = await action();
      if (!response.ok) { setActionError(failure(response)); if (response.status === 409) setRefresh(n => n + 1); return; }
      setNotice(response.data.message); setRefresh(n => n + 1);
    } catch { setActionError('The operation could not be completed. Please retry.'); }
    finally { setBusy(false); }
  }
  function save(event) { event.preventDefault(); mutate(() => api.update(id, item.id, form)); }
  function submitFile(event) {
    event.preventDefault();
    if (!file) { setActionError('Choose a file to upload.'); return; }
    if (file.size > 20 * 1024 * 1024) { setActionError('Files must be 20 MB or smaller.'); return; }
    if (!/\.(pdf|png|jpe?g)$/i.test(file.name)) { setActionError('Choose a PDF, PNG, or JPEG file.'); return; }
    mutate(() => api.upload(id, item.id, file, item.revision));
  }
  async function download(attachment) {
    setDownloading(attachment.id); setActionError('');
    try { await api.download(id, attachment); } catch (e) { setActionError(e.message); } finally { setDownloading(null); }
  }

  async function exportChecklist() {
    setBusy(true); setActionError('');
    try {
      const response = await api.exportChecklist(id);
      if (!response.ok) { setActionError(failure(response)); if (response.status === 409) setRefresh(n => n + 1); return; }
      createMonitoringPdf(response.data).save(`research-monitoring-${response.data.project.research_id}.pdf`);
    } catch { setActionError('The monitoring PDF could not be prepared. Please retry.'); }
    finally { setBusy(false); }
  }

  return <MainContainer compactHeader activeHeader="Project monitoring"><main className="monitoring-page">
    <Link className="monitoring-back" to={id ? '/project-monitoring' : '/dashboard'}><FiArrowLeft /> {id ? 'All monitored projects' : 'Dashboard'}</Link>
    <header className="monitoring-heading"><div><span className="monitoring-eyebrow">F-CRD-003 · Research lifecycle</span><h1>Project monitoring</h1><p>{editor ? 'Review submissions and maintain research monitoring checklists.' : 'Track your approved projects, submit requirements, and view CRD feedback.'}</p></div><FiClipboard aria-hidden="true" /></header>
    {!allowed ? <p role="alert">Project monitoring is available to researchers, CRD staff, and directors.</p> : loading ? <div className="monitoring-loading"><Loader label="Loading project monitoring…" /></div> : error ? <div className="monitoring-empty" role="alert"><h2>Unable to load project monitoring</h2><p>{error}</p><button onClick={() => setRefresh(n => n + 1)}>Retry</button></div> : !id ? <>
      {!data?.projects?.length ? <div className="monitoring-empty"><FiClipboard /><h2>No projects in monitoring yet</h2><p>Research appears here after the director completes its approval.</p></div> : <div className="monitoring-projects">{data.projects.map(project => <article className="monitoring-project-card" key={project.id}><div className="monitoring-project-top"><span>Research #{project.research_id}</span><span className={`monitoring-badge ${project.progress.finished ? 'is-complete' : 'is-submitted'}`}>{project.progress.finished ? 'Monitoring complete' : 'In progress'}</span></div><h2>{project.snapshot.title}</h2><p>{project.snapshot.researchers.join(', ')}</p><p className="monitoring-muted">{[project.snapshot.college, project.snapshot.department].filter(Boolean).join(' / ')}</p><Progress value={project.progress} /><Link className="monitoring-primary monitoring-open" to={`/project-monitoring/${project.id}`}>{editor ? 'Review checklist' : 'View project'} <FiArrowRight /></Link></article>)}</div>}
    </> : data?.project?.id === Number(id) && <>
      <section className="monitoring-summary"><div className="monitoring-project-top"><span>Research #{data.project.research_id} · {data.project.form_version}</span><span className={`monitoring-badge ${data.progress.finished ? 'is-complete' : 'is-submitted'}`}>{data.progress.finished ? 'Monitoring complete' : 'In progress'}</span></div><h2>{data.project.snapshot.title}</h2><dl className="monitoring-metadata"><div><dt>Researcher/s</dt><dd>{data.project.snapshot.researchers.join(', ')}</dd></div><div><dt>College / Department</dt><dd>{[data.project.snapshot.college, data.project.snapshot.department].filter(Boolean).join(' / ') || '—'}</dd></div><div><dt>Duration of research</dt><dd>{duration(data.project.snapshot.duration)}</dd></div></dl><Progress value={data.progress} /><div className="monitoring-summary-footer"><Link to={`/review-form/${data.project.research_id}`}>View approval record</Link><span>{data.progress.submitted} for review · {data.progress.changes} changes requested</span></div></section>
      {data.progress.finished ? <section className="monitoring-completed" aria-label="Completed monitoring documents"><div className="monitoring-completed-info"><span className="monitoring-completed-icon" aria-hidden="true"><FiCheckCircle /></span><div><span className="monitoring-completed-label">Ready for clearance</span><h3>Monitoring complete</h3><p>Download the verified checklist or prepare your researcher clearance form.</p></div></div><div className="clearance-actions"><button disabled={busy} onClick={exportChecklist}><FiDownload /> {busy ? 'Preparing…' : 'Download monitoring PDF'}</button><Link className="monitoring-primary" to={`/project-monitoring/${id}/clearance`}>{editor ? 'View clearance form' : 'Fill out clearance form'} <FiArrowRight /></Link></div></section> : <p className="monitoring-muted">Checklist PDF and the researcher clearance form become available when all applicable monitoring requirements are complete.</p>}
      <h2 className="monitoring-form-title">Research project monitoring checklist form</h2><p className="monitoring-muted">Completion reflects CRD-verified requirements. Not applicable items are excluded.</p>
      {notice && <p className="monitoring-notice" role="status"><FiCheckCircle /> {notice}</p>}
      {actionError && <p className="monitoring-error" role="alert">{actionError}</p>}
      <nav className="monitoring-tabs" aria-label="Checklist sections">{Object.entries(sections).map(([key, label]) => <button key={key} disabled={busy} aria-pressed={section === key} onClick={() => { setSection(key); setSelected(data.items.find(i => i.section === key)?.id); setActionError(''); }}>{label}</button>)}</nav>
      <div className="monitoring-layout"><section className="monitoring-checklist" aria-label="Research process checklist"><div className="monitoring-table-head"><span>Research process</span><span>Submitted</span><span>Returned</span></div>{data.items.filter(row => row.section === section).map(row => <button className="monitoring-checklist-row" key={row.id} disabled={busy} aria-pressed={selected === row.id} onClick={() => { setSelected(row.id); setNotice(''); }}><span><strong>{row.label}</strong><Badge status={row.status} /></span><span>{day(row.submitted_on)}</span><span>{day(row.returned_on)}</span></button>)}</section>
      {item && <aside className="monitoring-detail" aria-label="Selected requirement"><Badge status={item.status} /><h3>{item.label}</h3><p className="monitoring-muted">{item.requires_file ? 'Researcher document' : 'CRD process record'}{item.conditional ? ' · Conditional requirement' : ' · Required'}</p>
        <section className="monitoring-files" aria-label="Attachment history"><h4>Attachments</h4>{item.attachments.length ? item.attachments.map((attachment, index) => <div className="monitoring-file" key={attachment.id}><FiFileText aria-hidden="true" /><div><strong>{attachment.filename}</strong><span>{index === 0 ? 'Latest' : 'Previous version'} · {day(attachment.created_at)} · {Math.max(1, Math.ceil(attachment.byte_size / 1024))} KB</span></div><button aria-label={`Download ${attachment.filename}`} disabled={downloading !== null} onClick={() => download(attachment)}>{downloading === attachment.id ? '…' : <FiDownload />}</button></div>) : <p className="monitoring-muted">No attachment submitted.</p>}</section>
        {editor ? <form onSubmit={save} aria-label="Edit checklist"><fieldset disabled={busy}><div className="monitoring-dates"><label>Date submitted<input type="date" value={form.submitted_on || ''} onChange={e => setForm({ ...form, submitted_on: e.target.value })} /></label><label>Date returned<input type="date" value={form.returned_on || ''} onChange={e => setForm({ ...form, returned_on: e.target.value })} /></label></div><label>Remarks<textarea rows="4" maxLength="5000" value={form.remarks || ''} onChange={e => setForm({ ...form, remarks: e.target.value })} placeholder="Feedback, consultation notes, or reason for applicability…" required={['na','changes'].includes(form.status)} /></label><label>Checklist status<select value={form.status || 'pending'} onChange={e => setForm({ ...form, status: e.target.value })}>{Object.entries(statuses).filter(([key]) => key !== 'na' || item.conditional).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><button type="submit" className="monitoring-primary">{busy ? 'Saving…' : 'Save checklist'}</button></fieldset></form> : <><h4><FiMessageSquare /> CRD remarks</h4><p className="monitoring-remarks">{item.remarks || 'No remarks yet.'}</p><p className="monitoring-muted">Submitted: {day(item.submitted_on)}<br />Returned: {day(item.returned_on)}</p>{item.requires_file && item.status !== 'na' ? <form onSubmit={submitFile} aria-label="Submit requirement"><fieldset disabled={busy}><label>{item.attachments.length ? 'Attach a new version' : 'Attach requirement'}<input ref={fileInput} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => setFile(e.target.files[0] || null)} /></label><p className="monitoring-muted">PDF, PNG, or JPEG · Maximum 20 MB. New versions require CRD review.</p><button type="submit" className="monitoring-primary"><FiUpload /> {busy ? 'Submitting…' : 'Submit file'}</button></fieldset></form> : <p className="monitoring-muted">This record is maintained by CRD staff and the director.</p>}</>}
      </aside>}</div>
      <section className="monitoring-history"><h2>Monitoring history</h2><div className="monitoring-history-content" role="region" aria-label="Monitoring history entries" tabIndex="0">{data.events.map(event => <article key={event.id}><span className="monitoring-history-dot" /><div><strong>{event.action === 'enrolled' ? 'Research entered project monitoring' : event.action === 'file_submitted' ? 'Requirement file submitted' : event.action === 'clearance_saved' ? 'Researcher clearance details saved' : 'Checklist updated'}</strong><p>{data.items.find(i => i.id === event.item_id)?.label}</p><span>{event.actor_name || 'System'} · {day(event.created_at)}</span>{event.changes && event.action === 'checklist_updated' && <details><summary>View changes</summary><ChangeDetails changes={event.changes} /></details>}</div></article>)}</div></section>
    </>}
  </main></MainContainer>;
}

function ChangeDetails({ changes }) {
  let value;
  try { value = JSON.parse(changes); } catch { return <p>Details unavailable.</p>; }
  return <dl className="monitoring-changes">{['status','submitted_on','returned_on','remarks'].filter(key => value.before?.[key] !== value.after?.[key]).map(key => <div key={key}><dt>{({ status: 'Status', submitted_on: 'Date submitted', returned_on: 'Date returned', remarks: 'Remarks' })[key]}</dt><dd>{statuses[value.before?.[key]] || value.before?.[key] || '—'} → {statuses[value.after?.[key]] || value.after?.[key] || '—'}</dd></div>)}</dl>;
}
