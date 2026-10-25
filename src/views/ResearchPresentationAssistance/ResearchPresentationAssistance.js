import React, { useCallback, useEffect, useMemo, useState } from "react";
import MainContainer from "../../components/Layout/MainContainer";
import AdamsonSeal from "../../assets/image/adamson_logo.png";
import ApplicationHistory from "../../components/ApplicationHistory/ApplicationHistory";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import RequestAssistanceFormsAPI from "../../api/RequestAssistanceFormsAPI";
import ResearchApplicationAPI from "../../api/ResearchApplicationAPI";
import { sortApplicationsNewestFirst } from "../../utils/sortApplications";

const createEmptyForm = () => ({
  name_of_presenter: "",
  email_address: "",
  contact_number: "",
  conference_title: "",
  research_paper_title: "",
  conference_link: "",
  acceptance_date: "",
  conference_date: "",
  proof_ids: [],
});

const getCollection = (response, keys) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  return keys.map((key) => data?.[key]).find(Array.isArray) || [];
};

const getErrorMessage = (response, fallback) => {
  const data = response?.data;
  if (typeof data === "string" && data.trim() && data.length < 240) return data;
  return data?.message || data?.error || fallback;
};

const normalizeDate = (value) => (value ? String(value).slice(0, 10) : "");

const formatDisplayDate = (value) => {
  const normalizedDate = normalizeDate(value);
  const [year, month, day] = normalizedDate.split("-").map(Number);
  if (!year || !month || !day) return "—";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

const getCreatedDate = (application) =>
  application.created_at ||
  application.createdAt ||
  application.date_created ||
  application.created_date ||
  application.submission_date ||
  application.submitted_date;

const getApplicationStatusId = (application, formTypeId) => {
  const endorsements = application.Endorsements || application.endorsements || [];
  const endorsement = endorsements.find(
    (item) => Number(item.form_type_id) === Number(formTypeId)
  );

  return endorsement?.status_id ?? application.status_id;
};

const normalizeProofIds = (application, proofOptions = []) =>
  (application?.CAssistanceFormProofs || application?.c_assistance_form_proofs || [])
    .filter((proof) => Number(proof.is_active) !== 0)
    .map((proof) => {
      const providedId = Number(
        proof.proof_id ??
        proof.id ??
        proof.SAssistanceFormProof?.id ??
        proof.s_assistance_form_proof?.id
      );
      if (Number.isFinite(providedId)) return providedId;

      const proofName =
        proof.SAssistanceFormProof?.name ??
        proof.s_assistance_form_proof?.name ??
        proof.name;
      return Number(proofOptions.find((option) => option.name === proofName)?.id);
    })
    .filter(Number.isFinite);

const applicationToForm = (application, proofOptions) => ({
  ...createEmptyForm(),
  ...application,
  date_submitted: formatDisplayDate(getCreatedDate(application)),
  acceptance_date: normalizeDate(application.acceptance_date),
  conference_date: normalizeDate(application.conference_date),
  proof_ids: normalizeProofIds(application, proofOptions),
});

function AssistanceField({
  form,
  label,
  name,
  onChange,
  readOnly = false,
  required = false,
  singleLine = false,
  type = "text",
  multiline = false,
  rowClass = "",
}) {
  return (
    <div className={`assistance-request__table-row ${rowClass}`} role="row">
      <label htmlFor={`assistance-${name}`}>{label}</label>
      <div role="cell">
        {multiline || (type === "text" && !singleLine) ? (
          <textarea
            id={`assistance-${name}`}
            name={name}
            onChange={onChange}
            readOnly={readOnly}
            required={required}
            rows={multiline ? 3 : 1}
            value={form[name] ?? ""}
          />
        ) : (
          <input
            id={`assistance-${name}`}
            name={name}
            onChange={onChange}
            readOnly={readOnly}
            required={required}
            type={type}
            value={form[name] ?? ""}
          />
        )}
      </div>
    </div>
  );
}

function ResearchPresentationAssistance({ reviewMode = false }) {
  const history = useHistory();
  const [showForm, setShowForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [form, setForm] = useState(createEmptyForm);
  const [proofRequirements, setProofRequirements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [statusTables, setStatusTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [loadError, setLoadError] = useState("");
  const api = useMemo(() => new RequestAssistanceFormsAPI(), []);
  const endorsementApi = useMemo(() => new ResearchApplicationAPI(), []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const [proofResponse, statusResponse, applicationsResponse] = await Promise.all([
        api.fetchProofs(),
        endorsementApi.fetchStatus(),
        reviewMode
          ? api.fetchApplicationsForReview()
          : api.fetchUserApplications(),
      ]);

      setProofRequirements(getCollection(proofResponse, ["SAssistanceFormProofs"]));
      setStatusTables(getCollection(statusResponse, ["StatusTables", "status_tables"]));

      if (!applicationsResponse?.ok) {
        setLoadError(
          getErrorMessage(applicationsResponse, "Please try loading your requests again.")
        );
        return;
      }

      setApplications(getCollection(applicationsResponse, [
        "RequestAssistanceForms",
        "CRequestAssistanceForms",
        "request_assistance_forms",
      ]));
    } catch (error) {
      console.error(error);
      setLoadError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [api, endorsementApi, reviewMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusName = (application) =>
    statusTables.find(
      (status) =>
        Number(status.id) === Number(getApplicationStatusId(application, 2))
    )?.status || "Unknown";

  const historyApplications = applications.map((application, index) => ({
    ...application,
    id: application.id ?? application.request_assistance_form_id ?? index + 1,
    status: getStatusName(application),
    submittedDate: formatDisplayDate(getCreatedDate(application)),
    title: application.research_paper_title || "Untitled research paper",
  }));
  const displayedApplications = sortApplicationsNewestFirst(historyApplications, getCreatedDate);

  const openNewApplication = () => {
    setSelectedApplication(null);
    setForm(createEmptyForm());
    setShowForm(true);
  };

  const openApplication = (application) => {
    setSelectedApplication(application);
    setForm(applicationToForm(application, proofRequirements));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedApplication(null);
    setForm(createEmptyForm());
  };

  const isDecisionFinal = Boolean(selectedApplication) &&
    [10, 11].includes(Number(getApplicationStatusId(selectedApplication, 2)));

  const handleStatusAction = async (statusId) => {
    if (!reviewMode || !selectedApplication || isUpdatingStatus || isDecisionFinal) return;

    const researchId =
      selectedApplication.research_id ??
      selectedApplication.Research?.id ??
      selectedApplication.research?.id ??
      selectedApplication.id ??
      selectedApplication.request_assistance_form_id;

    if (researchId == null) {
      toast.error("The research ID for this request is unavailable.");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const response = await endorsementApi.updateEndorsementStatus(
        researchId,
        2,
        { status_id: statusId }
      );

      if (!response?.ok) {
        toast.error(
          getErrorMessage(response, "The request status could not be updated.")
        );
        return;
      }

      toast.success(
        statusId === 10
          ? "Presentation assistance request approved successfully."
          : "Presentation assistance request rejected successfully."
      );
      closeForm();
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleProof = (id) => {
    if (selectedApplication) return;
    const numericId = Number(id);
    setForm((current) => ({
      ...current,
      proof_ids: current.proof_ids.includes(numericId)
        ? current.proof_ids.filter((proofId) => proofId !== numericId)
        : [...current.proof_ids, numericId],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedApplication || isSubmitting) return;

    if (form.proof_ids.length === 0) {
      toast.error("Please select at least one proof requirement.");
      return;
    }

    const payload = {
      name_of_presenter: form.name_of_presenter.trim(),
      email_address: form.email_address.trim(),
      contact_number: form.contact_number.trim(),
      conference_title: form.conference_title.trim(),
      research_paper_title: form.research_paper_title.trim(),
      conference_link: form.conference_link.trim(),
      acceptance_date: form.acceptance_date,
      conference_date: form.conference_date,
      CAssistanceFormProofs: form.proof_ids.map((proofId) => ({
        proof_id: proofId,
        is_active: 1,
      })),
    };

    setIsSubmitting(true);
    try {
      const response = await api.createApplication(payload);
      if (!response?.ok) {
        toast.error(
          getErrorMessage(response, "The presentation assistance request could not be created.")
        );
        return;
      }

      toast.success("Presentation assistance request created successfully.");
      closeForm();
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = reviewMode || Boolean(selectedApplication);

  return (
    <MainContainer>
      {showForm ? (
        <main className="assistance-request" aria-labelledby="assistance-request-title">
          <div className="application-history__form-navigation">
            <button type="button" onClick={closeForm}>
              <FiArrowLeft aria-hidden="true" />
              {reviewMode ? "Back to requests for approval" : "Back to past applications"}
            </button>
          </div>
          <form className="assistance-request__sheet" onSubmit={handleSubmit}>
            <header className="assistance-request__header">
              <div className="assistance-request__brand">
                <img src={AdamsonSeal} alt="Adamson University" />
                <span>ADAMSON<br />UNIVERSITY</span>
              </div>
              <address>
                <strong>Center for Research and Development</strong><br />
                900 San Marcelino Street, Manila<br />
                1000 Manila, Philippines<br />
                Office No. (02) 8525-0604/ (+632)-524-2011 Loc. 153
              </address>
            </header>

            <h1 id="assistance-request-title">
              RESEARCH PAPER PRESENTATION REQUEST FOR ASSISTANCE FORM
            </h1>

            <div className="assistance-request__table" role="table" aria-label="Research paper presentation request for assistance">
              <div className="assistance-request__table-row assistance-request__table-row--header" role="row">
                <div role="columnheader">APPLICANT PROFILE/<br />INFORMATION</div>
                <div role="columnheader">DETAILS</div>
              </div>

              {reviewMode && (
                <AssistanceField form={form} label="Date Submitted:" name="date_submitted" readOnly singleLine />
              )}
              <AssistanceField form={form} label="Name of Presenter:" name="name_of_presenter" onChange={handleFieldChange} readOnly={isReadOnly} required rowClass="assistance-request__table-row--medium" />
              <AssistanceField form={form} label="Email Address:" name="email_address" onChange={handleFieldChange} readOnly={isReadOnly} required type="email" />
              <AssistanceField form={form} label="Contact Number:" name="contact_number" onChange={handleFieldChange} readOnly={isReadOnly} required rowClass="assistance-request__table-row--medium" type="tel" />
              <AssistanceField form={form} label="Title of Conference and Contact Information:" multiline name="conference_title" onChange={handleFieldChange} readOnly={isReadOnly} required rowClass="assistance-request__table-row--large" />
              <AssistanceField form={form} label="Title of the Research Paper:" multiline name="research_paper_title" onChange={handleFieldChange} readOnly={isReadOnly} required rowClass="assistance-request__table-row--large" />
              <AssistanceField form={form} label="Website/Internet Link of Conference:" name="conference_link" onChange={handleFieldChange} readOnly={isReadOnly} required singleLine />
              <AssistanceField form={form} label="Date of Acceptance:" name="acceptance_date" onChange={handleFieldChange} readOnly={isReadOnly} required type="date" />
              <AssistanceField form={form} label="Date of Conference:" name="conference_date" onChange={handleFieldChange} readOnly={isReadOnly} required type="date" />

              <div className="assistance-request__table-row assistance-request__table-row--proof" role="row">
                <div className="assistance-request__proof-label" role="cell">Proof of:</div>
                <div className="assistance-request__proof-items" role="cell">
                  {proofRequirements.map((proof, index) => (
                    <div className="assistance-request__proof-item" key={proof.id}>
                      <label>
                        <span className="assistance-request__proof-letter">{String.fromCharCode(97 + index)})</span>
                        <input
                          aria-label={`${String.fromCharCode(97 + index)}) ${proof.name}`}
                          checked={form.proof_ids.includes(Number(proof.id))}
                          disabled={isReadOnly}
                          onChange={() => toggleProof(proof.id)}
                          type="checkbox"
                        />
                        <span>{proof.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {reviewMode && selectedApplication ? (
              <div className="publication-incentive__review-actions">
                <button
                  className="publication-incentive__review-button publication-incentive__review-button--reject"
                  disabled={isUpdatingStatus || isDecisionFinal}
                  onClick={() => handleStatusAction(11)}
                  type="button"
                >
                  <FiXCircle aria-hidden="true" />
                  Reject
                </button>
                <button
                  className="publication-incentive__review-button publication-incentive__review-button--approve"
                  disabled={isUpdatingStatus || isDecisionFinal}
                  onClick={() => handleStatusAction(10)}
                  type="button"
                >
                  <FiCheckCircle aria-hidden="true" />
                  Approve
                </button>
              </div>
            ) : !isReadOnly ? (
              <div className="assistance-request__actions">
                <button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Creating…" : "Create Request"}
                </button>
              </div>
            ) : null}
          </form>
        </main>
      ) : (
        <ApplicationHistory
          applications={displayedApplications}
          nameColumnLabel="Name of Presenter"
          nameColumnField="name_of_presenter"
          title={reviewMode
            ? "Presentation Assistance Requests"
            : "Research Presentation Assistance"
          }
          description={reviewMode
            ? "Review submitted research paper presentation assistance requests."
            : "View your previous requests or begin a new request for research paper presentation assistance."
          }
          emptyTitle={reviewMode ? "No presentation assistance requests yet" : undefined}
          emptyMessage={reviewMode
            ? "Submitted requests will appear here, including approved and rejected requests."
            : "New requests will appear here after they are submitted."
          }
          errorMessage={loadError}
          isLoading={isLoading}
          onBack={() => history.push("/dashboard")}
          onCreate={openNewApplication}
          onRetry={loadData}
          onSelect={openApplication}
          showCreate={!reviewMode}
          showApplicationId={false}
          tableDescription={reviewMode
            ? "Select a request to open its form and review the submitted details."
            : undefined
          }
          tableTitle={reviewMode ? "All requests" : undefined}
        />
      )}
    </MainContainer>
  );
}

export default ResearchPresentationAssistance;
