import React, { useContext, useEffect, useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { useForm, useWatch } from "react-hook-form";
import FormCard from "../../../components/Card/FormCard";
import TextInputCustom from "../../../components/Input/TextInputCustom";
import TransparentLoader from "../../../components/Loader/TransparentLoader";
import OutlineButton from "../../../components/Buttons/OutlineButton";
import ConfirmationButton from "../../../components/Buttons/ConfirmationButton";
import ResearchApplicationAPI from "../../../api/ResearchApplicationAPI"
import { useParams } from "react-router-dom";
import { toRoman } from '../../../components/Helper/Roman';
import { documentDescriptions } from '../../../components/Helper/DocumentDescription';
import { UserContext } from "../../../context/UserContext";
import { useHistory } from "react-router-dom";

export function ResearcherSection({
  index,
  isMain,
  control,
  register,
  watch,
  setValue,
}) {
  const numberLabel = isMain
    ? "Researcher 1 (Main Author)"
    : `Researcher ${index + 1} (Co-author)`;

  const enabled = isMain ? true : watch(`researchers.${index}.enabled`);
  const sameCollege = watch("sameCollege");
  const sameDept = watch("sameDept");
  const mainCollege = watch("researchers.0.college");
  const mainDept = watch("researchers.0.dept");

  useEffect(() => {
    if (!isMain && sameCollege && mainCollege) {
      setValue(`researchers.${index}.college`, mainCollege);
    }
  }, [index, isMain, sameCollege, mainCollege, setValue]);

  useEffect(() => {
    if (!isMain && sameDept && mainDept) {
      setValue(`researchers.${index}.dept`, mainDept);
    }
  }, [index, isMain, sameDept, mainDept, setValue]);

  return (
    <div className="mb-4 px-4">
      {!isMain && (
        <Form.Check
          type="checkbox"
          id={`researcher-enable-${index}`}
          label={numberLabel}
          className="mb-2 margin-left-29"
          {...register(`researchers.${index}.enabled`)}
        />
      )}

      {isMain && <p className="fw-bold mb-3">{numberLabel}</p>}

      <Row>
        <Col sm={12} md={12} lg={6} className="form-input-container">
          <TextInputCustom
            label="ID Number"
            type="text"
            isForm={true}
            disabled={true}
            {...register(`researchers.${index}.id_number`)}
          />
          <TextInputCustom
            label="First Name"
            type="text"
            isForm={true}
            disabled={true}
            {...register(`researchers.${index}.first_name`)}
          />
          <TextInputCustom
            label="Last Name"
            type="text"
            isForm={true}
            disabled={true}
            {...register(`researchers.${index}.last_name`)}
          />
          <TextInputCustom
            label="Mobile No."
            type="text"
            isForm={true}
            disabled={true}
            {...register(`researchers.${index}.mobile_number`)}
          />
          <TextInputCustom
            label="Email"
            type="email"
            isForm={true}
            disabled={true}
            {...register(`researchers.${index}.email`)}
          />
        </Col>

        <Col>
          <Form.Group className="flex-container custom-input">
            <Form.Label className="custom-label">College</Form.Label>
            <Form.Select
              className="custom-control"
              disabled={(sameCollege && !isMain) || (true)}
              {...register(`researchers.${index}.college`)}
            >
              <option value="">Select College</option>
              <option value="college-1">College 1</option>
              <option value="college-2">College 2</option>
            </Form.Select>
          </Form.Group>
          {isMain && (
            <Form.Check
              type="checkbox"
              label="Same College to all co-authors"
              {...register("sameCollege")}
              disabled
            />
          )}

          <Form.Group className="flex-container custom-input">
            <Form.Label className="custom-label">Department</Form.Label>
            <Form.Select
              className="custom-control"
              disabled={(sameDept && !isMain) || (true)}
              {...register(`researchers.${index}.dept`)}
            >
              <option value="">Select Department</option>
              <option value="dept-1">Department 1</option>
              <option value="dept-2">Department 2</option>
            </Form.Select>
          </Form.Group>
          {isMain && (
            <Form.Check
              type="checkbox"
              label="Same Department to all co-authors"
              disabled
              {...register("sameDept")}
            />
          )}
        </Col>
      </Row>
    </div>
  );
}

function ResearchApplicationReviewForm() {
  const BASE_URL = "https://adamsoncr.tekteachlms.com";
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { id } = useParams()
  const name = localStorage.getItem("name") || "John Doe";
  const [research, setResearch] = useState()
  const [remarks, setRemarks] = useState("");
  const [remarksHistory, setRemarksHistory] = useState([])
  const [checked, setChecked] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState(false)
  const userID = localStorage.getItem("id");
  const history = useHistory()

  const documentTypes = [
    { id: 1, document_name: "Letter of Intent" },
    { id: 2, document_name: "Research Proposal" },
    { id: 3, document_name: "Researcher/s Curriculum Vitae (CV)" },
    { id: 6, document_name: "Gantt Chart" },
    { id: 7, document_name: "Detailed Budget Breakdown" },
  ];

  const budgetBreakdown = [
    { id: 1, fund_name: "Equipment" },
    { id: 2, fund_name: "Transportation" },
    { id: 3, fund_name: "Supplies" },
    { id: 4, fund_name: "Analysis and Laboratory Test" },
  ];

  const {
    control,
    handleSubmit,
    register,
    setValue,
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
      researchers: Array(5).fill({}),
      breakdown: budgetBreakdown.map((item) => ({
        checked: false,
        fund_id: item.id,
        amount: "",
      })),
      documents: [],
    },
  });

  const getResearchById = async () => {
    setLoading(true);
    const response = await new ResearchApplicationAPI().getResearchById(id)
    setLoading(false);
    if (response.ok) {
      setResearch(response?.data?.Research)
    } else {
      console.error(response.data)
    }
  }

  const getAllEndorsementComments = async () => {
    const response = await new ResearchApplicationAPI().getAllEndorsementComments(id)
    if (response.ok) {
      setRemarksHistory(response?.data?.Endorsements)
    } else {
      console.error("Failed to fetch endorsement comments:", response.data);
    }
  }

  useEffect(() => {
    getResearchById()
    getAllEndorsementComments()
  }, [id])

  // Map research data to form
  useEffect(() => {
    if (research) {
      const researchers = Array(5).fill({});
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

      const breakdown = budgetBreakdown.map((item) => {
        const existing = research.budget_breakdowns.find((b) => b.fund_id === item.id);
        return {
          fund_id: item.id,
          checked: !!existing,
          amount: existing ? existing.amount : "",
        };
      });

      const documents = documentTypes.map((doc) => {
        const existing = research.research_documents.find((d) => d.document_title_id === doc.id);
        return {
          document_title_id: doc.id,
          document_name: doc.document_name,
          file: existing ? existing.document_filepath : null,
        };
      });

      const endorsements = research.endorsements.map((e) => ({
        endorsement_rep_name: e.endorsement_rep_name,
        status: e.status,
        endorsement_rep_id: e.user_account_id
      }));

      reset({
        title: research.title,
        version_number: research.version_number,
        category: research.category.map((c) => c.id),
        research_duration: research.research_duration,
        ethical_considerations: research.ethical_considerations === 1,
        submitted_by: research.submitted_by,
        submitted_date: research.submitted_date.split("T")[0],
        researchers,
        breakdown,
        documents,
        endorsements,
        purpose_id: research.purpose_id
      });
    }
  }, [research, reset]);

  const breakdownValues = useWatch({ control, name: "breakdown" }) || [];
  const checkedValues = watch("breakdown");
  const totalAmount = breakdownValues.reduce((acc, curr) => {
    const isChecked = curr?.checked;
    const amount = parseFloat(curr?.amount) || 0;
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
    const hasUserRemarks = remarksHistory?.some(
      (endorsement) =>
        Number(endorsement.endorsement_rep_id) === Number(userID) &&
        endorsement.remarks &&
        endorsement.remarks.trim() !== ""
    );

    if (hasUserRemarks) {
      alert("You already left a remark.");
      return;
    }

    let payload = {
      status_id: 6,
      remarks: remarks
    };

    const response = await new ResearchApplicationAPI().updateEndorsementStatus(
      id,
      userID,
      payload
    );

    if (response.ok) {
      alert("Successfully endorsed research");
      setConfirmationModal(false);
      history.push("/research-application-review");
    } else {
      console.log(response.data);
    }
  };

  const onSubmit = () => {
    updateEndorsementStatus()
  };

  return (
    <div className="application-form">
      {loading && <TransparentLoader />}
      <div className="form-container">
        <h1 className="mt-5 mb-5 fw-bold text-white">
          Review Research Application
        </h1>
        <Form className="form" onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <>
              <FormCard className="flex-container">
                <Form.Label className="title me-3">Title</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={research?.title || ""}
                  disabled={true}
                />
              </FormCard>

              <FormCard>
                <h5 className="title">
                  I. Protocol’s 5-point Research Agenda Category
                </h5>
                <div className="content-checkbox">
                  {research?.category?.map((item) => (
                    <Form.Check
                      key={item.id}
                      label={item.research_name}
                      type="checkbox"
                      value={item.id}
                      checked
                      disabled
                    />
                  ))}
                </div>
              </FormCard>

              <FormCard>
                <h5 className="title">II. Purpose of Submission</h5>
                <Row className="px-4">
                  <Col>
                    <Row>
                      <Col>
                        <Form.Check
                          label="Initial"
                          type="radio"
                          value={1}
                          {...register("purpose_id")}
                          checked={research?.purpose_id === 1}
                          disabled
                        />
                      </Col>
                      <Col>
                        <Form.Check
                          label="Resubmission"
                          type="radio"
                          value={2}
                          {...register("purpose_id")}
                          checked={research?.purpose_id === 2}
                          disabled
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col className="flex-container mt--6">
                    <Form.Label className="mb-0 form-labels">
                      Version Number
                    </Form.Label>
                    <Form.Control type="text" value={research?.version_number} disabled />
                  </Col>
                </Row>
              </FormCard>

              <FormCard>
                <div className="title flex flex-row">
                  <span className="me-4">III. Investigators</span>
                  <span className="text-danger">*</span> Required Fields
                </div>
                {[...Array(5)].map((_, i) => (
                  <ResearcherSection
                    key={i}
                    index={i}
                    isMain={i === 0}
                    control={control}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                  />
                ))}
              </FormCard>
            </>
          )}

          {step === 2 && (
            <>
              <FormCard>
                <h5 className="fw-bold mb-3">IV. Research Duration</h5>
                <TextInputCustom
                  label="Duration (semesters)"
                  isForm={true}
                  type="text"
                  {...register("research_duration")}
                  disabled
                />
              </FormCard>

              <FormCard>
                <h5 className="fw-bold mb-3">V. Ethical Considerations</h5>
                <Form.Check
                  label="With Human Participants"
                  isForm={true}
                  type="checkbox"
                  {...register("ethical_considerations")}
                  checked={research?.ethical_considerations === 1}
                  disabled
                />
              </FormCard>

              <FormCard>
                <h5 className="fw-bold mb-3">VI. Submission</h5>
                <Row>
                  <Col>
                    <TextInputCustom
                      label="Submitted by"
                      isForm={true}
                      type="text"
                      disabled={true}
                      {...register("submitted_by")}
                    />
                  </Col>
                  <Col>
                    <TextInputCustom
                      isForm={true}
                      type="date"
                      disabled={true}
                      {...register("submitted_date")}
                    />
                  </Col>
                </Row>
              </FormCard>

              <FormCard>
                <h5 className="fw-bold mb-3">VII. Endorsement</h5>
                {research?.endorsements?.map((item, index) => (
                  <Row key={item.endorsement_rep_id}>
                    <Col>
                      <TextInputCustom
                        isForm={true}
                        disabled={true}
                        label={`Representative${""}${index + 1}`}
                        type="text"
                        value={item.endorsement_rep_name}
                      />
                    </Col>
                    <Col>
                      <TextInputCustom
                        isForm={true}
                        label="Status"
                        type="text"
                        disabled={true}
                        value={item.status}
                      />
                    </Col>
                  </Row>
                ))}
              </FormCard>

              <h4 className="text-white">Notes:</h4>

              {documentTypes.map((doc, index) => (
                <FormCard key={doc.id}>
                  <div className="mb-4">
                    <p className="fw-bold mb-1">{`${toRoman(index + 1)}. ${doc.document_name}`}</p>
                    <p className="mb-2">{documentDescriptions[doc.document_name]}</p>

                    {/* Show uploaded file link if exists */}
                    {research?.research_documents?.find(d => d.document_title_id === doc.id)?.document_filepath ? (
                      <div className="d-flex align-items-center gap-3">
                        <span className="text-success">
                          ✓ Document Submitted
                        </span>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() =>
                            handleViewDocument(
                              research?.research_documents?.find(d => d.document_title_id === doc.id)
                            )
                          }
                        >
                          View Document
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted">No file uploaded</span>
                    )}

                    {/* Only show budget breakdown if Detailed Budget Breakdown */}
                    {doc.id === 7 && (
                      <div className="breakdown mt-4">
                        <Row className="breakdown-column px-5">
                          <Col className="text-center mb-3">Maintenance/Operational Fund</Col>
                          <Col className="text-center mb-3">Total (in Php)</Col>

                          {budgetBreakdown.map((item, i) => (
                            <Row key={i} className="py-3">
                              <Col>
                                <Form.Check
                                  type="checkbox"
                                  label={item.fund_name}
                                  checked={checkedValues?.[i]?.checked || false}
                                  disabled
                                />
                              </Col>
                              <Col>
                                <Form.Control
                                  type="text"
                                  className="text-end"
                                  value={checkedValues?.[i]?.amount || ""}
                                  disabled
                                />
                              </Col>
                            </Row>
                          ))}

                          <Row className="my-3">
                            <Col className="ms-4"><b>Overall Total Amount</b></Col>
                            <Col>
                              <Form.Control
                                readOnly
                                value={(totalAmount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                                className="text-end"
                              />
                            </Col>
                          </Row>
                        </Row>
                      </div>
                    )}
                  </div>
                </FormCard>
              ))}

              <div>
                <Form.Check
                  type="checkbox"
                  label="Remarks"
                  className="mb-3 mt-5 text-white"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                />

                {/* Show existing remarks */}
                {remarksHistory
                  ?.filter(
                    (endorsement) =>
                      endorsement.remarks && endorsement.remarks.trim() !== ""
                  )
                  .map((endorsement) => (
                    <FormCard
                      key={endorsement.endorsement_rep_id}
                      className="bg-ccit mb-3"
                    >
                      <Form.Label className="text-white">
                        {endorsement.User.first_name}{" "}
                        {endorsement.User.middle_name}{" "}
                        {endorsement.User.last_name} -{" "}
                        {endorsement.User.UserAccount.UserRole.role_desc}{" "}
                        ({endorsement.StatusTable.status})
                      </Form.Label>

                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={endorsement.remarks}
                        disabled
                      />
                    </FormCard>
                  ))}

                {!remarksHistory?.some(
                  (endorsement) =>
                    Number(endorsement.endorsement_rep_id) === Number(userID) &&
                    endorsement.remarks &&
                    endorsement.remarks.trim() !== ""
                ) && (
                    <FormCard className="bg-ccit">
                      <Form.Control
                        as="textarea"
                        placeholder="Type in your comments/suggestions."
                        rows={8}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        disabled={!checked}
                      />
                    </FormCard>
                  )}
              </div>
            </>
          )}

          <div className="btn-groups">
            {step === 1 ? (
              <>
                <OutlineButton label="Close" onCancel={() => history.push('/research-application-review')} />
                {/* <OutlineButton label="Save as Draft" /> */}
                <ConfirmationButton label="Next" onProceed={() => setStep(2)} />
              </>
            ) : (
              <>
                <OutlineButton label="Close" onCancel={() => history.push('/research-application-review')} />
                <OutlineButton label="Back" onCancel={() => setStep(1)} />
                <Button
                  className="btn-confirmation-custom"
                  variant="primary"
                >
                  Save
                </Button>
                <OutlineButton label="Endorse" 
                  type="submit" />
              </>
            )}
          </div>
        </Form>
      </div>
      {confirmationModal && <confirmationModal />}
    </div>
  );
}

export default ResearchApplicationReviewForm;