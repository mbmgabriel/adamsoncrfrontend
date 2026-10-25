import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MainContainer from "../../components/Layout/MainContainer";
import AdamsonSeal from "../../assets/image/adamson_logo.png";
import ApplicationHistory from "../../components/ApplicationHistory/ApplicationHistory";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { useHistory, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import IncentiveFormsAPI from "../../api/IncentiveFormsAPI";
import ResearchApplicationAPI from "../../api/ResearchApplicationAPI";
import { sortApplicationsNewestFirst } from "../../utils/sortApplications";

const getToday = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Manila",
    year: "numeric",
  }).formatToParts(new Date());
  const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${date.year}-${date.month}-${date.day}`;
};

const createEmptyForm = () => ({
  name_of_authors: "",
  email_address: "",
  contact_number: "",
  incentive_type_id: "",
  submission_date: getToday(),
  publisher_info: "",
  title_of_work: "",
  publication_date: "",
  citation_date: "",
  citation_no: "",
  isbn: "",
  peer_review_proof_id: "",
  attachment_info_ids: [],
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

const normalizeAttachmentIds = (application, attachmentOptions = []) =>
  (application?.CAttachmentInfos || application?.c_attachment_infos || [])
    .filter((attachment) => Number(attachment.is_active) !== 0)
    .map((attachment) => {
      const providedId = Number(
        attachment.info_id ??
        attachment.id ??
        attachment.SAttachmentInfo?.id ??
        attachment.s_attachment_info?.id
      );

      if (Number.isFinite(providedId)) return providedId;

      const attachmentName =
        attachment.SAttachmentInfo?.name ??
        attachment.s_attachment_info?.name ??
        attachment.name;
      return Number(
        attachmentOptions.find((option) => option.name === attachmentName)?.id
      );
    })
    .filter(Number.isFinite);

const normalizeDate = (value) => (value ? String(value).slice(0, 10) : "");

const getCreatedDate = (application) =>
  application.created_at ||
  application.createdAt ||
  application.date_created ||
  application.created_date ||
  application.submission_date ||
  application.submitted_date;

const getApplicationStatusId = (application, formTypeId) => {
  if ([10, 11].includes(Number(application.status_id))) return application.status_id;
  const endorsements = application.Endorsements || application.endorsements || [];
  const endorsement = endorsements.find(
    (item) => Number(item.form_type_id) === Number(formTypeId)
  );

  return endorsement?.status_id ?? application.status_id;
};

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

const applicationToForm = (application, attachmentOptions) => ({
  ...createEmptyForm(),
  ...application,
  incentive_type_id: application.incentive_type_id ?? "",
  peer_review_proof_id: application.peer_review_proof_id ?? "",
  citation_no: application.citation_no ?? "",
  submission_date: normalizeDate(application.submission_date),
  publication_date: normalizeDate(application.publication_date),
  citation_date: normalizeDate(application.citation_date),
  attachment_info_ids: normalizeAttachmentIds(application, attachmentOptions),
});

function StaticField({
  form,
  label,
  multiline = false,
  name,
  onChange,
  readOnly = false,
  required = false,
  rowClass = "",
  type = "text",
}) {
  return (
    <div className={`publication-incentive__row ${rowClass}`} role="row">
      <label htmlFor={`incentive-${name}`}>{label}</label>
      <div role="cell">
        {multiline ? (
          <textarea
            id={`incentive-${name}`}
            name={name}
            onChange={onChange}
            readOnly={readOnly}
            required={required}
            rows="3"
            value={form[name] ?? ""}
          />
        ) : (
          <input
            id={`incentive-${name}`}
            min={type === "number" ? "0" : undefined}
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

function CheckboxList({ items, label, multiple = false, onChange, readOnly, selected }) {
  return (
    <div className="publication-incentive__checkbox-list" aria-label={label}>
      {items.map((item) => (
        <label key={item.id}>
          <input
            checked={multiple ? selected.includes(Number(item.id)) : Number(selected) === Number(item.id)}
            disabled={readOnly}
            onChange={() => onChange(item.id)}
            type="checkbox"
          />
          <span>{item.name}</span>
        </label>
      ))}
    </div>
  );
}

function ResearchIncentiveRequest({ reviewMode = false }) {
  const history = useHistory();
  const location = useLocation();
  const linkedApplication = new URLSearchParams(location.search).get('application_id');
  const openedLink = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [form, setForm] = useState(createEmptyForm);
  const [incentiveTypes, setIncentiveTypes] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [peerReviewProofs, setPeerReviewProofs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [statusTables, setStatusTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [loadError, setLoadError] = useState("");
  const api = useMemo(() => new IncentiveFormsAPI(), []);
  const endorsementApi = useMemo(() => new ResearchApplicationAPI(), []);

  const loadData = useCallback(async () => {
    openedLink.current = null;
    setIsLoading(true);
    setLoadError("");

    try {
      const [typesResponse, attachmentResponse, proofResponse, statusResponse, applicationsResponse] =
        await Promise.all([
          api.fetchIncentiveTypes(),
          api.fetchAttachmentInfos(),
          api.fetchPeerReviewProofs(),
          endorsementApi.fetchStatus(),
          reviewMode
            ? api.fetchApplicationsForReview()
            : api.fetchUserApplications(),
        ]);

      setIncentiveTypes(getCollection(typesResponse, ["SIncentiveTypes"]));
      setAttachments(getCollection(attachmentResponse, ["SAttachmentInfos"]));
      setPeerReviewProofs(getCollection(proofResponse, ["SPeerReviewProof", "SPeerReviewProofs"]));
      setStatusTables(getCollection(statusResponse, ["StatusTables", "status_tables"]));

      if (!applicationsResponse?.ok) {
        setLoadError(getErrorMessage(applicationsResponse, "Please try loading your applications again."));
        return;
      }

      setApplications(getCollection(applicationsResponse, [
        "IncentiveForms",
        "CIncentiveForms",
        "incentive_forms",
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
        Number(status.id) === Number(getApplicationStatusId(application, 3))
    )?.status || "Unknown";

  const historyApplications = applications.map((application, index) => ({
    ...application,
    id: application.id ?? application.incentive_form_id ?? index + 1,
    status: getStatusName(application),
    submittedDate: formatDisplayDate(getCreatedDate(application)),
    title: application.title_of_work || "Untitled research",
  }));
  const displayedApplications = sortApplicationsNewestFirst(historyApplications, getCreatedDate);

  const openNewApplication = () => {
    setSelectedApplication(null);
    setForm(createEmptyForm());
    setShowForm(true);
  };

  const openApplication = (application) => {
    setSelectedApplication(application);
    setForm(applicationToForm(application, attachments));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!linkedApplication) { openedLink.current = null; return; }
    if (isLoading || loadError || openedLink.current === linkedApplication) return;
    openedLink.current = linkedApplication;
    const application = applications.find(item => String(item.id) === linkedApplication);
    if (!application) {
      setLoadError('This application is unavailable or you no longer have access to it.');
      return;
    }
    setSelectedApplication(application);
    setForm(applicationToForm(application, attachments));
    setShowForm(true);
  }, [linkedApplication, applications, attachments, isLoading, loadError]);

  const closeForm = () => {
    if (linkedApplication) {
      const query = new URLSearchParams(location.search);
      query.delete('application_id');
      history.replace({ pathname: location.pathname, search: query.toString() });
    }
    setShowForm(false);
    setSelectedApplication(null);
    setForm(createEmptyForm());
  };

  const isDecisionFinal = Boolean(selectedApplication) &&
    [10, 11].includes(Number(getApplicationStatusId(selectedApplication, 3)));

  const handleStatusAction = async (statusId) => {
    if (!reviewMode || !selectedApplication || isUpdatingStatus || isDecisionFinal) return;

    const researchId =
      selectedApplication.research_id ??
      selectedApplication.Research?.id ??
      selectedApplication.research?.id ??
      selectedApplication.id ??
      selectedApplication.incentive_form_id;

    if (researchId == null) {
      toast.error("The research ID for this application is unavailable.");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const response = await endorsementApi.updateEndorsementStatus(
        researchId,
        3,
        { status_id: statusId }
      );

      if (!response?.ok) {
        toast.error(
          getErrorMessage(response, "The application status could not be updated.")
        );
        return;
      }

      toast.success(
        statusId === 10
          ? "Incentive application approved successfully."
          : "Incentive application rejected successfully."
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

  const selectSingle = (field, id) => {
    if (selectedApplication) return;
    setForm((current) => ({
      ...current,
      [field]: Number(current[field]) === Number(id) ? "" : Number(id),
    }));
  };

  const toggleAttachment = (id) => {
    if (selectedApplication) return;
    const numericId = Number(id);
    setForm((current) => ({
      ...current,
      attachment_info_ids: current.attachment_info_ids.includes(numericId)
        ? current.attachment_info_ids.filter((infoId) => infoId !== numericId)
        : [...current.attachment_info_ids, numericId],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedApplication || isSubmitting) return;

    if (!form.incentive_type_id) {
      toast.error("Please select an incentive type.");
      return;
    }

    const payload = {
      name_of_authors: form.name_of_authors.trim(),
      email_address: form.email_address.trim(),
      contact_number: form.contact_number.trim(),
      incentive_type_id: Number(form.incentive_type_id),
      submission_date: form.submission_date,
      publisher_info: form.publisher_info.trim(),
      title_of_work: form.title_of_work.trim(),
      publication_date: form.publication_date || null,
      citation_date: form.citation_date || null,
      citation_no: form.citation_no === "" ? null : Number(form.citation_no),
      isbn: form.isbn.trim(),
      peer_review_proof_id: form.peer_review_proof_id
        ? Number(form.peer_review_proof_id)
        : null,
      CAttachmentInfos: form.attachment_info_ids.map((infoId) => ({
        info_id: infoId,
        is_active: 1,
      })),
    };

    setIsSubmitting(true);
    try {
      const response = await api.createApplication(payload);
      if (!response?.ok) {
        toast.error(getErrorMessage(response, "The incentive application could not be created."));
        return;
      }

      toast.success("Incentive application created successfully.");
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
        <main className="publication-incentive" aria-labelledby="publication-incentive-title">
          <div className="application-history__form-navigation">
            <button type="button" onClick={closeForm}>
              <FiArrowLeft aria-hidden="true" />
              {reviewMode ? "Back to applications for approval" : "Back to past applications"}
            </button>
          </div>
          <form className="publication-incentive__sheet" onSubmit={handleSubmit}>
            <header className="publication-incentive__header">
              <div className="publication-incentive__brand">
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

            <h1 id="publication-incentive-title">RESEARCH PUBLICATION, CITATION, AND H-INDEX INCENTIVE FORM</h1>

            <div className="publication-incentive__table" role="table" aria-label="Research publication, citation, and H-index incentive form">
              <div className="publication-incentive__row publication-incentive__row--header" role="row">
                <div role="columnheader">AUTHOR PROFILE/<br />INFORMATION</div>
                <div role="columnheader">DETAILS</div>
              </div>

              <StaticField form={form} label="Name of Author/s:" name="name_of_authors" onChange={handleFieldChange} readOnly={isReadOnly} required rowClass="publication-incentive__row--medium" />
              <StaticField form={form} label="Email Address of the Author/s:" name="email_address" onChange={handleFieldChange} readOnly={isReadOnly} required type="email" />
              <StaticField form={form} label="Contact Number of the Author/s:" name="contact_number" onChange={handleFieldChange} readOnly={isReadOnly} required rowClass="publication-incentive__row--medium" type="tel" />

              <div className="publication-incentive__row publication-incentive__row--incentive" role="row">
                <label>Incentive Type and Category<br />(Please mark appropriate):</label>
                <div role="cell"><CheckboxList items={incentiveTypes} label="Incentive type and category" onChange={(id) => selectSingle("incentive_type_id", id)} readOnly={isReadOnly} selected={form.incentive_type_id} /></div>
              </div>

              <StaticField form={form} label="Date of Submission" name="submission_date" onChange={handleFieldChange} readOnly={isReadOnly} required type="date" />
              <StaticField form={form} label="Name and Contact Information of Publisher/" multiline name="publisher_info" onChange={handleFieldChange} readOnly={isReadOnly} required rowClass="publication-incentive__row--medium" />
              <StaticField form={form} label="Title of the Research Work/ Published Article/Book:" multiline name="title_of_work" onChange={handleFieldChange} readOnly={isReadOnly} required rowClass="publication-incentive__row--large" />
              <StaticField form={form} label="Date of Publication:" name="publication_date" onChange={handleFieldChange} readOnly={isReadOnly} rowClass="publication-incentive__row--large" type="date" />
              <StaticField form={form} label="Date of Citation (If applicable):" name="citation_date" onChange={handleFieldChange} readOnly={isReadOnly} type="date" />
              <StaticField form={form} label="No. of Citation:" name="citation_no" onChange={handleFieldChange} readOnly={isReadOnly} type="number" />
              <StaticField form={form} label="ISBN/ISSN/DOI:" name="isbn" onChange={handleFieldChange} readOnly={isReadOnly} />

              <div className="publication-incentive__row publication-incentive__row--attachments" role="row">
                <label>Attachments (Attach all that apply):</label>
                <div role="cell"><CheckboxList items={attachments} label="Attachments" multiple onChange={toggleAttachment} readOnly={isReadOnly} selected={form.attachment_info_ids} /></div>
              </div>

              <div className="publication-incentive__row publication-incentive__row--peer-review" role="row">
                <div role="cell">
                  <strong>Proof of Peer-Review</strong>
                  <p>Proof of Peer Review<br />(Required for Publication Incentive; Optional for Citation/H-index Incentive)</p>
                </div>
                <div role="cell"><CheckboxList items={peerReviewProofs} label="Proof of peer review" onChange={(id) => selectSingle("peer_review_proof_id", id)} readOnly={isReadOnly} selected={form.peer_review_proof_id} /></div>
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
              <div className="publication-incentive__actions">
                <button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Creating…" : "Create Application"}
                </button>
              </div>
            ) : null}
          </form>
        </main>
      ) : (
        <ApplicationHistory
          title={reviewMode ? "Incentive Applications" : "Research Incentive Requests"}
          description={reviewMode
            ? "Review submitted publication, citation, and H-index incentive applications."
            : "View your previous incentive requests or submit a new publication, citation, or H-index application."
          }
          emptyTitle={reviewMode ? "No incentive applications yet" : undefined}
          emptyMessage={reviewMode
            ? "Submitted applications will appear here, including approved and rejected applications."
            : "New incentive requests will appear here after they are submitted."
          }
          applications={displayedApplications}
          nameColumnLabel="Name of Researcher"
          nameColumnField="name_of_authors"
          errorMessage={loadError}
          isLoading={isLoading}
          onBack={() => history.push("/dashboard")}
          onCreate={openNewApplication}
          onRetry={loadData}
          onSelect={openApplication}
          showCreate={!reviewMode}
          showApplicationId={false}
          tableDescription={reviewMode
            ? "Select an application to open its form and review the submitted details."
            : undefined
          }
          tableTitle={reviewMode ? "All applications" : undefined}
        />
      )}
    </MainContainer>
  );
}

export default ResearchIncentiveRequest;
