import { TABLE_PAGE_SIZE } from '../constants/pagination';
import Base from './Base';

export default class NotificationsAPI extends Base {
  list = ({ cursor, unread = false, limit = TABLE_PAGE_SIZE } = {}) => {
    const query = new URLSearchParams({ limit: String(limit) });
    if (cursor) query.set('cursor', cursor);
    if (unread) query.set('unread', 'true');
    return this.sendRequest({ path: `/api/v1/notifications?${query}` });
  };
  markRead = id => this.sendRequest({ path: `/api/v1/notifications/${id}/read`, method: 'PATCH' });
  markAllRead = () => this.sendRequest({ path: '/api/v1/notifications/read-all', method: 'PATCH' });
}
