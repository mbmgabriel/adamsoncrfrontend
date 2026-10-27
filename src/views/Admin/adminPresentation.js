export const humanLabel = value => String(value || '').replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());
export const displayDate = (value, time = false) => {
  if (!value) return 'Not provided';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', ...(time ? { timeStyle: 'short' } : {}) }).format(parsed);
};
export const money = value => value == null || value === '' ? 'Not specified' : Number.isFinite(Number(value)) ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value)) : String(value);
export const statusName = (id, statuses = []) => statuses.find(s => String(s.id) === String(id))?.status || (id == null ? 'Awaiting review' : `Status #${id}`);
const hidden = new Set(['password', 'token', 'created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by', 'deleted_by']);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
// Audit profile snapshots can include unchanged values. Compare leaves so the UI shows only actual changes.
export function auditChanges(source) {
  let changes;
  try { changes = typeof source === 'string' ? JSON.parse(source) : source; } catch { return null; }
  if (!isObject(changes)) return null;
  const rows = [];
  const visit = (path, before, after) => {
    if (hidden.has(path.split('.').pop())) return;
    if (isObject(before) || isObject(after)) {
      for (const child of new Set([...Object.keys(isObject(before) ? before : {}), ...Object.keys(isObject(after) ? after : {})])) visit(`${path}.${child}`, before?.[child], after?.[child]);
      return;
    }
    if (JSON.stringify(before ?? '') === JSON.stringify(after ?? '')) return;
    rows.push({ path, field: path.split('.').filter(p => p !== 'profile').map(humanLabel).join(' · '), before, after });
  };
  for (const [path, change] of Object.entries(changes)) if (isObject(change) && ('before' in change || 'after' in change)) visit(path, change.before, change.after);
  return rows;
}
export function auditValue(value, path, session) {
  const field = path.split('.').pop();
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return field === 'active' ? value ? 'Active' : 'Inactive' : field === 'published' ? value ? 'Published' : 'Draft' : value ? 'Yes' : 'No';
  if (field === 'role_id') return session.roles?.find(r => String(r.id) === String(value))?.role_name || `Role #${value}`;
  if (field === 'dept_id') return session.departments?.find(d => String(d.id) === String(value))?.dept_name || `Department #${value}`;
  if (field === 'college_id') return session.colleges?.find(c => String(c.id) === String(value))?.name || `College #${value}`;
  if (Array.isArray(value)) return value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ') || '—';
  return String(value);
}

export function statusTone(id, name = '') {
  const byId = {1:'info',2:'success',3:'warning',4:'warning',5:'revision',6:'success',7:'publication',8:'publication',9:'publication',10:'success',11:'danger'};
  const byName = {ongoing:'info',completed:'success',approved:'success',endorsed:'success',forapproval:'warning',notyetreviewed:'warning',pending:'warning',awaitingreview:'warning',reevaluate:'revision',forrevision:'revision',presented:'publication',published:'publication',presentedandpublished:'publication',rejected:'danger'};
  return byId[Number(id)] || byName[String(name).toLowerCase().replace(/[^a-z]/g,'')] || 'neutral';
}
