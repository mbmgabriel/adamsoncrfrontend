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

  createEndorsement = async (data) => {
    return this.sendRequest({
      path: `/api/v1/endorsements/create`,
      method: 'POST',
      data
    })
  }

  createDocument = async ({ research_id, document_title_id, file }) => {
    const formData = new FormData();
    formData.append('document_filepath', file);

    return this.sendRequest({
      path: `/api/v1/research_documents/create/${research_id}/${document_title_id}`,
      method: 'POST',
      data: formData,
    });
  };

  fetchCategories = async (data) => {
    return this.sendRequest({
      path: `/api/v1/research_categories/all`,
      method: 'GET',
    });
  };

  fetchEndorsementRepresentative = async () => {
    return this.sendRequest({
      path: `/api/v1/endorsement_representatives/all`,
      method: 'GET'
    })
  }

  fetchDocumentTypes = async () => {
    return this.sendRequest({
      path: `/api/v1/document_types/all`,
      method: 'GET'
    })
  }

  destroyResearch = async (id) => {
    return this.sendRequest({
      path: `/api/v1/research/${id}`,
      method: 'DELETE'
    })
  }

}