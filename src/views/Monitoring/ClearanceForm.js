import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiPrinter, FiCheckCircle, FiFileText } from 'react-icons/fi';
import MainContainer from '../../components/Layout/MainContainer';
import Loader from '../../components/Loader/Loader';
import MonitoringAPI from '../../api/MonitoringAPI';
import { createClearancePdf, printClearance, clearanceOffices } from '../../utils/monitoringDocuments';
import './monitoring.scss';

const api = new MonitoringAPI();
export default function ClearanceForm() {
  const { id } = useParams();
  const role = Number(localStorage.getItem('role_id')), allowed = [2, 6, 7].includes(role), editor = role === 2;
  const [data, setData] = useState(null), [form, setForm] = useState(null), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [refresh, setRefresh] = useState(0);
  const dirty = !!data && JSON.stringify(form) !== JSON.stringify(data.clearance.form);
  useEffect(() => {
    let active = true; setLoading(true); setData(null); setError('');
    if (!allowed) { setLoading(false); return () => { active = false; }; }
    api.clearance(id).then(response => {
      if (!active) return;
      if (!response.ok) { setError(response.data?.message || 'Cannot load the clearance form.'); return; }
      setData(response.data); setForm(response.data.clearance.form);
    }).catch(() => { if (active) setError('Cannot connect to the clearance form. Please retry.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, allowed, refresh]);
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const response = await api.saveClearance(id, { ...form, revision: data.clearance.revision });
      if (!response.ok) { setError(response.data?.message || 'The form could not be saved.'); return; }
      setData(response.data); setForm(response.data.clearance.form); setNotice(response.data.message);
    } catch { setError('The form could not be saved. Please retry.'); } finally { setBusy(false); }
  }
  async function output(print) {
    setBusy(true); setError('');
    try {
      const response = print && !data.clearance.saved ? await api.clearance(id) : await api.exportClearance(id);
      if (!response.ok) { setError(response.data?.message || 'The form is unavailable.'); return; }
      if (response.data.clearance.revision !== data.clearance.revision) { setError('This form changed in another session. Reload before printing or downloading.'); return; }
      if (print) await printClearance(response.data);
      else createClearancePdf(response.data).save(`research-clearance-${data.project.research_id}.pdf`);
    } catch { setError('The form could not be prepared. Please retry.'); } finally { setBusy(false); }
  }
  const changeName = (key, index, value) => setForm({ ...form, [key]: form[key].map((name, i) => i === index ? value : name) });
  return <MainContainer compactHeader activeHeader="Project monitoring"><main className="monitoring-page clearance-page">
    <Link className="monitoring-back" to={`/project-monitoring/${id}`}><FiArrowLeft /> Project monitoring</Link>
    <header className="monitoring-heading"><div><span className="monitoring-eyebrow">F-CRD-006 · Final research clearance</span><h1>Researcher clearance form</h1><p>{editor ? 'Fill out your research details, save, and print for office clearance.' : 'View the researcher’s saved details and print for office clearance.'}</p></div></header>
    {!allowed ? <p role="alert">Only researchers, CRD staff, and directors can access clearance forms.</p> : loading ? <div className="monitoring-loading"><Loader label="Loading clearance form…" /></div> : <>
      {error && <p className="monitoring-error" role="alert">{error}</p>}
      {notice && <p className="monitoring-notice" role="status"><FiCheckCircle /> {notice}</p>}
      {data && form ? <>
        <section className="clearance-toolbar" aria-label="Clearance documents">
          <div className="clearance-toolbar-info">
            <span className="clearance-document-icon" aria-hidden="true"><FiFileText /></span>
            <div><div className="clearance-toolbar-title"><h2>Clearance documents</h2><span className={`clearance-save-status ${dirty || !data.clearance.saved ? 'is-draft' : 'is-saved'}`}>{dirty ? 'Unsaved changes' : data.clearance.saved ? 'Saved' : 'Not saved yet'}</span></div>
              <p>{dirty ? 'Save your changes to print or download the updated form.' : data.clearance.saved ? 'Your saved form is ready to download or print for office clearance.' : 'Print a blank copy, or save researcher details for a completed form.'}</p>
            </div>
          </div>
          <div className="clearance-actions"><button disabled={busy || dirty || !data.clearance.saved} onClick={() => output(false)}><FiDownload /> Download PDF</button><button className="monitoring-primary" disabled={busy || dirty} onClick={() => output(true)}><FiPrinter /> {data.clearance.saved ? 'Print form' : 'Print blank form'}</button></div>
        </section>
        <form onSubmit={save} aria-label="Researcher clearance details" className="clearance-details"><fieldset disabled={busy || !editor}>
          <h2>Research details</h2><label>Research title<div className="clearance-readonly">{data.project.snapshot.title}</div></label>
          <p className="monitoring-muted">Approved researcher/s: {data.project.snapshot.researchers.join(', ')}</p>
          <div className="clearance-fields"><label>Date of completion<input required type="date" value={form.date_completed} onChange={e => setForm({ ...form, date_completed: e.target.value })} /></label><label>College and department<input required maxLength="500" value={form.college_department} onChange={e => setForm({ ...form, college_department: e.target.value })} /></label></div>
          <p className="monitoring-muted">Enter at least one researcher. Leave unused name fields blank.</p>
          <div className="clearance-fields">{[['faculty_researchers','Faculty researcher / co-researcher'],['student_researchers','Student researcher']].map(([key, label]) => <section key={key}><h3>{key === 'faculty_researchers' ? 'Faculty researchers (for faculty-led)' : 'Student researchers'}</h3>{form[key].map((name, index) => <label key={index}>{label} {index + 1}<input maxLength="150" value={name} onChange={e => changeName(key, index, e.target.value)} /></label>)}</section>)}</div>
          {editor && <button className="monitoring-primary" type="submit">{busy ? 'Saving…' : 'Save clearance details'}</button>}
        </fieldset></form>
        <section className="clearance-offices"><h2>Office clearance</h2><p className="monitoring-muted">These sections will be blank on the printed form for office checks, signatures, and dates. Completing monitoring does not sign or certify clearance.</p><div className="clearance-office-grid">{clearanceOffices.map(([text], index) => <article key={index}><h3>{text.split('\n')[0]}</h3><p>{text.split('\n').slice(1).join('\n')}</p><span>Signature above printed name · Date</span></article>)}</div><p className="monitoring-muted">Cleared / noted by the College Research Coordinator, Department Chair / Dean, CRD Staff, and CRD Director.</p></section>
      </> : <button onClick={() => setRefresh(n => n + 1)}>Retry</button>}
    </>}
  </main></MainContainer>;
}
