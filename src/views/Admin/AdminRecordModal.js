import React from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import Loader from '../../components/Loader/Loader';
import { FiBookOpen, FiCheck, FiEye, FiFileText, FiInfo, FiLayers, FiSave, FiShield, FiUsers } from 'react-icons/fi';

const contentTypes = [
  { id: 'homepage', name: 'Homepage' }, { id: 'about', name: 'About CRD' },
  { id: 'faq', name: 'FAQ' },
  { id: 'announcement', name: 'Announcement' },
];
const config = {
  colleges: { name: 'college', icon: FiBookOpen, description: 'Keep your university structure organized and up to date.' },
  departments: { name: 'department', icon: FiLayers, description: 'Connect a department to its college and manage its availability.' },
  users: { name: 'user account', icon: FiUsers, description: 'Manage profile details, portal access, and academic affiliations.' },
  content: { name: 'website content', icon: FiFileText, description: 'Write, preview, and publish information for your research community.' },
};

function FormSection({ title, description, children }) {
  return <section className="admin-editor-section">
    <div className="admin-editor-section-heading"><h3>{title}</h3>{description && <p>{description}</p>}</div>
    {children}
  </section>;
}

export default function AdminRecordModal({ section, editing, session, saving, error, onChange, onSave, onClose }) {
  const settings = config[section];
  if (!settings || !editing) return null;
  const Icon = settings.icon;
  const isContent = section === 'content';
  const set = (name, value) => onChange(name, value);
  const field = (name, title, options = {}) => {
    const { hint, ...control } = options;
    return <Form.Group className="admin-editor-field" controlId={`admin-${name}`}>
      <Form.Label>{title}{control.required && <span className="admin-required" aria-hidden="true"> *</span>}</Form.Label>
      <Form.Control value={editing[name] ?? ''} onChange={event => set(name, event.target.value)} maxLength={255} aria-describedby={hint ? `admin-${name}-hint` : undefined} {...control} />
      {hint && <Form.Text id={`admin-${name}-hint`}>{hint}</Form.Text>}
    </Form.Group>;
  };
  const select = (name, title, rows, getLabel, required = true) => <Form.Group className="admin-editor-field" controlId={`admin-${name}`}>
    <Form.Label>{title}{required && <span className="admin-required" aria-hidden="true"> *</span>}</Form.Label>
    <Form.Select required={required} value={editing[name] || ''} onChange={event => {
      set(name, event.target.value);
      if (name === 'college_id' && section === 'users') set('dept_id', '');
    }}>
      <option value="">Select {title.toLowerCase()}</option>
      {rows.map(row => <option key={row.id} value={row.id}>{getLabel(row)}</option>)}
    </Form.Select>
  </Form.Group>;
  const statusCard = <div className={`admin-editor-status ${(isContent ? editing.published : editing.active) ? 'is-active' : ''}`}>
    <div className="admin-editor-status-copy">
      <span className="admin-editor-status-icon">{isContent ? <FiEye /> : <FiShield />}</span>
      <div><strong>{isContent ? 'Publication status' : 'Record availability'}</strong>
        <p>{isContent ? editing.published ? 'This content will be visible on the website.' : 'Only administrators can see this draft.' : editing.active ? 'Available for use in the portal.' : 'Hidden from new selections. Existing records are retained.'}</p>
      </div>
    </div>
    <Form.Check id={isContent ? 'admin-published' : 'admin-active'} type="switch" label={isContent ? 'Published on website' : 'Active'} checked={isContent ? editing.published : editing.active} onChange={event => set(isContent ? 'published' : 'active', event.target.checked)} />
  </div>;

  return <Modal show onHide={() => !saving && onClose()} className={`admin-modal admin-modal--${section}`} size={isContent ? 'xl' : 'lg'} backdrop="static" centered scrollable aria-labelledby="admin-editor-title" aria-describedby="admin-editor-description">
    <Modal.Header closeButton={!saving}>
      <div className="admin-modal-heading">
        <span className="admin-modal-icon"><Icon aria-hidden="true" /></span>
        <div><span className="admin-eyebrow">{editing.id ? 'Manage record' : 'New record'}</span>
          <Modal.Title id="admin-editor-title">{editing.id ? 'Edit' : 'Create'} {settings.name}</Modal.Title>
          <p id="admin-editor-description">{settings.description}</p>
        </div>
      </div>
    </Modal.Header>
    <Form onSubmit={onSave} className="admin-editor-form" aria-busy={saving}>
      <Modal.Body>
        {error && <Alert variant="danger" className="admin-editor-error"><FiInfo aria-hidden="true" /><span>{error}</span></Alert>}
        <fieldset disabled={saving} className="admin-editor-fieldset">
          <div className={isContent ? 'admin-content-editor' : undefined}>
            <div className="admin-editor-fields">
              {section === 'colleges' && <FormSection title="College details" description="Use the official college name displayed across the portal.">
                {field('name', 'College name', { required: true, placeholder: 'e.g. College of Science' })}
                {field('initials', 'Initials', { placeholder: 'e.g. COS', hint: 'Optional abbreviation for this college.' })}
              </FormSection>}
              {section === 'departments' && <>
                <FormSection title="Department details" description="Add the department name and its identifying initials.">
                  {field('dept_name', 'Department name', { required: true, placeholder: 'e.g. Biology Department' })}
                  {field('dept_initials', 'Initials', { placeholder: 'e.g. BIO', hint: 'Optional abbreviation for this department.' })}
                </FormSection>
                <FormSection title="College affiliation" description="Each department belongs to one college.">
                  {select('college_id', 'College', session.colleges.filter(c => c.active || Number(c.id) === Number(editing.college_id)), c => `${c.name}${c.active ? '' : ' (inactive)'}`)}
                </FormSection>
              </>}
              {section === 'users' && <>
                <FormSection title="Personal information" description="Identify the person who will use this account.">
                  <div className="admin-form-grid">{field('first_name', 'First name', { required: true, autoComplete: 'given-name' })}{field('middle_name', 'Middle name', { autoComplete: 'additional-name' })}{field('last_name', 'Last name', { required: true, autoComplete: 'family-name' })}{field('contact_number', 'Contact number', { type: 'tel', autoComplete: 'tel' })}</div>
                </FormSection>
                <FormSection title="Account & access" description="Choose an existing role to set portal permissions.">
                  <div className="admin-form-grid">{field('username', 'Username', { required: true, autoComplete: 'off' })}{field('email', 'Email address', { required: true, type: 'email', autoComplete: 'email' })}{select('role_id', 'Role', session.roles, r => r.role_name)}{!editing.id && field('password', 'Initial password', { type: 'password', required: true, minLength: 8, autoComplete: 'new-password', hint: 'Use at least 8 characters.' })}</div>
                </FormSection>
                <FormSection title="Academic affiliation" description="Select a college to see its available departments.">
                  <div className="admin-form-grid">{select('college_id', 'College', session.colleges.filter(c => c.active || Number(c.id) === Number(editing.college_id)), c => c.name, false)}{select('dept_id', 'Department', session.departments.filter(d => (d.active && String(d.college_id) === String(editing.college_id) && session.colleges.some(c => c.id === d.college_id && c.active)) || Number(d.id) === Number(editing.dept_id)), d => `${d.dept_name}${d.active ? '' : ' (inactive)'}`, false)}</div>
                </FormSection>
              </>}
              {isContent && <FormSection title="Content details" description="Choose where this content belongs, then add your text.">
                {select('kind', 'Content type', contentTypes, item => item.name)}
                {field('title', 'Title', { required: true, placeholder: editing.kind === 'faq' ? 'Enter a question…' : 'Enter a clear, descriptive title…' })}
                {field('body', 'Content', { as: 'textarea', rows: 8, maxLength: 60000, placeholder: 'Write the content your readers will see…', hint: 'Plain text. Line breaks are preserved.' })}
              </FormSection>}
              {!isContent && statusCard}
            </div>
            {isContent && <aside className="admin-editor-preview">
              <div className="admin-preview-heading"><span><FiEye aria-hidden="true" /> Live preview</span><span className={`admin-badge ${editing.published ? 'active' : ''}`}>{editing.published ? 'Published' : 'Draft'}</span></div>
              <article className="admin-preview-paper"><span className="admin-eyebrow">{contentTypes.find(item => item.id === editing.kind)?.name || 'Website content'}</span><h3 className={!editing.title ? 'is-placeholder' : ''}>{editing.title || 'Your title appears here'}</h3><p className={!editing.body ? 'is-placeholder' : ''}>{editing.body || 'Start writing to preview your content before saving.'}</p></article>
              {statusCard}
              <p className="admin-preview-note"><FiInfo aria-hidden="true" /> Preview shows your text. The website applies the page layout.</p>
            </aside>}
          </div>
        </fieldset>
      </Modal.Body>
      <Modal.Footer>
        <span className="admin-modal-footer-note"><FiShield aria-hidden="true" /> {isContent ? editing.published ? 'Visible on the website after saving' : 'Saving as an unpublished draft' : 'Review the details before saving'}</span>
        <div className="admin-modal-actions"><Button variant="outline-secondary" disabled={saving} onClick={onClose}>Cancel</Button><Button type="submit" className="admin-loading-button" disabled={saving}>{saving ? <Loader label="Saving…" /> : <>{editing.id ? <FiSave aria-hidden="true" /> : <FiCheck aria-hidden="true" />}Save changes</>}</Button></div>
      </Modal.Footer>
    </Form>
  </Modal>;
}
