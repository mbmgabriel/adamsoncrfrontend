import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  Link,
  Redirect,
  useLocation
} from 'react-router-dom';
import {
  Alert,
  Button,
  Form,
  Table
} from 'react-bootstrap';
import {
  FiBookOpen,
  FiDownload,
  FiFileText,
  FiGrid,
  FiLayers,
  FiPlus,
  FiUsers
} from 'react-icons/fi';
import AdminAPI from '../../api/AdminAPI';
import Loader from '../../components/Loader/Loader';
import MainContainer from '../../components/Layout/MainContainer';
import './admin.scss';
import AdminRecordModal from './AdminRecordModal';
import AdminApplicationModal from './AdminApplicationModal';
import { statusTone } from './adminPresentation';
const sections = [
  ['overview', 'Overview', FiGrid],
  ['users', 'Users & roles', FiUsers],
  ['colleges', 'Colleges', FiBookOpen],
  ['departments', 'Departments', FiLayers],
  ['applications', 'Applications', FiFileText],
  ['content', 'Website content', FiFileText],
  ['reports', 'Reports', FiDownload]
];
const label = value => String(value ?? '').replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c
  .toUpperCase());
const date = value => value ? new Date(value).toLocaleString('en-PH') : '—';
const api = new AdminAPI();
const blank = section => section === 'users' ? {
  username: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  password: '',
  role_id: '',
  college_id: '',
  dept_id: '',
  contact_number: '',
  active: true
} : section === 'colleges' ? {
  name: '',
  initials: '',
  active: true
} : section === 'departments' ? {
  dept_name: '',
  dept_initials: '',
  college_id: '',
  active: true
} : {
  kind: 'faq',
  title: '',
  body: '',
  published: false
};
export default function AdminPortal() {
  const location = useLocation();
  const section = location.pathname.split('/')[2] || 'overview';
  const title = sections.find(s => s[0] === section)?.[1];
  const [session, setSession] = useState(null), [accessError, setAccessError] = useState('');
  const [loadedData, setData] = useState(null), [error, setError] = useState(''), [success, setSuccess] = useState(
    '');
  const [loading, setLoading] = useState(false), [saving, setSaving] = useState(false), [exporting,
    setExporting
  ] = useState(false);
  const [page, setPage] = useState(1), [query, setQuery] = useState(''), [filters, setFilters] = useState({});
  const [editing, setEditing] = useState(null), [formError, setFormError] = useState(''), [detail,
    setDetail] = useState(null), [detailLoading, setDetailLoading] = useState(false);
  const [revision, setRevision] = useState(0);
  const data = loadedData?.section === section ? loadedData.result : null;
  const recordsLoading = loading || (!data && !error && Boolean(title));
  const detailRequest = useRef(0);
  const closeDetail = () => {
    detailRequest.current += 1;
    setDetail(null);
    setDetailLoading(false);
  };
  useEffect(() => () => { detailRequest.current += 1; }, []);
  const loadSession = useCallback(async () => {
    setAccessError('');
    try {
      const r = await api.get('session');
      if (r.ok) setSession(r.data);
      else setAccessError(r.status === 403 ?
        'Administrator access is required. Sign in with an administrator account.' : r.data?.message ||
        'The administration service is unavailable.');
    } catch {
      setAccessError('The administration service is unavailable. Please try again.');
    }
  }, []);
  useEffect(() => {
    loadSession();
  }, [loadSession]);
  useEffect(() => {
    setPage(1);
    setQuery('');
    setFilters({});
    setData(null);
    setError('');
    setSuccess('');
    setEditing(null);
    detailRequest.current += 1;
    setDetail(null);
    setDetailLoading(false);
  }, [section]);
  useEffect(() => {
    if (!session || !title) return;
    let active = true;
    setLoading(true);
    setError('');
    const timer = setTimeout(async () => {
      try {
        const r = await api.get(section === 'reports' ? 'applications' : section, {
          ...filters, q: query, page
        });
        if (!active) return;
        if (r.ok) setData({section, result:r.data});
        else {
          setData(null);
          setError(r.data?.message || 'Records could not be loaded.');
        }
      } catch {
        if (active) {
          setData(null);
          setError('Records could not be loaded. Please try again.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [section, session, title, page, query, filters, revision]);
  const change = (name, value) => setEditing(prev => ({
    ...prev,
    [name]: value
  }));
  const save = async event => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const r = await api.save(section, editing);
      if (r.ok) {
        setEditing(null);
        setSuccess('Changes saved.');
        setRevision(v => v + 1);
        await loadSession();
        window.dispatchEvent(new Event('site-content:refresh'));
      } else setFormError(r.data?.message || 'Changes could not be saved. Please try again.');
    } catch {
      setFormError('Changes could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  const edit = row => {
    setFormError('');
    const profile = row.User || {};
    setEditing(section === 'users' ? {
      ...blank(section),
      ...row,
      ...profile,
      id: row.id,
      college_id: profile.Department?.college_id || '',
      dept_id: profile.dept_id || ''
    } : {
      ...row
    });
  };
  const inspect = async row => {
    const requestId = ++detailRequest.current;
    setDetailLoading(true);
    setDetail({title:row.title, summary:row});
    setError('');
    try {
      const r = await api.get(`applications/${row.type}/${row.id}`);
      if (requestId !== detailRequest.current) return;
      if (r.ok) setDetail({...r.data, title:row.title, summary:row});
      else {
        setDetail(null);
        setError(r.data?.message || 'Application could not be loaded.');
      }
    } catch {
      if (requestId === detailRequest.current) {
        setDetail(null);
        setError('Application could not be loaded. Please try again.');
      }
    } finally {
      if (requestId === detailRequest.current) setDetailLoading(false);
    }
  };
  const exportCSV = async () => {
    setExporting(true);
    setError('');
    try {
      const r = await api.get('reports/export', {
        ...filters,
        q: query
      });
      if (r.ok) {
        const url = URL.createObjectURL(new Blob([r.data], {
          type: 'text/csv;charset=utf-8'
        }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'research-report.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else setError(r.data?.message || 'Export failed.');
    } catch {
      setError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };
  const filter = (name, title, options) =>
    <Form.Group controlId={`filter-${name}`}><Form.Label>{title}</Form.Label><Form.Select value={filters[name] || ''} onChange={e=>{setFilters(f=>({...f,[name]:e.target.value,...(name==='college_id'?{department_id:''}:{})}));setPage(1);}}><option value="">All</option>{options.map(o=><option value={o.id} key={o.id}>{o.name}</option>)}</Form.Select></Form.Group>;
  if (section === 'audit') return <Redirect to="/admin" />;
  if (accessError)
  return <MainContainer compactHeader activeHeader={title}><div className="admin-access"><Alert variant="danger">{accessError}</Alert><Button onClick={loadSession}>Retry</Button> {localStorage.getItem('role') === 'Administrator' ? <Link to="/" onClick={()=>localStorage.clear()}>Sign in again</Link> : <Link to="/dashboard">Back to dashboard</Link>}</div></MainContainer>;
  if (!session)
  return <MainContainer compactHeader activeHeader={title}><div className="admin-loading-access"><Loader label="Checking administrator access…" /></div></MainContainer>;
  const collegeName = id => session.colleges.find(c => Number(c.id) === Number(id))?.name ||
    'Unassigned — select a college';
  const columns = section === 'colleges' ? ['Name', 'Initials', 'Status', ''] : section === 'departments' ? [
      'Department', 'College', 'Initials', 'Status', ''
    ] : section === 'users' ? ['Name / username', 'Role', 'Affiliation', 'Status', ''] : section ===
    'content' ? ['Title', 'Type', 'Publication', ''] : ['Application', 'Type', 'Applicant', 'Affiliation', 'Status', ''];
  return <MainContainer compactHeader activeHeader={title}><div className="admin-layout"><aside className="admin-sidebar"><div className="admin-brand"><span className="admin-eyebrow">CRD administration</span></div><nav aria-label="Administration">{sections.map(([path,name,Icon])=><Link key={path} to={`/admin/${path}`} className={section===path?'is-active':''} aria-current={section===path?'page':undefined}><Icon/>{name}</Link>)}</nav></aside><main className="admin-main" aria-busy={recordsLoading}><div className="admin-heading"><div><span className="admin-eyebrow">Administration</span><h1>{title || 'Page not found'}</h1><p>{section==='colleges' ? 'Create colleges and maintain your university structure.' : section==='departments' ? 'Organize departments within their colleges.' : section==='applications' ? 'Inspect submissions and review progress. Decisions remain with assigned reviewers.' : 'Manage portal records and published information.'}</p></div>{['users','colleges','departments','content'].includes(section) && <Button onClick={()=>{setFormError('');setEditing(blank(section));}}><FiPlus/> Add {section==='content'?'content':section.slice(0,-1)}</Button>}{section==='reports' && <Button className="admin-loading-button" onClick={exportCSV} disabled={exporting}>{exporting ? <Loader label="Exporting…" /> : <><FiDownload/> Export CSV</>}</Button>}</div>
    {error && <Alert variant="danger">{error} <Button variant="link" onClick={()=>setRevision(v=>v+1)}>Retry</Button></Alert>}{success && <Alert variant="success" dismissible onClose={()=>setSuccess('')}>{success}</Alert>}
    {section!=='overview' && title && <div className="admin-toolbar"><Form.Group controlId="admin-search"><Form.Label>Search records</Form.Label><Form.Control type="search" placeholder="Search by name or details…" value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}}/></Form.Group>{['applications','reports'].includes(section) && <><div className="admin-filters">{filter('type','Application type',[{id:'research',name:'Research proposal'},{id:'assistance',name:'Presentation assistance'},{id:'incentive',name:'Incentive'}])}{filter('college_id','College',session.colleges.map(c=>({id:c.id,name:c.name})))}{filter('department_id','Department',session.departments.filter(d=>!filters.college_id || String(d.college_id)===filters.college_id).map(d=>({id:d.id,name:d.dept_name})))}{filter('status','Status',(session.statuses || []).map(s=>({id:s.id,name:s.status})))}{['from','to'].map(name=><Form.Group key={name} controlId={`filter-${name}`}><Form.Label>{name==='from'?'From date':'To date'}</Form.Label><Form.Control type="date" value={filters[name] || ''} onChange={e=>{setFilters(f=>({...f,[name]:e.target.value}));setPage(1);}}/></Form.Group>)}</div></>}</div>}
    {recordsLoading && <div className="admin-loading-panel"><Loader label={`Loading ${title?.toLowerCase() || 'records'}…`} /></div>}
    {!recordsLoading && data && section==='overview' && <><div className="admin-stats">{[['users','User accounts'],['colleges','Active colleges'],['departments','Active departments'],['applications','Applications'],['pending','Pending applications']].map(([k,name])=><article key={k}><span>{name}</span><strong>{data[k]}</strong></article>)}</div><section className="admin-panel"><h2>Application activity</h2>{data.byType?.map(r=><div className="admin-summary-row" key={r.type}><span>{label(r.type)}</span><strong>{r.total}</strong></div>)}</section><section className="admin-panel"><h2>Start with your organization</h2><p>Create a college, add its departments, then assign user affiliations.</p><Link to="/admin/colleges">Manage colleges →</Link></section></>}
    {!recordsLoading && data?.rows && <div className="admin-panel admin-table"><Table responsive hover><thead><tr>{columns.map((c,i)=><th key={i}>{c}</th>)}</tr></thead><tbody>{data.rows.length===0 ? <tr><td colSpan={columns.length} className="admin-empty">No matching records. {['colleges','departments','users','content'].includes(section)?'Use the Add button to create one.':''}</td></tr> : data.rows.map(row=><tr key={row.type?`${row.type}-${row.id}`:row.id}>
      {section==='colleges' ? <><td><strong>{row.name}</strong></td><td>{row.initials || '—'}</td><td><Status active={row.active}/></td></> : section==='departments' ? <><td><strong>{row.dept_name}</strong></td><td>{collegeName(row.college_id)}</td><td>{row.dept_initials || '—'}</td><td><Status active={row.active}/></td></> : section==='users' ? <><td><strong>{[row.User?.first_name,row.User?.last_name].filter(Boolean).join(' ')}</strong><small>{row.username} · {row.email}</small></td><td>{row.UserRole?.role_name}</td><td>{row.User?.Department?.dept_name || 'Unassigned'}</td><td><Status active={row.active}/></td></> : section==='content' ? <><td><strong>{row.title}</strong></td><td>{label(row.kind)}</td><td><span className={`admin-badge ${row.published?'active':''}`}>{row.published?'Published':'Draft'}</span></td></> : <><td><strong>{row.title}</strong><small>#{row.id} · {date(row.submitted_at)}</small></td><td>{label(row.type)}</td><td>{row.applicant || '—'}</td><td>{row.college}<small>{row.department}</small></td><td><span className={`admin-badge admin-application-status tone-${statusTone(row.status_id,row.status)}`}>{row.status}</span></td></>}
      <td><Button size="sm" variant="outline-primary" onClick={()=>['applications','reports'].includes(section)?inspect(row):edit(row)}>{['applications','reports'].includes(section)?'View':'Edit'}</Button></td>
    </tr>)}</tbody></Table><div className="admin-pagination"><span>{data.total} records · Page {page} of {Math.max(1,Math.ceil(data.total/data.pageSize))}</span><div><Button size="sm" variant="outline-secondary" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</Button> <Button size="sm" variant="outline-secondary" disabled={page*data.pageSize>=data.total} onClick={()=>setPage(p=>p+1)}>Next</Button></div></div></div>}
  </main></div>
  <AdminRecordModal section={section} editing={editing} session={session} saving={saving} error={formError} onChange={change} onSave={save} onClose={()=>setEditing(null)} />
  <AdminApplicationModal detail={detail} loading={detailLoading} session={session} onClose={closeDetail} />
  </MainContainer>;
}

function Status({
  active
}) {
  return <span className={`admin-badge ${active?'active':''}`}>{active?'Active':'Inactive'}</span>;
}
