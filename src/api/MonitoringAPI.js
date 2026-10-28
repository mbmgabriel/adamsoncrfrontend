import Base from './Base';
import { API_REQUEST_BASE_URL } from '../constants/url';

export default class MonitoringAPI extends Base {
  list = () => this.sendRequest({ path: '/api/v1/monitoring' });
  detail = id => this.sendRequest({ path: `/api/v1/monitoring/${id}` });
  exportChecklist = id => this.sendRequest({ path: `/api/v1/monitoring/${id}/export` });
  clearance = id => this.sendRequest({ path: `/api/v1/monitoring/${id}/clearance` });
  saveClearance = (id, data) => this.sendRequest({ path: `/api/v1/monitoring/${id}/clearance`, method: 'PUT', data });
  exportClearance = id => this.sendRequest({ path: `/api/v1/monitoring/${id}/clearance/export` });
  update = (id, itemId, data) => this.sendRequest({ path: `/api/v1/monitoring/${id}/items/${itemId}`, method: 'PUT', data });
  upload = (id, itemId, file, revision) => {
    const data = new FormData();
    data.append('revision', revision);
    data.append('file', file);
    return this.sendRequest({ path: `/api/v1/monitoring/${id}/items/${itemId}/files`, method: 'POST', data });
  };
  download = async (id, attachment) => {
    const response = await fetch(`${API_REQUEST_BASE_URL}/api/v1/monitoring/${id}/files/${attachment.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) throw new Error('The attachment could not be downloaded. Please sign in again or retry.');
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
}
