import Base from "./Base";

export default class RequestAssistanceFormsAPI extends Base {
  fetchProofs = async () =>
    this.sendRequest({
      path: "/api/v1/s-assistance-form-proofs/all",
    });

  fetchUserApplications = async () =>
    this.sendRequest({
      path: "/api/v1/request-assistance-forms/user",
    });

  fetchApplicationsForReview = async () =>
    this.sendRequest({
      path: "/api/v1/request-assistance-forms/all",
    });

  createApplication = async (data) =>
    this.sendRequest({
      path: "/api/v1/request-assistance-forms/create",
      method: "POST",
      data,
    });
}
