import Base from './Base';

export default class Auth extends Base {
  createResearch = async (data) => {
    return this.sendRequest({
      path: `/api/v1/research/create`,
      method: 'POST',
      data
    });
  };

  createResearchInvestigators = async (data) => {
    return this.sendRequest({
      path: `/api/v1/research_investigators/create`,
      method: 'POST',
      data
    });
  };

  fetchCategories = async (data) => {
    return this.sendRequest({
      path: `/api/v1/research_categories/all`,
      method: 'GET',
    });
  };


}