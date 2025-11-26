import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import FormCard from "../../../components/Card/FormCard";
import TextInputCustom from "../../../components/Input/TextInputCustom";
import OutlineButton from "../../../components/Buttons/OutlineButton";
import ConfirmationButton from "../../../components/Buttons/ConfirmationButton";
import MainContainer from "../../../components/Layout/MainContainer";
import CustomModal from "../../../components/Modal/CustomModal";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { useParams } from "react-router-dom";
import ResearchApplicationAPI from "../../../api/ResearchApplicationAPI";
import TransparentLoader from "../../../components/Loader/TransparentLoader";

export function ResearcherSection({
  index,
  isMain,
  control,
  register,
  watch,
  setValue,
  isDisabled = false,
}) {
  const numberLabel = isMain
    ? "Researcher 1 (Main Author)"
    : `Researcher ${index + 1} (Co-author)`;

  const enabled = isMain ? true : watch(`researchers.${index}.enabled`);
  const sameCollege = watch("sameCollege");
  const sameDept = watch("sameDept");
  const mainCollege = watch("researchers.0.college");
  const mainDept = watch("researchers.0.dept");

  return (
    <div className="mb-4 px-4">
      {!isMain && (
        <Form.Check
          type="checkbox"
          id={`researcher-enable-${index}`}
          label={numberLabel}
          className="mb-2 margin-left-29"
          {...register(`researchers.${index}.enabled`)}
          disabled={isDisabled}
        />
      )}

      {isMain && <p className="fw-bold mb-3">{numberLabel}</p>}

      <Row>
        <Col sm={12} md={12} lg={6} className="form-input-container">
          <TextInputCustom
            label="ID Number"
            type="text"
            required={isMain}
            isForm={true}
            disabled={isDisabled || (!enabled && !isMain)}
            {...register(`researchers.${index}.id_number`, {
              required: isMain,
            })}
          />
          <TextInputCustom
            label="First Name"
            type="text"
            required={isMain}
            isForm={true}
            disabled={isDisabled || (!enabled && !isMain)}
            {...register(`researchers.${index}.first_name`, {
              required: isMain,
            })}
          />
          <TextInputCustom
            label="Last Name"
            type="text"
            required={isMain}
            isForm={true}
            disabled={isDisabled || (!enabled && !isMain)}
            {...register(`researchers.${index}.last_name`, {
              required: isMain,
            })}
          />
          <TextInputCustom
            label="Mobile No."
            type="text"
            required={isMain}
            isForm={true}
            disabled={isDisabled || (!enabled && !isMain)}
            {...register(`researchers.${index}.mobile_number`, {
              required: isMain,
            })}
          />
          <TextInputCustom
            label="Email"
            type="email"
            required={isMain}
            isForm={true}
            disabled={isDisabled || (!enabled && !isMain)}
            {...register(`researchers.${index}.email`, { required: isMain })}
          />
        </Col>

        <Col>
          <Form.Group className="flex-container custom-input">
            <Form.Label className="custom-label">College</Form.Label>
            <Form.Select
              className="custom-control"
              disabled={
                isDisabled || (sameCollege && !isMain) || (!enabled && !isMain)
              }
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
              disabled={isDisabled}
            />
          )}

          <Form.Group className="flex-container custom-input">
            <Form.Label className="custom-label">Department</Form.Label>
            <Form.Select
              className="custom-control"
              disabled={
                isDisabled || (sameDept && !isMain) || (!enabled && !isMain)
              }
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
              {...register("sameDept")}
              disabled={isDisabled}
            />
          )}
        </Col>
      </Row>
    </div>
  );
}

function ResearchApplicationReviewForm() {
  const [step, setStep] = useState(1);
  const [proceedStep, setProceedStep] = useState(1);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [representative, setRepresentative] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [researchData, setResearchData] = useState(null);
  const { id } = useParams();

  const { control, handleSubmit, register, setValue, watch, reset } = useForm({
    defaultValues: {
      title: "",
      category: [],
      purpose_id: 1,
      version_number: "",
      research_duration: "",
      ethical_considerations: false,
      submitted_by: "",
      submitted_date: "",
      researchers: Array(5).fill({ enabled: false }),
      endorsements: [],
      remarks: "",
    },
  });

  const documentDescriptions = {
    "Letter of Intent":
      "This application must be submitted together with the letter of intent...",
    "Research Proposal":
      "Full proposal should be submitted together with this form...",
    "Researcher/s Curriculum Vitae (CV)":
      "A copy of the Researcher/s Curriculum Vitae (CV)...",
    "Initial Review and Screening":
      "All researches will undergo initial review...",
    "Ethics Review":
      "Proposals with human participants must undergo Ethics Review...",
    "Gantt Chart": "Activities related to project implementation...",
    "Detailed Budget Breakdown":
      "Must have high-probability of estimation accuracy...",
  };

  const toRoman = (num) => {
    const romans = [
      "i",
      "ii",
      "iii",
      "iv",
      "v",
      "vi",
      "vii",
      "viii",
      "ix",
      "x",
    ];
    return romans[num - 1] || num;
  };

  // Fetch research data by ID and pre-populate form
  useEffect(() => {
    const fetchResearchByID = async () => {
      setLoading(true);
      try {
        const response = await new ResearchApplicationAPI().fetchResearchByID(
          id
        );
        if (response.ok) {
          const research = response.data.Research;
          setResearchData(research);

          // Pre-populate form data
          setValue("title", research.title || "");

          // Pre-populate protocol categories - check boxes based on IDs from backend
          if (research.category && Array.isArray(research.category)) {
            const categoryIds = research.category.map((cat) =>
              cat.id.toString()
            );
            setValue("category", categoryIds);
          }

          // Pre-populate purpose - check the correct radio based on purpose_id
          setValue("purpose_id", research.purpose_id?.toString() || "1");
          setValue("version_number", research.version_number || "");
          setValue("research_duration", research.research_duration || "");

          // Pre-populate ethical considerations - check if ethical_considerations is 1
          setValue(
            "ethical_considerations",
            research.ethical_considerations === 1
          );

          setValue("submitted_by", research.submitted_by || "");
          setValue(
            "submitted_date",
            research.submitted_date ? research.submitted_date.split("T")[0] : ""
          );

          // Pre-populate researchers
          const researchersData = Array(5).fill({ enabled: false });
          if (research.research_investigators) {
            research.research_investigators.forEach((investigator, index) => {
              if (index < 5) {
                const nameParts = investigator.name?.split(" ") || [];
                const firstName = nameParts[0] || "";
                const lastName = nameParts.slice(1).join(" ") || "";

                researchersData[index] = {
                  enabled: true,
                  id_number: investigator.id_number || "",
                  first_name: firstName,
                  last_name: lastName,
                  mobile_number: investigator.mobile_number || "",
                  email: investigator.email || "",
                  college: investigator.college || "",
                  dept: investigator.dept || "",
                };
              }
            });
          }
          setValue("researchers", researchersData);

          // Pre-populate endorsements
          if (research.endorsements && representative.length > 0) {
            const endorsementsData = representative.map((rep, index) => {
              const researchEndorsement = research.endorsements?.find(
                (e) => e.rep_name === rep.rep_name
              );
              return {
                endorsement_rep_id: rep.id,
                endorsement_rep_name:
                  researchEndorsement?.rep_name || rep.rep_name,
                status: researchEndorsement?.status || "Not yet endorsed",
              };
            });
            setValue("endorsements", endorsementsData);
          }
        } else {
          console.error("Failed to fetch research data:", response.data);
        }
      } catch (error) {
        console.error("Error fetching research data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResearchByID();
    }
  }, [id, setValue, representative]);

  // Fetch categories, representatives, and document types
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoryRes, repRes, docTypesRes] = await Promise.all([
          new ResearchApplicationAPI().fetchCategories(),
          new ResearchApplicationAPI().fetchEndorsementRepresentative(),
          new ResearchApplicationAPI().fetchDocumentTypes(),
        ]);

        if (categoryRes.ok) {
          setCategories(categoryRes.data.ResearchCategory);
        }

        if (repRes.ok) {
          const reps = repRes.data.EndorsementRepresentative;
          setRepresentative(reps);
        }

        if (docTypesRes.ok) {
          setDocumentTypes(docTypesRes.data.DocumentTypes);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  const updateResearchStatus = async (status_id) => {
    const response = await new ResearchApplicationAPI().updateResearchStatus(id, status_id);
    if (response.ok) {
      alert("Successfully endorsed research");
      setConfirmationModal(!confirmationModal);
    } else {
      console.log(response.data);
    }
  };

  const handleViewDocument = (document) => {
    // Open document in new tab or modal for viewing
    if (document.document_filepath) {
      const fullUrl = `https://adamsoncr.tekteachlms.com${document.document_filepath}`;
      window.open(fullUrl, "_blank");
    }
  };

  const endorsementConfirmation = () => (
    <CustomModal
      title="College Coordinator Endorsement Confirmation"
      size="xl"
      onClose={() => setConfirmationModal(false)}
    >
      <div className="account_reset">
        <div className="info_icon">
          <RxQuestionMarkCircled />
        </div>
        <div>
          {proceedStep === 1
            ? `Are you sure you want to endorse this research "${researchData?.title}" to the department's chairperson?`
            : `The research "${researchData?.title}" is endorsed to the department's chairperson `}
        </div>
      </div>
      <div className="center gap-5 mt-2">
        <ConfirmationButton
          label={proceedStep === 1 ? "Cancel" : "Ok"}
          onProceed={() => {
            setConfirmationModal(false);
            setProceedStep(1);
          }}
        />
        {proceedStep === 1 && (
          <OutlineButton label="Yes" onCancel={() => updateResearchStatus(1)} />
        )}
      </div>
    </CustomModal>
  );

  const isFormDisabled = true;

  let breakdownDummyData = [
    {
      title: "Transportation",
      amount: "10,000.00",
    },
    {
      title: "Meal (Consultants and Respondents)",
      amount: "18,500.00",
    },
    {
      title: "Supplies and Materials needed",
      amount: "3,500.00",
    },
    {
      title: "Analysis and Laboratory test",
      amount: "60,000.00",
    },
    {
      title: "Others",
      amount: "123,750.00",
    },
  ];

  console.log({ breakdownDummyData });
  return (
    <MainContainer>
      {loading && <TransparentLoader />}
      <div className="application-form">
        <div className="form-container">
          <h1 className="mt-5 mb-5 fw-bold text-white">
            Research Application Review
          </h1>
          <Form className="form" onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <>
                <FormCard className="flex-container">
                  <Form.Label className="title me-3">Title</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    {...register("title", { required: true })}
                    disabled={isFormDisabled}
                  />
                </FormCard>

                <FormCard>
                  <h5 className="title">
                    I. Protocol's 5-point Research Agenda Category
                  </h5>
                  <div className="content-checkbox">
                    {categories.map((item) => (
                      <Form.Check
                        key={item.id}
                        label={item.research_name}
                        type="checkbox"
                        {...register("category")}
                        value={item.id.toString()}
                        disabled={isFormDisabled}
                        defaultChecked={researchData?.category?.some(
                          (cat) => cat.id === item.id
                        )}
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
                            value="1"
                            {...register("purpose_id")}
                            disabled={isFormDisabled}
                            defaultChecked={researchData?.purpose_id === 1}
                          />
                        </Col>
                        <Col>
                          <Form.Check
                            label="Resubmission"
                            type="radio"
                            value="2"
                            {...register("purpose_id")}
                            disabled={isFormDisabled}
                            defaultChecked={researchData?.purpose_id === 2}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col className="flex-container mt--6">
                      <Form.Label className="mb-0 form-labels">
                        Version Number
                      </Form.Label>
                      <Form.Control
                        type="text"
                        {...register("version_number")}
                        disabled={isFormDisabled}
                      />
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
                      isDisabled={isFormDisabled}
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
                    disabled={isFormDisabled}
                  />
                </FormCard>

                <FormCard>
                  <h5 className="fw-bold mb-3">V. Ethical Considerations</h5>
                  <Form.Check
                    label="With Human Participants"
                    isForm={true}
                    type="checkbox"
                    {...register("ethical_considerations")}
                    disabled={isFormDisabled}
                    defaultChecked={researchData?.ethical_considerations === 1}
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
                        {...register("submitted_by")}
                        disabled={isFormDisabled}
                      />
                    </Col>
                    <Col>
                      <TextInputCustom
                        isForm={true}
                        type="date"
                        {...register("submitted_date")}
                        disabled={isFormDisabled}
                      />
                    </Col>
                  </Row>
                </FormCard>

                <FormCard>
                  <h5 className="fw-bold mb-3">VII. Endorsement</h5>
                  {representative.map((item, index) => (
                    <Row key={item.id}>
                      <input
                        type="hidden"
                        {...register(
                          `endorsements.${index}.endorsement_rep_id`
                        )}
                        value={item.id}
                      />

                      <Col>
                        <TextInputCustom
                          isForm={true}
                          label={item.rep_name}
                          type="text"
                          {...register(
                            `endorsements.${index}.endorsement_rep_name`
                          )}
                          disabled={isFormDisabled}
                        />
                      </Col>

                      <Col>
                        <TextInputCustom
                          isForm={true}
                          label="Status"
                          type="text"
                          placeholder="Not yet endorsed"
                          {...register(`endorsements.${index}.status`)}
                          disabled={isFormDisabled}
                        />
                      </Col>
                    </Row>
                  ))}
                </FormCard>

                <h4 className="text-white">Notes:</h4>
                {documentTypes.map((doc, index) => {
                  const researchDocument =
                    researchData?.research_documents?.find(
                      (d) => d.document_title_id === doc.id
                    );

                  return (
                    <FormCard key={doc.id}>
                      <div className="mb-4">
                        <p className="fw-bold mb-1">{`${toRoman(index + 1)}. ${
                          doc.document_name
                        }`}</p>
                        <p className="mb-2">
                          {documentDescriptions[doc.document_name]}
                        </p>

                        {researchDocument ? (
                          <div className="d-flex align-items-center gap-3">
                            <span className="text-success">
                              ✓ Document Submitted
                            </span>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() =>
                                handleViewDocument(researchDocument)
                              }
                            >
                              View Document
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted">
                            No document submitted
                          </span>
                        )}
                      </div>
                      {doc.id == 7 && (
                        <div className="breakdown">
                          <Row className="breakdown-column px-5">
                            <Col className="text-center mb-3">
                              Maintenance/Operational Fund
                            </Col>
                            <Col className="text-center mb-3">
                              Total (in Php)
                            </Col>

                            {breakdownDummyData.map((item, i) => {
                              return (
                                <Row key={i} className="py-3">
                                  <Col>
                                    <Form.Check
                                      type="checkbox"
                                      label={item.title}
                                    />
                                  </Col>
                                  <Col>
                                    <Form.Control
                                      placeholder={item.amount}
                                      className="text-end"
                                    />
                                  </Col>
                                </Row>
                              );
                            })}
                            <Row className="my-3">
                              <Col className="ms-4">
                                <b>Overall Total Amount</b>
                              </Col>
                              <Col>
                                <Form.Control
                                  placeholder="215,750.00"
                                  className="text-end"
                                />
                              </Col>
                            </Row>
                          </Row>
                        </div>
                      )}
                    </FormCard>
                  );
                })}

                <div>
                  <Form.Check
                    type="checkbox"
                    label="Remarks"
                    className="mb-3 mt-5 text-white"
                  />
                  <FormCard className="bg-ccit">
                    <Form.Control
                      as="textarea"
                      placeholder="Type in your comments/suggestions."
                      rows={8}
                      {...register("remarks")}
                    />
                  </FormCard>
                </div>
              </>
            )}
          </Form>

          <div className="btn-groups">
            {step === 1 ? (
              <>
                <OutlineButton label="Cancel" />
                <ConfirmationButton label="Next" onProceed={() => setStep(2)} />
              </>
            ) : (
              <>
                <OutlineButton label="Back" onCancel={() => setStep(1)} />
                <Button
                  className="btn-confirmation-custom"
                  variant="primary"
                  type="submit"
                >
                  Submit Review
                </Button>
                <OutlineButton
                  label="Endorse"
                  onCancel={() => setConfirmationModal(true)}
                />
              </>
            )}
          </div>
        </div>
      </div>
      {confirmationModal && endorsementConfirmation()}
    </MainContainer>
  );
}

export default ResearchApplicationReviewForm;
