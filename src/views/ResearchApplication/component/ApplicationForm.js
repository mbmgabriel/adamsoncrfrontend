import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { useForm, useWatch } from "react-hook-form";
import FormCard from "../../../components/Card/FormCard";
import TextInputCustom from "../../../components/Input/TextInputCustom";
import ResearchApplicationAPI from "../../../api/ResearchApplicationAPI";
import TransparentLoader from "../../../components/Loader/TransparentLoader";
import OutlineButton from "../../../components/Buttons/OutlineButton";
import ConfirmationButton from "../../../components/Buttons/ConfirmationButton";
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
            required={isMain}
            isForm={true}
            disabled={!enabled && !isMain}
            {...register(`researchers.${index}.id_number`, {
              required: isMain,
            })}
          />
          <TextInputCustom
            label="First Name"
            type="text"
            required={isMain}
            isForm={true}
            disabled={!enabled && !isMain}
            {...register(`researchers.${index}.first_name`, {
              required: isMain,
            })}
          />
          <TextInputCustom
            label="Last Name"
            type="text"
            required={isMain}
            isForm={true}
            disabled={!enabled && !isMain}
            {...register(`researchers.${index}.last_name`, {
              required: isMain,
            })}
          />
          <TextInputCustom
            label="Mobile No."
            type="text"
            required={isMain}
            isForm={true}
            disabled={!enabled && !isMain}
            {...register(`researchers.${index}.mobile_number`, {
              required: isMain,
            })}
          />
          <TextInputCustom
            label="Email"
            type="email"
            required={isMain}
            isForm={true}
            disabled={!enabled && !isMain}
            {...register(`researchers.${index}.email`, { required: isMain })}
          />
        </Col>

        <Col>
          <Form.Group className="flex-container custom-input">
            <Form.Label className="custom-label">College</Form.Label>
            <Form.Select
              className="custom-control"
              disabled={(sameCollege && !isMain) || (!enabled && !isMain)}
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
            />
          )}

          <Form.Group className="flex-container custom-input">
            <Form.Label className="custom-label">Department</Form.Label>
            <Form.Select
              className="custom-control"
              disabled={(sameDept && !isMain) || (!enabled && !isMain)}
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
            />
          )}
        </Col>
      </Row>
    </div>
  );
}

function ApplicationForm() {
  const BASE_URL = "https://adamsoncr.tekteachlms.com";
  const history = useHistory()
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [representative, setRepresentative] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [budgetBreakdown, setBudgetBreakdown] = useState();
  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    defaultValues,
  } = useForm({
    defaultValues: {
      title: "",
      category: [],
      purpose_id: 1,
      version_number: "",
      research_duration: "",
      ethical_considerations: false,
      submitted_by: "",
      submitted_date: "",
      researchers: Array(5).fill({}),
      endorsements: [],
      breakdown: [],
    },
  });
  const breakdownValues =
    useWatch({
      control,
      name: "breakdown",
    }) || [];
  const checkedValues = watch("breakdown");

  const totalAmount = breakdownValues.reduce((acc, curr) => {
    const isChecked = curr?.checked;
    const amount = parseFloat(curr?.amount) || 0;
    return isChecked ? acc + amount : acc;
  }, 0);

  const toRoman = (num) => {
    const romans = [
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
    ];
    return romans[num - 1] || num;
  };

  const documentDescriptions = {
    "Letter of Intent":
      "This application must be submitted together with the letter of intent to apply for research funding addressed to the CRD Executive Director, endorsed and signed by the College Research Coordinator, Department Chair and the College Dean.",
    "Research Proposal":
      "Full proposal should be submitted together with this form which includes Background of the Study, Review of Related Literature and Methodology.",
    "Researcher/s Curriculum Vitae (CV)":
      "A copy of the Researcher/s Curriculum Vitae (CV) should also be submitted. The content of the CV must include the list of previous research done by the researcher, incorporating his/her thesis or dissertation topic/study.",
    "Initial Review and Screening":
      "All researches will undergo initial review and screening prior to approval.",
    "Ethics Review":
      "Proposals with human participants must undergo Ethics Review by the UERC.",
    "Gantt Chart":
      "Activities related to project implementation. Exclude proposal preparation.",
    "Detailed Budget Breakdown":
      "Must have high-probability of estimation accuracy of project expenses.",
  };

  console.log({ budgetBreakdown });

  useEffect(() => {
    const fetchData = async () => {
      const categoryRes = await new ResearchApplicationAPI().fetchCategories();
      if (categoryRes.ok) {
        setCategories(categoryRes.data.ResearchCategory);
      }

      // const repRes = await new ResearchApplicationAPI().fetchEndorsementRepresentative();
      // if (repRes.ok) {
      //   const reps = repRes.data.EndorsementRepresentative;
      //   setRepresentative(reps);

      //   reset({
      //     ...defaultValues,
      //     endorsements: reps.map(r => ({
      //       endorsement_rep_id: r.id,
      //       endorsement_rep_name: '',
      //       status: parseInt(4),
      //     }))
      //   });
      // }

      const docTypesRes =
        await new ResearchApplicationAPI().fetchDocumentTypes();
      if (docTypesRes.ok) {
        const dox = docTypesRes.data.DocumentTypes;
        setDocumentTypes(dox);
      }
    };

    fetchData();
  }, [reset, defaultValues]);

  useEffect(() => {
    const fetchResearchDetails = async () => {
      let res = await new ResearchApplicationAPI().fetchResearchDetails();
      if (res.ok) {
        setBudgetBreakdown(res.data?.Details?.BudgetBreakdownDetails);
        setRepresentative(res?.data?.Details?.EndorsementRepresentative);
      } else {
        console.log("error fetching research details");
      }
    };

    fetchResearchDetails();
  }, [reset]);

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
    console.log("✅ Final Submitted Data:", data);
    console.log("✅ Endorsements:", data.endorsements);
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
              amount: parseInt(b.amount),
            })),
        });

      if (!researchResponse.ok)
        return alert("Failed to create research application.");

      const researchId = researchResponse.data.Research.id;

      for (const document of data.documents || []) {
        if (!document || !document.file || !document.document_title_id)
          continue;

        const file = document.file[0];
        if (!(file instanceof File)) continue;

        const formData = new FormData();
        formData.append("document_filepath", file);

        const token = window.localStorage.getItem("token");

        const response = await fetch(
          `${BASE_URL}/api/v1/research_documents/create/${researchId}/${document.document_title_id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          console.warn(
            `❌ Failed to upload document with title ID ${document.document_title_id}`
          );
        } else {
          console.log(
            `✅ Document ${document.document_title_id} uploaded successfully`
          );
          history.push('/dashboard')
        }
      }

      alert("Research submitted successfully.");
      setStep(1);
    } catch (error) {
      console.error(error);
      alert("An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  console.log({ representative });

  return (
    <div className="application-form">
      {loading && <TransparentLoader />}
      <div className="form-container">
        <h1 className="mt-5 mb-5 fw-bold text-white">
          {" "}
          New Research Application
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
                />
              </FormCard>
              <FormCard>
                <h5 className="title">
                  I. Protocol’s 5-point Research Agenda Category
                </h5>
                <div className="content-checkbox">
                  {categories.map((item) => (
                    <Form.Check
                      key={item.id}
                      label={item.research_name}
                      type="checkbox"
                      {...register("category")}
                      value={item.id}
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
                          defaultChecked
                        />
                      </Col>
                      <Col>
                        <Form.Check
                          label="Resubmission"
                          type="radio"
                          value={2}
                          {...register("purpose_id")}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col className="flex-container mt--6">
                    <Form.Label className="mb-0 form-labels">
                      Version Number
                    </Form.Label>
                    <Form.Control type="text" {...register("version_number")} />
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
                />
              </FormCard>

              <FormCard>
                <h5 className="fw-bold mb-3">V. Ethical Considerations</h5>
                <Form.Check
                  label="With Human Participants"
                  isForm={true}
                  type="checkbox"
                  {...register("ethical_considerations")}
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
                    />
                  </Col>
                  <Col>
                    <TextInputCustom
                      isForm={true}
                      type="date"
                      {...register("submitted_date")}
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
                      {...register(`endorsements.${index}.endorsement_rep_id`)}
                      value={item.id}
                    />

                    <Col>
                      <TextInputCustom
                        isForm={true}
                        disabled={true}
                        label={item.UserAccount.UserRole.role_desc}
                        type="text"
                        placeholder={`${item.first_name} ${item.last_name}`}
                        {...register(
                          `endorsements.${index}.endorsement_rep_name`
                        )}
                      />
                    </Col>

                    <Col>
                      <TextInputCustom
                        isForm={true}
                        label="Status"
                        type="text"
                        disabled={true}
                        placeholder="Not yet endorsed"
                      // {...register(`endorsements.${index}.status`)}
                      />
                    </Col>
                  </Row>
                ))}
              </FormCard>

              <h4 className="text-white">Notes:</h4>

              {documentTypes.map((doc, index) => (
                <FormCard>
                  <div key={doc.id} className="mb-4">
                    <p className="fw-bold mb-1">{`${toRoman(index + 1)}. ${doc.document_name
                      }`}</p>
                    <p className="mb-2">
                      {documentDescriptions[doc.document_name]}
                    </p>

                    {[
                      "Letter of Intent",
                      "Research Proposal",
                      "Researcher/s Curriculum Vitae (CV)",
                      "Gantt Chart",
                      "Detailed Budget Breakdown",
                    ].includes(doc.document_name) && (
                        <>
                          <Form.Control
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            {...register(`documents.${index}.file`)}
                          />

                          <input
                            type="hidden"
                            {...register(`documents.${index}.document_title_id`)}
                            value={doc.id}
                          />

                          {doc.id == 7 && (
                            <div className="breakdown mt-4">
                              <Row className="breakdown-column px-5">
                                <Col className="text-center mb-3">
                                  Maintenance/Operational Fund
                                </Col>
                                <Col className="text-center mb-3">
                                  Total (in Php)
                                </Col>

                                {budgetBreakdown?.map((item, i) => (
                                  <Row key={i} className="py-3">
                                    <Col>
                                      <Form.Check
                                        type="checkbox"
                                        label={item.fund_name}
                                        {...register(`breakdown.${i}.checked`)}
                                      />
                                    </Col>

                                    <Col>
                                      <input
                                        type="hidden"
                                        {...register(`breakdown.${i}.fund_id`)}
                                        value={item.id}
                                      />

                                      <Form.Control
                                        type="number"
                                        step="0.01"
                                        className="text-end"
                                        {...register(`breakdown.${i}.amount`)}
                                        disabled={!checkedValues?.[i]?.checked}
                                      />
                                    </Col>
                                  </Row>
                                ))}

                                <Row className="my-3">
                                  <Col className="ms-4">
                                    <b>Overall Total Amount</b>
                                  </Col>
                                  <Col>
                                    <Form.Control
                                      readOnly
                                      value={(totalAmount || 0).toLocaleString(
                                        "en-PH",
                                        { minimumFractionDigits: 2 }
                                      )}
                                      className="text-end"
                                    />
                                  </Col>
                                </Row>
                              </Row>
                            </div>
                          )}
                        </>
                      )}
                  </div>
                </FormCard>
              ))}
            </>
          )}

          <div className="btn-groups">
            {step === 1 ? (
              <>
                <OutlineButton label="Cancel" />
                <OutlineButton label="Save as Draft" />
                <ConfirmationButton label="Next" onProceed={() => setStep(2)} />
              </>
            ) : (
              <>
                <OutlineButton label="Back" onCancel={() => setStep(1)} />
                <OutlineButton label="Save as Draft" />
                <Button
                  className="btn-confirmation-custom"
                  variant="primary"
                  type="submit"
                >
                  Submit
                </Button>
              </>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}

export default ApplicationForm;
