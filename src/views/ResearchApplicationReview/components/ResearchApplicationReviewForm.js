import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useForm, useWatch } from "react-hook-form";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiExternalLink,
  FiFileText,
  FiHelpCircle,
  FiMessageSquare,
  FiSave,
  FiSend,
  FiUser,
  FiX,
} from "react-icons/fi";
import FormCard from "../../../components/Card/FormCard";
import TextInputCustom from "../../../components/Input/TextInputCustom";
import TransparentLoader from "../../../components/Loader/TransparentLoader";
import ResearchApplicationAPI from "../../../api/ResearchApplicationAPI";
import { useHistory, useParams } from "react-router-dom";
import { documentDescriptions } from "../../../components/Helper/DocumentDescription";
import { BASE_URL } from "../../../constants/url";
import { formatDisplayName } from "../../../utils/formatName";
import "../../ResearchApplication/component/research-application.scss";
import "./research-application-review.scss";

const DOCUMENT_TYPES = [
  { id: 1, document_name: "Letter of Intent" },
  { id: 2, document_name: "Research Proposal" },
  { id: 3, document_name: "Researcher/s Curriculum Vitae (CV)" },
  { id: 6, document_name: "Gantt Chart" },
  { id: 7, document_name: "Detailed Budget Breakdown" },
];

const BUDGET_BREAKDOWN = [
  { id: 1, fund_name: "Equipment" },
  { id: 2, fund_name: "Transportation" },
  { id: 3, fund_name: "Supplies" },
  { id: 4, fund_name: "Analysis and Laboratory Test" },
];

const REMARKS_READ_ONLY_ROLE_IDS = new Set([4, 5]);

const getResearchDocuments = (research) => {
  const documents =
    research?.research_documents ||
    research?.ResearchDocuments ||
    research?.researchDocuments ||
    [];

  return documents.map((document) => ({
    ...document,
    document_title_id: Number(
      document.document_title_id ??
        document.document_type_id ??
        document.DocumentType?.id
    ),
    document_filepath:
      document.document_filepath ||
      document.filepath ||
      document.file_path ||
      null,
  }));
};

const isCompletedEndorsement = (endorsement) => {
  const status =
    endorsement?.status || endorsement?.StatusTable?.status || "";

  return (
    Number(endorsement?.status_id) === 6 ||
    String(status).trim().toLowerCase() === "endorsed"
  );
};

const isCurrentUserEndorsement = (endorsement, userID) => {
  const endorserID =
    endorsement?.endorsement_rep_id ??
    endorsement?.user_account_id ??
    endorsement?.User?.UserAccount?.id ??
    endorsement?.User?.UserAccount?.user_id;

  return Number(endorserID) === Number(userID);
};

const getEndorserID = (endorsement) =>
  endorsement?.endorsement_rep_id ??
  endorsement?.user_account_id ??
  endorsement?.User?.UserAccount?.id ??
  endorsement?.User?.UserAccount?.user_id;

const APPROVER_LABELS = [
  "Research Coordinator",
  "Department Chairperson",
  "College Dean",
];

const getEndorsementContext = (roleName, researchTitle) => {
  const title = researchTitle || "this research";

  if (roleName.includes("coordinator")) {
    return {
      actor: "Research Coordinator",
      confirmation: `Are you sure you want to endorse “${title}” to the Department Chairperson?`,
      success: `“${title}” has been endorsed to the Department Chairperson.`,
    };
  }

  if (roleName.includes("chairperson") || roleName.includes("department chair")) {
    return {
      actor: "Department Chairperson",
      confirmation: `Are you sure you want to endorse “${title}” to the College Dean?`,
      success: `“${title}” has been endorsed to the College Dean.`,
    };
  }

  if (roleName.includes("dean")) {
    return {
      actor: "College Dean",
      confirmation: `Are you sure you want to give final endorsement to “${title}”?`,
      success: `“${title}” has received final college endorsement.`,
    };
  }

  return {
    actor: "Research Reviewer",
    confirmation: `Are you sure you want to endorse “${title}”?`,
    success: `“${title}” has been endorsed successfully.`,
  };
};

function EndorsementDialog({
  mode,
  context,
  error,
  isSubmitting,
  onCancel,
  onConfirm,
  onComplete,
}) {
  const isSuccess = mode === "success";

  return (
    <Modal
      show={Boolean(mode)}
      onHide={isSuccess ? onComplete : onCancel}
      centered
      contentClassName="endorsement-dialog"
      backdrop={isSubmitting ? "static" : true}
      keyboard={!isSubmitting}
    >
      <Modal.Header closeButton={!isSubmitting}>
        <div>
          <span>{isSuccess ? "Endorsement recorded" : "Confirm endorsement"}</span>
          <Modal.Title>{context.actor}</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <span
          className={`endorsement-dialog__icon ${
            isSuccess ? "endorsement-dialog__icon--success" : ""
          }`}
          aria-hidden="true"
        >
          {isSuccess ? <FiCheck /> : <FiHelpCircle />}
        </span>
        <div className="endorsement-dialog__message">
          <h3>{isSuccess ? "Endorsement successful" : "Continue with endorsement?"}</h3>
          <p>{isSuccess ? context.success : context.confirmation}</p>
          {error && <p className="endorsement-dialog__error">{error}</p>}
        </div>
      </Modal.Body>
      <Modal.Footer>
        {isSuccess ? (
          <Button className="btn-confirmation-custom" onClick={onComplete}>
            Done
          </Button>
        ) : (
          <>
            <Button
              type="button"
              className="btn-outline-custom"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="btn-confirmation-custom"
              onClick={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Endorsing..." : "Yes, endorse"}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}

function SectionHeader({ number, title, description, icon }) {
  return (
    <div className="research-application__section-header">
      <span className="research-application__section-number" aria-hidden="true">
        {icon || number}
      </span>
      <div>
        <h2>{number ? `${number}. ${title}` : title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

function ReviewProgress({ currentStep }) {
  const steps = [
    { number: 1, label: "Application details" },
    { number: 2, label: "Requirements & endorsement" },
  ];

  return (
    <ol className="research-application__progress" aria-label="Review progress">
      {steps.map((item) => {
        const isComplete = item.number < currentStep;
        const isCurrent = item.number === currentStep;

        return (
          <li
            key={item.number}
            className={`${isComplete ? "is-complete" : ""} ${
              isCurrent ? "is-current" : ""
            }`}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span>{isComplete ? <FiCheck /> : item.number}</span>
            <strong>{item.label}</strong>
          </li>
        );
      })}
    </ol>
  );
}

export function ResearcherSection({ index, isMain, register }) {
  const researcherLabel = isMain
    ? "Researcher 1 (Main Author)"
    : `Researcher ${index + 1} (Co-author)`;

  return (
    <section className="researcher-panel researcher-panel--active">
      <div className="researcher-panel__header">
        <div className="researcher-panel__identity">
          <span className="researcher-panel__avatar" aria-hidden="true">
            <FiUser />
          </span>
          <div>
            <h3>{researcherLabel}</h3>
            <p>{isMain ? "Primary author" : "Co-author"}</p>
          </div>
        </div>
        <span className="review-application__readonly-badge">Read only</span>
      </div>

      <div className="researcher-panel__body">
        <div className="research-application__field-grid">
          <TextInputCustom
            label="ID Number"
            type="text"
            disabled
            {...register(`researchers.${index}.id_number`)}
          />
          <TextInputCustom
            label="First Name"
            type="text"
            disabled
            {...register(`researchers.${index}.first_name`)}
          />
          <TextInputCustom
            label="Last Name"
            type="text"
            disabled
            {...register(`researchers.${index}.last_name`)}
          />
          <TextInputCustom
            label="Mobile No."
            type="tel"
            disabled
            {...register(`researchers.${index}.mobile_number`)}
          />
          <TextInputCustom
            label="Email"
            type="email"
            disabled
            {...register(`researchers.${index}.email`)}
          />

          <Form.Group className="custom-input">
            <Form.Label className="custom-label">College</Form.Label>
            <Form.Select
              className="custom-control"
              disabled
              {...register(`researchers.${index}.college`)}
            >
              <option value="">Select College</option>
              <option value="college-1">College 1</option>
              <option value="college-2">College 2</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="custom-input">
            <Form.Label className="custom-label">Department</Form.Label>
            <Form.Select
              className="custom-control"
              disabled
              {...register(`researchers.${index}.dept`)}
            >
              <option value="">Select Department</option>
              <option value="dept-1">Department 1</option>
              <option value="dept-2">Department 2</option>
            </Form.Select>
          </Form.Group>
        </div>
      </div>
    </section>
  );
}

function ResearchApplicationReviewForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const name = formatDisplayName(localStorage.getItem("name")) || "John Doe";
  const [research, setResearch] = useState();
  const [remarks, setRemarks] = useState("");
  const [remarksHistory, setRemarksHistory] = useState([]);
  const [checked, setChecked] = useState(false);
  const [endorsementDialog, setEndorsementDialog] = useState(null);
  const [endorsementError, setEndorsementError] = useState("");
  const [isEndorsing, setIsEndorsing] = useState(false);
  const userID = localStorage.getItem("id");
  const roleID = Number(localStorage.getItem("role_id"));
  const roleName = (localStorage.getItem("role") || "").toLowerCase();
  const isApplicationOwner = Boolean(
    research?.submitted_by &&
      name &&
      research.submitted_by.trim().toLowerCase() === name.trim().toLowerCase()
  );
  const isListedResearcher = Boolean(
    name &&
      research?.research_investigators?.some(
        (investigator) =>
          investigator.name?.trim().toLowerCase() === name.trim().toLowerCase()
      )
  );
  const isResearcher =
    roleName.includes("researcher") ||
    isApplicationOwner ||
    isListedResearcher;
  const isRemarksReadOnlyRole =
    REMARKS_READ_ONLY_ROLE_IDS.has(roleID) ||
    roleName.includes("chairperson") ||
    roleName.includes("department chair") ||
    roleName.includes("college dean");
  const canLeaveRemarks = !isResearcher && !isRemarksReadOnlyRole;
  const hasAlreadyEndorsed = [
    ...(research?.endorsements || []),
    ...(remarksHistory || []),
  ].some(
    (endorsement) =>
      isCurrentUserEndorsement(endorsement, userID) &&
      isCompletedEndorsement(endorsement)
  );
  const endorsementSources = research?.endorsements?.length
    ? research.endorsements
    : remarksHistory;
  const approvalProgress = endorsementSources
    .map((endorsement, index) => {
      const relatedEndorsement = remarksHistory.find(
        (item) => Number(getEndorserID(item)) === Number(getEndorserID(endorsement))
      );
      const user = relatedEndorsement?.User || endorsement?.User;
      const role =
        endorsement?.role_desc ||
        endorsement?.endorsement_rep_role ||
        user?.UserAccount?.UserRole?.role_desc ||
        APPROVER_LABELS[index] ||
        "Approver";
      const approverName =
        formatDisplayName(
          endorsement?.endorsement_rep_name || endorsement?.rep_name
        ) ||
        formatDisplayName(
          user?.first_name,
          user?.middle_name,
          user?.last_name
        ) ||
        "Assigned approver";
      const endorsed =
        isCompletedEndorsement(endorsement) ||
        isCompletedEndorsement(relatedEndorsement);

      return {
        id: getEndorserID(endorsement) ?? `${role}-${index}`,
        role,
        approverName,
        endorsed,
      };
    })
    .sort((a, b) => {
      const getOrder = (role) => {
        const normalizedRole = role.toLowerCase();
        if (normalizedRole.includes("coordinator")) return 1;
        if (
          normalizedRole.includes("chairperson") ||
          normalizedRole.includes("department chair")
        )
          return 2;
        if (normalizedRole.includes("dean")) return 3;
        return 4;
      };

      return getOrder(a.role) - getOrder(b.role);
    });
  const endorsementContext = getEndorsementContext(roleName, research?.title);
  const history = useHistory();

  const {
    control,
    handleSubmit,
    register,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      category: [],
      purpose_id: 1,
      version_number: "",
      research_duration: "",
      ethical_considerations: false,
      submitted_by: name,
      submitted_date: new Date().toISOString().split("T")[0],
      researchers: Array.from({ length: 5 }, () => ({})),
      breakdown: BUDGET_BREAKDOWN.map((item) => ({
        checked: false,
        fund_id: item.id,
        amount: "",
      })),
      documents: [],
    },
  });

  useEffect(() => {
    let isActive = true;

    const loadReview = async () => {
      setLoading(true);
      const api = new ResearchApplicationAPI();
      const [researchResponse, commentsResponse] = await Promise.all([
        api.getResearchById(id),
        api.getAllEndorsementComments(id),
      ]);

      if (!isActive) return;

      if (researchResponse.ok) {
        setResearch(researchResponse.data?.Research);
      } else {
        console.error(researchResponse.data);
      }

      if (commentsResponse.ok) {
        setRemarksHistory(commentsResponse.data?.Endorsements || []);
      } else {
        console.error(
          "Failed to fetch endorsement comments:",
          commentsResponse.data
        );
      }

      setLoading(false);
    };

    loadReview();
    return () => {
      isActive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!canLeaveRemarks) {
      setChecked(false);
      setRemarks("");
    }
  }, [canLeaveRemarks]);

  // Map research data to form
  useEffect(() => {
    if (research) {
      const researchers = Array.from({ length: 5 }, () => ({}));
      research.research_investigators.forEach((inv, i) => {
        const names = inv.name.split(" ");
        researchers[i] = {
          id_number: inv.id_number,
          first_name: names[0] || "",
          last_name: names.slice(-1)[0] || "",
          mobile_number: inv.mobile_number,
          email: inv.email,
          college: inv.college,
          dept: inv.dept,
          enabled: true,
        };
      });

      const breakdown = BUDGET_BREAKDOWN.map((item) => {
        const existing = research.budget_breakdowns.find(
          (budget) => budget.fund_id === item.id
        );
        return {
          fund_id: item.id,
          checked: !!existing,
          amount: existing ? existing.amount : "",
        };
      });

      const researchDocuments = getResearchDocuments(research);
      const documents = DOCUMENT_TYPES.map((doc) => {
        const existing = researchDocuments.find(
          (document) => document.document_title_id === Number(doc.id)
        );
        return {
          document_title_id: doc.id,
          document_name: doc.document_name,
          file: existing ? existing.document_filepath : null,
        };
      });

      const endorsements = research.endorsements.map((e) => ({
        endorsement_rep_name: e.endorsement_rep_name,
        status: e.status,
        endorsement_rep_id: e.user_account_id,
      }));

      reset({
        title: research.title,
        version_number: research.version_number,
        category: research.category.map((c) => c.id),
        research_duration: research.research_duration,
        ethical_considerations: research.ethical_considerations === 1,
        submitted_by: formatDisplayName(research.submitted_by),
        submitted_date: research.submitted_date.split("T")[0],
        researchers,
        breakdown,
        documents,
        endorsements,
        purpose_id: research.purpose_id,
      });
    }
  }, [research, reset]);

  const breakdownValues = useWatch({ control, name: "breakdown" }) || [];
  const checkedValues = watch("breakdown");
  const totalAmount = breakdownValues.reduce((acc, curr) => {
    const isChecked = curr?.checked;
    const amount =
      parseFloat(String(curr?.amount || "").replace(/,/g, "")) || 0;
    return isChecked ? acc + amount : acc;
  }, 0);

  const handleViewDocument = (doc) => {
    if (!doc || !doc.document_filepath) {
      alert("No document available");
      return;
    }

    let filePath = doc.document_filepath.replace(/\\/g, "/");

    if (!filePath.startsWith("http")) {
      filePath = filePath.replace(/^\/+/, "");
      filePath = `${BASE_URL}/${filePath}`;
    }

    window.open(filePath, "_blank", "noopener,noreferrer");
  };

  const updateEndorsementStatus = async () => {
    if (isResearcher || hasAlreadyEndorsed) {
      return;
    }

    const hasUserRemarks = remarksHistory?.some(
      (endorsement) =>
        Number(endorsement.endorsement_rep_id) === Number(userID) &&
        endorsement.remarks &&
        endorsement.remarks.trim() !== ""
    );

    if (canLeaveRemarks && hasUserRemarks) {
      setEndorsementError("You have already submitted a remark for this application.");
      return;
    }

    const payload = {
      status_id: 6,
      remarks: canLeaveRemarks ? remarks : "",
    };

    setIsEndorsing(true);
    setEndorsementError("");

    try {
      const response =
        await new ResearchApplicationAPI().updateEndorsementStatus(id, payload);

      if (response.ok) {
        setEndorsementDialog("success");
      } else {
        setEndorsementError(
          response.data?.message ||
            "The endorsement could not be completed. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      setEndorsementError(
        "The endorsement could not reach the server. Please try again."
      );
    } finally {
      setIsEndorsing(false);
    }
  };

  const onSubmit = () => {
    if (isResearcher || hasAlreadyEndorsed) return;
    setEndorsementError("");
    setEndorsementDialog("confirm");
  };

  const closeEndorsementDialog = () => {
    if (isEndorsing) return;
    setEndorsementError("");
    setEndorsementDialog(null);
  };

  const completeEndorsement = () => {
    setEndorsementDialog(null);
    history.push("/research-application-review");
  };

  return (
    <main className="application-form research-application review-application">
      {loading && <TransparentLoader />}
      <div className="form-container">
        <header className="research-application__page-header">
          <div>
            <span className="research-application__eyebrow">Research review</span>
            <h1>Review Research Application</h1>
            <p>
              Review the proposal details, supporting requirements, and
              endorsement history before taking action.
            </p>
          </div>
          <span className="research-application__step-count">Step {step} of 2</span>
        </header>

        <ReviewProgress currentStep={step} />

        <Form className="form" onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <>
              <FormCard className="research-application__card">
                <SectionHeader
                  number="I"
                  title="Research Overview"
                  description="The working title submitted by the research team."
                />
                <Form.Group className="research-application__title-field">
                  <Form.Label>Research title</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={research?.title || ""}
                    disabled
                  />
                </Form.Group>
              </FormCard>

              <FormCard className="research-application__card">
                <SectionHeader
                  number="II"
                  title="Research Agenda Category"
                  description="Categories selected for the submitted proposal."
                />
                <div className="research-application__category-grid">
                  {research?.category?.map((item) => (
                    <label
                      className="research-application__category-option"
                      key={item.id}
                    >
                      <Form.Check.Input type="checkbox" checked disabled readOnly />
                      <span>{item.research_name}</span>
                    </label>
                  ))}
                </div>
              </FormCard>

              <FormCard className="research-application__card">
                <SectionHeader
                  number="III"
                  title="Purpose of Submission"
                  description="Submission type and the current proposal version."
                />
                <div className="research-application__purpose-grid">
                  <fieldset className="research-application__radio-group">
                    <legend>Submission type</legend>
                    <Form.Check
                      label="Initial submission"
                      type="radio"
                      checked={research?.purpose_id === 1}
                      disabled
                      readOnly
                    />
                    <Form.Check
                      label="Resubmission"
                      type="radio"
                      checked={research?.purpose_id === 2}
                      disabled
                      readOnly
                    />
                  </fieldset>
                  <Form.Group>
                    <Form.Label>Version number</Form.Label>
                    <Form.Control
                      type="text"
                      value={research?.version_number || ""}
                      disabled
                    />
                  </Form.Group>
                </div>
              </FormCard>

              <FormCard className="research-application__card research-application__card--investigators">
                <SectionHeader
                  number="IV"
                  title="Investigators"
                  description="Authors listed on this research application."
                />
                <div className="research-application__researchers">
                  {Array.from(
                    {
                      length: Math.max(
                        research?.research_investigators?.length || 0,
                        1
                      ),
                    },
                    (_, index) => (
                      <ResearcherSection
                        key={index}
                        index={index}
                        isMain={index === 0}
                        register={register}
                      />
                    )
                  )}
                </div>
              </FormCard>
            </>
          )}

          {step === 2 && (
            <>
              <FormCard className="research-application__card">
                <SectionHeader
                  number="V"
                  title="Project Details"
                  description="Expected duration and ethics-review requirements."
                />
                <div className="research-application__field-grid research-application__field-grid--compact">
                  <TextInputCustom
                    label="Duration (semesters)"
                    type="text"
                    {...register("research_duration")}
                    disabled
                  />
                  <div className="research-application__ethics-option">
                    <Form.Check
                      label="This research involves human participants"
                      type="switch"
                      {...register("ethical_considerations")}
                      checked={research?.ethical_considerations === 1}
                      disabled
                      readOnly
                    />
                    <small>Ethics review by the UERC is required.</small>
                  </div>
                </div>
              </FormCard>

              <FormCard className="research-application__card">
                <SectionHeader
                  number="VI"
                  title="Submission Details"
                  description="Applicant and submission date recorded by the system."
                />
                <div className="research-application__field-grid">
                  <TextInputCustom
                    label="Submitted by"
                    type="text"
                    disabled
                    {...register("submitted_by")}
                  />
                  <TextInputCustom
                    label="Submission date"
                    type="date"
                    disabled
                    {...register("submitted_date")}
                  />
                </div>
              </FormCard>

              <FormCard className="research-application__card">
                <SectionHeader
                  number="VII"
                  title="Endorsement"
                  description="Current endorsement status for each representative."
                />
                <div className="research-application__endorsements">
                  {research?.endorsements?.map((item, index) => (
                    <div
                      className="research-application__endorsement-row"
                      key={item.endorsement_rep_id}
                    >
                      <TextInputCustom
                        disabled
                        label={`Representative ${index + 1}`}
                        type="text"
                        value={item.endorsement_rep_name || ""}
                      />
                      <TextInputCustom
                        label="Status"
                        type="text"
                        disabled
                        value={item.status || ""}
                      />
                    </div>
                  ))}
                </div>
              </FormCard>

              <FormCard className="research-application__card">
                <SectionHeader
                  title="Supporting Requirements"
                  description="Review each submitted document before endorsement."
                  icon={<FiFileText />}
                />
                <div className="review-application__documents">
                  {DOCUMENT_TYPES.map((doc) => {
                    const submittedDocument = getResearchDocuments(
                      research
                    ).find(
                      (item) => item.document_title_id === Number(doc.id)
                    );

                    return (
                      <section className="review-document" key={doc.id}>
                        <div className="review-document__content">
                          <h3>{doc.document_name}</h3>
                          <p>{documentDescriptions[doc.document_name]}</p>
                        </div>
                        <div className="review-document__status">
                          {submittedDocument?.document_filepath ? (
                            <>
                              <span className="review-document__submitted">
                                <FiCheck /> Submitted
                              </span>
                              <Button
                                type="button"
                                className="review-document__view"
                                onClick={() =>
                                  handleViewDocument(submittedDocument)
                                }
                              >
                                View <FiExternalLink />
                              </Button>
                            </>
                          ) : (
                            <span className="review-document__missing">
                              Not uploaded
                            </span>
                          )}
                        </div>

                        {doc.id === 7 && (
                          <div className="budget-breakdown">
                            <div className="budget-breakdown__header">
                              <span>Maintenance / operational fund</span>
                              <span>Amount (PHP)</span>
                            </div>
                            {BUDGET_BREAKDOWN.map((item, index) => (
                              <div className="budget-breakdown__row" key={item.id}>
                                <Form.Check
                                  type="checkbox"
                                  label={item.fund_name}
                                  checked={
                                    checkedValues?.[index]?.checked || false
                                  }
                                  disabled
                                  readOnly
                                />
                                <Form.Control
                                  type="text"
                                  className="text-end"
                                  value={checkedValues?.[index]?.amount || ""}
                                  disabled
                                />
                              </div>
                            ))}
                            <div className="budget-breakdown__total">
                              <strong>Overall total</strong>
                              <Form.Control
                                readOnly
                                value={(totalAmount || 0).toLocaleString(
                                  "en-PH",
                                  { minimumFractionDigits: 2 }
                                )}
                                className="text-end"
                              />
                            </div>
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              </FormCard>

              <FormCard className="research-application__card review-application__remarks">
                <SectionHeader
                  title="Review Remarks"
                  description={
                    canLeaveRemarks
                      ? "Read previous comments or add one endorsement remark."
                      : "Read remarks left by the application reviewers."
                  }
                  icon={<FiMessageSquare />}
                />

                {approvalProgress.length > 0 && (
                  <div
                    className="review-application__approval-progress"
                    aria-label="Endorsement progress"
                  >
                    <div className="review-application__approval-heading">
                      <strong>Endorsement progress</strong>
                      <span>Coordinator to Chairperson to Dean</span>
                    </div>
                    <ol>
                      {approvalProgress.map((approver, index) => (
                        <li
                          className={approver.endorsed ? "is-endorsed" : ""}
                          key={approver.id}
                        >
                          <span
                            className="review-application__approval-marker"
                            aria-hidden="true"
                          >
                            {approver.endorsed ? <FiCheck /> : index + 1}
                          </span>
                          <div className="review-application__approver">
                            <strong>{approver.role}</strong>
                            <span>{approver.approverName}</span>
                          </div>
                          <span className="review-application__approval-status">
                            {approver.endorsed ? "Endorsed" : "Pending"}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="review-application__remarks-history">
                  {remarksHistory?.filter(
                    (endorsement) =>
                      endorsement.remarks && endorsement.remarks.trim() !== ""
                  ).length ? (
                    remarksHistory
                      .filter(
                        (endorsement) =>
                          endorsement.remarks &&
                          endorsement.remarks.trim() !== ""
                      )
                      .map((endorsement) => (
                        <article
                          className="review-remark"
                          key={endorsement.endorsement_rep_id}
                        >
                          <div className="review-remark__author">
                            <strong>
                              {endorsement.User?.first_name}{" "}
                              {endorsement.User?.middle_name}{" "}
                              {endorsement.User?.last_name}
                            </strong>
                            <span>
                              {
                                endorsement.User?.UserAccount?.UserRole
                                  ?.role_desc
                              }
                              {endorsement.StatusTable?.status
                                ? ` · ${endorsement.StatusTable.status}`
                                : ""}
                            </span>
                          </div>
                          <p>{endorsement.remarks}</p>
                        </article>
                      ))
                  ) : (
                    <p className="review-application__remarks-empty">
                      No reviewer remarks have been added yet.
                    </p>
                  )}
                </div>

                {canLeaveRemarks &&
                  !remarksHistory?.some(
                    (endorsement) =>
                      Number(endorsement.endorsement_rep_id) ===
                        Number(userID) &&
                      endorsement.remarks &&
                      endorsement.remarks.trim() !== ""
                  ) && (
                    <div className="review-application__remark-entry">
                      <Form.Check
                        type="switch"
                        label="Add a remark"
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                      />
                      <Form.Control
                        as="textarea"
                        placeholder="Type your comments or suggestions."
                        rows={5}
                        value={remarks}
                        onChange={(event) => setRemarks(event.target.value)}
                        disabled={!checked}
                      />
                    </div>
                  )}
              </FormCard>
            </>
          )}

          <div className="research-application__actions">
            <Button
              type="button"
              className="btn-outline-custom"
              onClick={() => history.push("/research-application-review")}
            >
              <FiX /> Close
            </Button>

            <div className="research-application__actions-primary">
              {step === 1 ? (
                <Button
                  type="button"
                  className="btn-confirmation-custom"
                  onClick={() => setStep(2)}
                >
                  Next <FiArrowRight />
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    className="btn-outline-custom"
                    onClick={() => setStep(1)}
                  >
                    <FiArrowLeft /> Back
                  </Button>
                  {!isResearcher && (
                    <>
                      {canLeaveRemarks && (
                        <Button type="button" className="btn-outline-custom">
                          <FiSave /> Save
                        </Button>
                      )}
                      <Button
                        type="submit"
                        className="btn-confirmation-custom"
                        disabled={hasAlreadyEndorsed}
                        title={
                          hasAlreadyEndorsed
                            ? "You have already endorsed this application."
                            : undefined
                        }
                      >
                        {hasAlreadyEndorsed ? (
                          <>
                            <FiCheck /> Endorsed
                          </>
                        ) : (
                          <>
                            <FiSend /> Endorse
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </Form>
      </div>
      <EndorsementDialog
        mode={endorsementDialog}
        context={endorsementContext}
        error={endorsementError}
        isSubmitting={isEndorsing}
        onCancel={closeEndorsementDialog}
        onConfirm={updateEndorsementStatus}
        onComplete={completeEndorsement}
      />
    </main>
  );
}

export default ResearchApplicationReviewForm;
