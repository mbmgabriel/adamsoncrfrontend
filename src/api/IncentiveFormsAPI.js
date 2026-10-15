import Base from "./Base";

export default class IncentiveFormsAPI extends Base {
  fetchIncentiveTypes = async () =>
    this.sendRequest({
      path: "/api/v1/s-incentive-types/all",
    });

  fetchAttachmentInfos = async () =>
    this.sendRequest({
      path: "/api/v1/s-attachment-infos/all",
    });

  fetchPeerReviewProofs = async () =>
    this.sendRequest({
      path: "/api/v1/s-peer-review-proof/all",
    });

  fetchUserApplications = async () =>
    this.sendRequest({
      path: "/api/v1/incentive-forms/user",
    });

  fetchApplicationsForReview = async () =>
    this.sendRequest({
      path: "/api/v1/incentive-forms/all",
    });

  createApplication = async (data) =>
    this.sendRequest({
      path: "/api/v1/incentive-forms/create",
      method: "POST",
      data,
    });
}
