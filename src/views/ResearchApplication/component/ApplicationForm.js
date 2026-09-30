import React, { useContext, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useForm, useWatch } from "react-hook-form";
import {
  FiArrowLeft,
  FiArrowRight,
  FiAlertCircle,
  FiCheck,
  FiFileText,
  FiSave,
  FiSend,
  FiUploadCloud,
  FiUser,
  FiX,
} from "react-icons/fi";
import FormCard from "../../../components/Card/FormCard";
import TextInputCustom from "../../../components/Input/TextInputCustom";
import ResearchApplicationAPI from "../../../api/ResearchApplicationAPI";
import TransparentLoader from "../../../components/Loader/TransparentLoader";
import { useHistory } from "react-router-dom";
import Auth from "../../../api/Auth";
import { UserContext } from "../../../context/UserContext";
import { toast } from "react-toastify";
import { formatDisplayName } from "../../../utils/formatName";
import "./research-application.scss";

const MAX_RESEARCHERS = 5;

const UPLOADABLE_DOCUMENTS = new Set([
  "Letter of Intent",
  "Research Proposal",
  "Researcher/s Curriculum Vitae (CV)",
  "Gantt Chart",
  "Detailed Budget Breakdown",
]);

const DOCUMENT_DESCRIPTIONS = {
  "Letter of Intent":
    "Submit a letter of intent addressed to the CRD Executive Director and endorsed by the College Research Coordinator, Department Chair, and College Dean.",
  "Research Proposal":
    "Include the background of the study, review of related literature, and methodology.",
  "Researcher/s Curriculum Vitae (CV)":
    "Include each researcher's previous research, thesis, or dissertation topic in the curriculum vitae.",
  "Initial Review and Screening":
    "All research applications undergo an initial review and screening before approval.",
  "Ethics Review":
    "Proposals involving human participants must undergo an Ethics Review by the UERC.",
  "Gantt Chart":
    "List activities related to project implementation, excluding proposal preparation.",
  "Detailed Budget Breakdown":
    "Provide a realistic estimate of the project's expected expenses.",
};

const createDefaultValues = () => ({
  title: "",
  category: [],
  purpose_id: 1,
  version_number: "",
  research_duration: "",
  ethical_considerations: false,
  submitted_by: "",
  submitted_date: "",
  researchers: Array.from({ length: MAX_RESEARCHERS }, () => ({
    enabled: false,
  })),
  endorsements: [],
  breakdown: [],
});

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

export function ResearcherSection({
  index,
  isMain,
  control,
  errors,
  register,
  setValue,
}) {
  const researcherLabel = isMain
    ? "Researcher 1 (Main Author)"
    : `Researcher ${index + 1} (Co-author)`;

  const researcherEnabled = useWatch({
    control,
    name: `researchers.${index}.enabled`,
  });
  const sameCollege = useWatch({ control, name: "sameCollege" });
  const sameDepartment = useWatch({ control, name: "sameDept" });
  const mainCollege = useWatch({ control, name: "researchers.0.college" });
  const mainDepartment = useWatch({ control, name: "researchers.0.dept" });
  const enabled = isMain || Boolean(researcherEnabled);
  const fieldErrors = errors?.[index] || {};

  useEffect(() => {
    if (!isMain && sameCollege && mainCollege) {
      setValue(`researchers.${index}.college`, mainCollege);
    }
  }, [index, isMain, sameCollege, mainCollege, setValue]);

  useEffect(() => {
    if (!isMain && sameDepartment && mainDepartment) {
      setValue(`researchers.${index}.dept`, mainDepartment);
    }
  }, [index, isMain, sameDepartment, mainDepartment, setValue]);

  return (
    <section
      className={`researcher-panel ${enabled ? "researcher-panel--active" : ""} ${
        Object.keys(fieldErrors).length ? "researcher-panel--invalid" : ""
      }`}
    >
      <div className="researcher-panel__header">
        <div className="researcher-panel__identity">
          <span className="researcher-panel__avatar" aria-hidden="true">
            <FiUser />
          </span>
          <div>
            <h3>{researcherLabel}</h3>
            <p>
              {isMain
                ? "Primary contact for this application"
                : "Optional team member"}
            </p>
          </div>
        </div>

        {!isMain && (
          <Form.Check
            type="switch"
            id={`researcher-enable-${index}`}
            label={enabled ? "Included" : "Add co-author"}
            className="researcher-panel__toggle"
            {...register(`researchers.${index}.enabled`)}
          />
        )}
      </div>

      {enabled && (
        <div className="researcher-panel__body">
          <div className="research-application__field-grid">
            <TextInputCustom
              label="ID Number"
              type="text"
              required={enabled}
              error={fieldErrors.id_number?.message}
              {...register(`researchers.${index}.id_number`, {
                required: enabled ? "Enter the researcher's ID number." : false,
              })}
            />
            <TextInputCustom
              label="First Name"
              type="text"
              required={enabled}
              error={fieldErrors.first_name?.message}
              {...register(`researchers.${index}.first_name`, {
                required: enabled ? "Enter the researcher's first name." : false,
              })}
            />
            <TextInputCustom
              label="Last Name"
              type="text"
              required={enabled}
              error={fieldErrors.last_name?.message}
              {...register(`researchers.${index}.last_name`, {
                required: enabled ? "Enter the researcher's last name." : false,
              })}
            />
            <TextInputCustom
              label="Mobile No."
              type="tel"
              required={enabled}
              error={fieldErrors.mobile_number?.message}
              {...register(`researchers.${index}.mobile_number`, {
                required: enabled ? "Enter the researcher's mobile number." : false,
              })}
            />
            <TextInputCustom
              label="Email"
              type="email"
              required={enabled}
              error={fieldErrors.email?.message}
              {...register(`researchers.${index}.email`, {
                required: enabled ? "Enter the researcher's email address." : false,
                pattern: enabled
                  ? {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address.",
                    }
                  : undefined,
              })}
            />

            <Form.Group className="custom-input">
              <Form.Label className="custom-label">
                {enabled && <span className="text-danger">*</span>} College
              </Form.Label>
              <Form.Select
                className="custom-control"
                disabled={sameCollege && !isMain}
                isInvalid={Boolean(fieldErrors.college)}
                aria-invalid={Boolean(fieldErrors.college)}
                {...register(`researchers.${index}.college`, {
                  required: enabled ? "Select the researcher's college." : false,
                })}
              >
                <option value="">Select College</option>
                <option value="college-1">College 1</option>
                <option value="college-2">College 2</option>
              </Form.Select>
              {fieldErrors.college && (
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.college.message}
                </Form.Control.Feedback>
              )}
              {isMain && (
                <Form.Check
                  type="checkbox"
                  label="Use for all co-authors"
                  className="researcher-panel__copy-option"
                  {...register("sameCollege")}
                />
              )}
            </Form.Group>

            <Form.Group className="custom-input">
              <Form.Label className="custom-label">
                {enabled && <span className="text-danger">*</span>} Department
              </Form.Label>
              <Form.Select
                className="custom-control"
                disabled={sameDepartment && !isMain}
                isInvalid={Boolean(fieldErrors.dept)}
                aria-invalid={Boolean(fieldErrors.dept)}
                {...register(`researchers.${index}.dept`, {
                  required: enabled
                    ? "Select the researcher's department."
                    : false,
                })}
              >
                <option value="">Select Department</option>
                <option value="dept-1">Department 1</option>
                <option value="dept-2">Department 2</option>
              </Form.Select>
              {fieldErrors.dept && (
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.dept.message}
                </Form.Control.Feedback>
              )}
              {isMain && (
                <Form.Check
                  type="checkbox"
                  label="Use for all co-authors"
                  className="researcher-panel__copy-option"
                  {...register("sameDept")}
                />
              )}
            </Form.Group>
          </div>
        </div>
      )}
    </section>
  );
}

const getUserAccount = (userData) => {
  if (!userData) return userData;

  return {
    ...userData,
    ...(userData.User || {}),
    ...(userData.UserAccount || {}),
    ...(userData.User?.UserAccount || {}),
  };
};

const getFirstAvailableValue = (source, keys) =>
  keys
    .map((key) => source?.[key])
    .find((value) => value !== undefined && value !== null && value !== "");

const getApiErrorMessage = (response) => {
  const responseData = response?.data;

  if (typeof responseData === "string" && responseData.length < 240) {
    return responseData;
  }

  return (
    responseData?.message ||
    responseData?.error ||
    "We couldn't submit the application. Please try again in a moment."
  );
};

function ApplicationProgress({ currentStep }) {
  const steps = [
    { number: 1, label: "Research details" },
    { number: 2, label: "Requirements" },
  ];

  return (
    <ol className="research-application__progress" aria-label="Application progress">
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

function BudgetBreakdown({
  items = [],
  checkedValues,
  register,
  setValue,
  totalAmount,
}) {
  const formatCurrencyInput = (value) => {
    const sanitizedValue = value.replace(/,/g, "").replace(/[^0-9.]/g, "");
    if (!sanitizedValue) return "";

    const [integerPart = "", ...decimalParts] = sanitizedValue.split(".");
    const normalizedInteger = integerPart.replace(/^0+(?=\d)/, "") || "0";
    const groupedInteger = normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (!sanitizedValue.includes(".")) return groupedInteger;

    return `${groupedInteger}.${decimalParts.join("").slice(0, 2)}`;
  };

  const formatAmount = (event, index) => {
    const numericValue = event.target.value.replace(/,/g, "");
    if (numericValue === "" || Number.isNaN(Number(numericValue))) return;

    const formattedValue = Number(numericValue).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    event.target.value = formattedValue;
    setValue(`breakdown.${index}.amount`, formattedValue);
  };

  return (
    <div className="budget-breakdown">
      <div className="budget-breakdown__header">
        <span>Maintenance / operational fund</span>
        <span>Amount (PHP)</span>
      </div>

      {items.map((item, index) => (
        <div className="budget-breakdown__row" key={item.id}>
          <Form.Check
            type="checkbox"
            label={item.fund_name}
            {...register(`breakdown.${index}.checked`)}
          />
          <input
            type="hidden"
            defaultValue={item.id}
            {...register(`breakdown.${index}.fund_id`)}
          />
          <Form.Control
            type="text"
            inputMode="decimal"
            aria-label={`${item.fund_name} amount`}
            className="text-end"
            placeholder="0.00"
            disabled={!checkedValues?.[index]?.checked}
            {...register(`breakdown.${index}.amount`)}
            onInput={(event) => {
              const formattedValue = formatCurrencyInput(event.target.value);
              event.target.value = formattedValue;
              setValue(`breakdown.${index}.amount`, formattedValue, {
                shouldDirty: true,
              });
            }}
            onBlur={(event) => formatAmount(event, index)}
          />
        </div>
      ))}

      <div className="budget-breakdown__total">
        <strong>Overall total</strong>
        <Form.Control
          readOnly
          value={(totalAmount || 0).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
          })}
          aria-label="Overall total amount"
          className="text-end"
        />
      </div>
    </div>
  );
}

function FormActions({ step, onBack, onNext }) {
  return (
    <div className="research-application__actions">
      <div>
        {step === 1 ? (
          <Button type="button" className="btn-outline-custom">
            <FiX />
            Cancel
          </Button>
        ) : (
          <Button type="button" className="btn-outline-custom" onClick={onBack}>
            <FiArrowLeft />
            Back
          </Button>
        )}
      </div>

      <div className="research-application__actions-primary">
        <Button type="button" className="btn-outline-custom">
          <FiSave />
          Save as Draft
        </Button>
        {step === 1 ? (
          <Button
            type="button"
            className="btn-confirmation-custom"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onNext();
            }}
          >
            Next
            <FiArrowRight />
          </Button>
        ) : (
          <Button className="btn-confirmation-custom" type="submit">
            <FiSend />
            Submit Application
          </Button>
        )}
      </div>
    </div>
  );
}

function ApplicationForm() {
  const history = useHistory();
  const userContext = useContext(UserContext);
  const { user: contextUser } = userContext?.data || {};
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [representative, setRepresentative] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [budgetBreakdown, setBudgetBreakdown] = useState();
  const [loggedInUser, setLoggedInUser] = useState(null);
  const name = formatDisplayName(localStorage.getItem("name"));
  const {
    control,
    handleSubmit,
    register,
    setValue,
    getValues,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: createDefaultValues(),
  });

  const breakdownValues =
    useWatch({
      control,
      name: "breakdown",
    }) || [];
  const documentValues =
    useWatch({
      control,
      name: "documents",
    }) || [];
  const checkedValues = watch("breakdown");
  const purposeId = useWatch({ control, name: "purpose_id" });

  const totalAmount = breakdownValues.reduce((acc, curr) => {
    const isChecked = curr?.checked;
    const amount = parseFloat(String(curr?.amount || "").replace(/,/g, "")) || 0;
    return isChecked ? acc + amount : acc;
  }, 0);

  useEffect(() => {
    const loadLoggedInUser = async () => {
      const contextAccount = getUserAccount(contextUser);
      if (contextAccount) {
        setLoggedInUser(contextAccount);
        return;
      }

      const userId = localStorage.getItem("id");
      if (!userId) return;

      const response = await new Auth().profile(userId);
      if (response.ok) {
        setLoggedInUser(getUserAccount(response.data));
      }
    };

    loadLoggedInUser();
  }, [contextUser]);

  useEffect(() => {
    if (!loggedInUser) return;

    const fullNameParts = (name || "").split(" ").filter(Boolean);
    const setResearcherValueIfEmpty = (field, value) => {
      const fieldName = `researchers.0.${field}`;
      if (value && !getValues(fieldName)) {
        setValue(fieldName, value);
      }
    };

    setResearcherValueIfEmpty(
      "id_number",
      getFirstAvailableValue(loggedInUser, [
        "school_id",
        "employee_id",
        "student_id",
      ])
    );
    setResearcherValueIfEmpty(
      "first_name",
      getFirstAvailableValue(loggedInUser, ["first_name", "firstName"]) ||
      fullNameParts[0]
    );
    setResearcherValueIfEmpty(
      "last_name",
      getFirstAvailableValue(loggedInUser, ["last_name", "lastName"]) ||
      fullNameParts.slice(1).join(" ")
    );
    setResearcherValueIfEmpty(
      "mobile_number",
      getFirstAvailableValue(loggedInUser, [
        "mobile_number",
        "mobile_no",
        "mobile",
        "contact_number",
        "phone_number",
      ])
    );
    setResearcherValueIfEmpty(
      "email",
      getFirstAvailableValue(loggedInUser, ["email", "email_address"])
    );
    setResearcherValueIfEmpty(
      "college",
      getFirstAvailableValue(loggedInUser, [
        "college",
        "college_id",
        "college_name",
      ])
    );
    setResearcherValueIfEmpty(
      "dept",
      getFirstAvailableValue(loggedInUser, [
        "dept",
        "department",
        "department_id",
        "department_name",
      ])
    );
  }, [loggedInUser, name, getValues, setValue]);

  useEffect(() => {
    const fetchData = async () => {
      const categoryRes = await new ResearchApplicationAPI().fetchCategories();
      if (categoryRes.ok) {
        setCategories(categoryRes.data.ResearchCategory);
      }

      const docTypesRes =
        await new ResearchApplicationAPI().fetchDocumentTypes();
      if (docTypesRes.ok) {
        const dox = docTypesRes.data.DocumentTypes;
        setDocumentTypes(dox);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchResearchDetails = async () => {
      const res = await new ResearchApplicationAPI().fetchResearchDetails();
      if (res.ok) {
        setBudgetBreakdown(res.data?.Details?.BudgetBreakdownDetails);
        setRepresentative(res?.data?.Details?.EndorsementRepresentative);
      } else {
        console.log("error fetching research details");
      }
    };

    fetchResearchDetails();
  }, []);

  useEffect(() => {
    if (budgetBreakdown?.length) {
      const breakdownDefaults = budgetBreakdown.map((item) => ({
        checked: false,
        fund_id: item.id,
        amount: "",
      }));

      reset((prev) => ({
        ...prev,
        breakdown: breakdownDefaults,
      }));
    }
  }, [budgetBreakdown, reset]);

  const onSubmit = async (data) => {
    setShowValidationSummary(false);
    setSubmissionError("");
    setLoading(true);

    try {
      const researchResponse =
        await new ResearchApplicationAPI().createFullResearch({
          title: data.title,
          category: data.category.filter(Boolean).join(","),
          purpose_id: data.purpose_id,
          version_number: data.version_number,
          research_duration: data.research_duration,
          ethical_considerations: data.ethical_considerations ? 1 : 0,
          submitted_by: data.submitted_by,
          submitted_date: data.submitted_date,
          status_id: 3,

          research_investigators: data.researchers
            .filter((r) => r.id_number)
            .map((r) => ({
              id_number: r.id_number,
              first_name: r.first_name,
              middle_name: r.middle_name,
              last_name: r.last_name,
              mobile_number: r.mobile_number,
              email: r.email,
              college: r.college,
              dept: r.dept,
            })),

          budget_breakdowns: data.breakdown
            .filter((b) => b.checked)
            .map((b) => ({
              fund_id: parseInt(b.fund_id),
              amount: parseFloat(String(b.amount).replace(/,/g, "")),
            })),
        });

      if (!researchResponse.ok) {
        setSubmissionError(getApiErrorMessage(researchResponse));
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const researchId = researchResponse.data.Research.id;
      let failedDocumentUploads = 0;

      for (const document of data.documents || []) {
        if (!document || !document.file || !document.document_title_id)
          continue;

        const file = document.file[0];
        if (!(file instanceof File)) continue;

        const response = await new ResearchApplicationAPI().createDocument({
          research_id: researchId,
          document_title_id: document.document_title_id,
          file,
        });

        if (!response.ok) {
          failedDocumentUploads += 1;
          console.warn(
            `Failed to upload document with title ID ${document.document_title_id}`
          );
        }
      }

      if (failedDocumentUploads > 0) {
        toast.error(
          `Research was created, but ${failedDocumentUploads} supporting ${
            failedDocumentUploads === 1 ? "document" : "documents"
          } failed to upload.`
        );
        history.push("/dashboard");
        return;
      }

      toast.success("Research application submitted successfully.");
      history.push("/dashboard");
    } catch (error) {
      console.error(error);
      setSubmissionError(
        "We couldn't reach the server. Check your connection and try submitting again."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setValue("submitted_by", name || "");
    setValue("submitted_date", new Date().toISOString().split("T")[0]);
  }, [name, setValue]);

  const focusFirstInvalidField = () => {
    window.setTimeout(() => {
      const firstInvalidField = document.querySelector(
        ".research-application .is-invalid, .research-application [aria-invalid='true']"
      );
      firstInvalidField?.focus();
      firstInvalidField?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  const handleInvalidSubmit = (validationErrors) => {
    const hasResearchDetailsErrors = Boolean(
      validationErrors.title ||
        validationErrors.category ||
        validationErrors.version_number ||
        validationErrors.researchers
    );

    setSubmissionError("");
    setShowValidationSummary(true);
    if (hasResearchDetailsErrors) setStep(1);
    focusFirstInvalidField();
  };

  const handleNext = async () => {
    const isResearchDetailsValid = await trigger([
      "title",
      "category",
      "version_number",
      "researchers",
    ]);

    if (!isResearchDetailsValid) {
      setShowValidationSummary(true);
      focusFirstInvalidField();
      return;
    }

    setShowValidationSummary(false);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (step === 1) {
      await handleNext();
      return;
    }

    handleSubmit(onSubmit, handleInvalidSubmit)(event);
  };

  return (
    <main className="application-form research-application">
      {loading && <TransparentLoader />}
      <div className="form-container">
        <header className="research-application__page-header">
          <div>
            <span className="research-application__eyebrow">
              Research proposal
            </span>
            <h1>New Research Application</h1>
            <p>
              Complete the research details and supporting requirements before
              submitting the application for review.
            </p>
          </div>
          <span className="research-application__step-count">Step {step} of 2</span>
        </header>

        <ApplicationProgress currentStep={step} />

        <Form className="form" noValidate onSubmit={handleFormSubmit}>
          {(showValidationSummary || submissionError) && (
            <div
              className="research-application__error-summary"
              role="alert"
              tabIndex="-1"
            >
              <FiAlertCircle aria-hidden="true" />
              <div>
                <strong>
                  {submissionError
                    ? "We couldn't submit your application"
                    : "Please complete the required fields"}
                </strong>
                <p>
                  {submissionError ||
                    "Check the fields highlighted below. Each one includes a message explaining what is needed."}
                </p>
              </div>
            </div>
          )}
          {step === 1 && (
            <>
              <FormCard className="research-application__card">
                <SectionHeader
                  number="I"
                  title="Research Overview"
                  description="Start with a clear working title for the proposed study."
                />
                <Form.Group className="research-application__title-field">
                  <Form.Label>
                    Research title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter the complete title of the research proposal"
                    isInvalid={Boolean(errors.title)}
                    aria-invalid={Boolean(errors.title)}
                    {...register("title", {
                      required: "Enter the research title.",
                    })}
                  />
                  {errors.title && (
                    <Form.Control.Feedback type="invalid">
                      {errors.title.message}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </FormCard>

              <FormCard className="research-application__card">
                <SectionHeader
                  number="II"
                  title="Research Agenda Category"
                  description="Select every category that applies to the proposed research."
                />
                <div
                  className={`research-application__category-grid ${
                    errors.category ? "is-invalid" : ""
                  }`}
                  aria-invalid={Boolean(errors.category)}
                >
                  {categories.map((item) => (
                    <label
                      className="research-application__category-option"
                      key={item.id}
                    >
                      <Form.Check.Input
                        type="checkbox"
                        {...register("category", {
                          validate: (value) =>
                            value?.length > 0 ||
                            "Select at least one research agenda category.",
                        })}
                        value={item.id}
                      />
                      <span>{item.research_name}</span>
                    </label>
                  ))}
                </div>
                {errors.category && (
                  <div className="invalid-feedback d-block">
                    {errors.category.message}
                  </div>
                )}
              </FormCard>

              <FormCard className="research-application__card">
                <SectionHeader
                  number="III"
                  title="Purpose of Submission"
                  description="Let the reviewers know whether this is a new or revised application."
                />
                <div className="research-application__purpose-grid">
                  <fieldset className="research-application__radio-group">
                    <legend>Submission type</legend>
                    <Form.Check
                      id="purpose-initial"
                      label="Initial submission"
                      type="radio"
                      value={1}
                      defaultChecked
                      {...register("purpose_id")}
                    />
                    <Form.Check
                      id="purpose-resubmission"
                      label="Resubmission"
                      type="radio"
                      value={2}
                      {...register("purpose_id")}
                    />
                  </fieldset>
                  <Form.Group>
                    <Form.Label>
                      {String(purposeId) === "2" && (
                        <span className="text-danger">*</span>
                      )}{" "}
                      Version number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. 2.0"
                      isInvalid={Boolean(errors.version_number)}
                      aria-invalid={Boolean(errors.version_number)}
                      {...register("version_number", {
                        validate: (value) =>
                          String(getValues("purpose_id")) !== "2" ||
                          Boolean(value?.trim()) ||
                          "Enter the version number for this resubmission.",
                      })}
                    />
                    {errors.version_number && (
                      <Form.Control.Feedback type="invalid">
                        {errors.version_number.message}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </div>
              </FormCard>

              <FormCard className="research-application__card research-application__card--investigators">
                <SectionHeader
                  number="IV"
                  title="Investigators"
                  description="The main author is required. Add co-authors only when they are part of the research team."
                />
                <div className="research-application__researchers">
                  {Array.from({ length: MAX_RESEARCHERS }, (_, index) => (
                    <ResearcherSection
                      key={index}
                      index={index}
                      isMain={index === 0}
                      control={control}
                      errors={errors.researchers}
                      register={register}
                      setValue={setValue}
                    />
                  ))}
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
                  description="Provide the expected duration and identify whether ethics clearance is required."
                />
                <div className="research-application__field-grid research-application__field-grid--compact">
                  <TextInputCustom
                    label="Duration (semesters)"
                    type="number"
                    min="1"
                    required
                    error={errors.research_duration?.message}
                    placeholder="e.g. 2"
                    {...register("research_duration", {
                      required: "Enter the expected research duration.",
                      min: {
                        value: 1,
                        message: "Duration must be at least one semester.",
                      },
                    })}
                  />
                  <div className="research-application__ethics-option">
                    <Form.Check
                      id="ethical-considerations"
                      label="This research involves human participants"
                      type="switch"
                      {...register("ethical_considerations")}
                    />
                    <small>Ethics review by the UERC will be required.</small>
                  </div>
                </div>
              </FormCard>

              <FormCard className="research-application__card">
                <SectionHeader
                  number="VI"
                  title="Submission Details"
                  description="These details are filled automatically from your account."
                />
                <div className="research-application__field-grid research-application__field-grid--two">
                  <TextInputCustom
                    label="Submitted by"
                    type="text"
                    readOnly
                    {...register("submitted_by")}
                  />
                  <TextInputCustom
                    label="Submission date"
                    type="date"
                    readOnly
                    {...register("submitted_date")}
                  />
                </div>
              </FormCard>

              <FormCard className="research-application__card">
                <SectionHeader
                  number="VII"
                  title="Endorsement"
                  description="Endorsers will review the application after it is submitted."
                />
                <div className="research-application__endorsements">
                  {representative.map((item, index) => (
                    <div
                      className="research-application__endorsement-row"
                      key={item.id}
                    >
                      <input
                        type="hidden"
                        defaultValue={item.id}
                        {...register(
                          `endorsements.${index}.endorsement_rep_id`
                        )}
                      />
                      <TextInputCustom
                        disabled
                        label={
                          item.UserAccount?.UserRole?.role_desc || "Endorser"
                        }
                        type="text"
                        placeholder={`${item.first_name} ${item.last_name}`}
                        {...register(
                          `endorsements.${index}.endorsement_rep_name`
                        )}
                      />
                      <TextInputCustom
                        label="Status"
                        type="text"
                        disabled
                        placeholder="Not yet endorsed"
                      />
                    </div>
                  ))}
                </div>
              </FormCard>

              <FormCard className="research-application__card">
                <SectionHeader
                  title="Supporting Requirements"
                  description="Upload the requested files in PDF, Word, or Excel format."
                  icon={<FiFileText />}
                />
                <div className="research-application__documents">
                  {documentTypes.map((doc, index) => {
                    const selectedFile = documentValues[index]?.file?.[0];
                    const documentError = errors.documents?.[index]?.file;
                    const isUploadable = UPLOADABLE_DOCUMENTS.has(
                      doc.document_name
                    );

                    return (
                      <section className="document-requirement" key={doc.id}>
                        <div className="document-requirement__content">
                          <h3>
                            {doc.document_name}{" "}
                            {isUploadable && (
                              <span className="text-danger">*</span>
                            )}
                          </h3>
                          <p>{DOCUMENT_DESCRIPTIONS[doc.document_name]}</p>
                        </div>

                        {isUploadable && (
                          <div
                            className={`document-requirement__upload ${
                              selectedFile
                                ? "document-requirement__upload--selected"
                                : ""
                            } ${documentError ? "document-requirement__upload--invalid" : ""}`}
                          >
                            <label htmlFor={`document-${doc.id}`}>
                              {selectedFile ? <FiCheck /> : <FiUploadCloud />}
                              <span>
                                {selectedFile ? "Replace file" : "Choose file"}
                              </span>
                            </label>
                            <Form.Control
                              id={`document-${doc.id}`}
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx"
                              isInvalid={Boolean(documentError)}
                              aria-invalid={Boolean(documentError)}
                              {...register(`documents.${index}.file`, {
                                validate: (files) =>
                                  files?.length > 0 ||
                                  `Upload the ${doc.document_name}.`,
                              })}
                            />
                            <input
                              type="hidden"
                              defaultValue={doc.id}
                              {...register(
                                `documents.${index}.document_title_id`
                              )}
                            />
                            {selectedFile && (
                              <div
                                className="document-requirement__file-status"
                                role="status"
                                title={selectedFile.name}
                              >
                                <FiCheck aria-hidden="true" />
                                <span>
                                  <strong>File selected</strong>
                                  <small>{selectedFile.name}</small>
                                </span>
                              </div>
                            )}
                            {documentError && (
                              <div className="document-requirement__file-error">
                                <FiAlertCircle aria-hidden="true" />
                                <span>{documentError.message}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {doc.id === 7 && (
                          <BudgetBreakdown
                            items={budgetBreakdown}
                            checkedValues={checkedValues}
                            register={register}
                            setValue={setValue}
                            totalAmount={totalAmount}
                          />
                        )}
                      </section>
                    );
                  })}
                </div>
              </FormCard>
            </>
          )}

          <FormActions
            step={step}
            onBack={() => setStep(1)}
            onNext={handleNext}
          />
        </Form>
      </div>
    </main>
  );
}

export default ApplicationForm;
