import Base from './Base';
export default class AdminAPI extends Base {
  get = (path, query = {}) => this.sendRequest({
    path: `/api/v1/admin/${path}?${new URLSearchParams(Object.entries(query).filter(([,value]) => value !== '' && value != null))}`
  });
  save = (resource, data) => this.sendRequest({
    path: `/api/v1/admin/${resource}${data.id ? `/${data.id}` : ''}`,
    method: data.id ? 'PUT' : 'POST',
    data
  });
}
