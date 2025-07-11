import Base from './Base';

export default class Auth extends Base {
  login = async data => {
    return this.sendRequest({
      path: `/api/v1/user/login`,
      method: 'POST',
      data,
    });
  };

  profile = async (id) => {
    return this.sendRequest({
      path: `/api/v1/user/${id}`,
      method: 'GET'
    });
  };

  fetchResearches = async () => {
    return this.sendRequest({
      path: `/api/v1/research/all`,
      method: 'GET'
    })
  }

}
