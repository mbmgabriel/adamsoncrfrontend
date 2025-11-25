import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { useForm, useWatch } from 'react-hook-form';
import FormCard from '../../../components/Card/FormCard';
import TextInputCustom from '../../../components/Input/TextInputCustom';
import ResearchApplicationAPI from '../../../api/ResearchApplicationAPI';
import TransparentLoader from '../../../components/Loader/TransparentLoader';
import OutlineButton from '../../../components/Buttons/OutlineButton';
import ConfirmationButton from '../../../components/Buttons/ConfirmationButton';

export function ResearcherSection({ index, isMain, control, register, watch, setValue }) {
  const numberLabel = isMain ? 'Researcher 1 (Main Author)' : `Researcher ${index + 1} (Co-author)`;

  const enabled = isMain ? true : watch(`researchers.${index}.enabled`);
  const sameCollege = watch('sameCollege');
  const sameDept = watch('sameDept');
  const mainCollege = watch('researchers.0.college');
  const mainDept = watch('researchers.0.dept');

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
            {...register(`researchers.${index}.id_number`, { required: isMain })}
          />
          <TextInputCustom
            label="First Name"
            type="text"
            required={isMain}
            isForm={true}
            disabled={!enabled && !isMain}
            {...register(`researchers.${index}.first_name`, { required: isMain })}
          />
          <TextInputCustom
            label="Last Name"
            type="text"
            required={isMain}
            isForm={true}
            disabled={!enabled && !isMain}
            {...register(`researchers.${index}.last_name`, { required: isMain })}
          />
          <TextInputCustom
            label="Mobile No."
            type="text"
            required={isMain}
            isForm={true}
            disabled={!enabled && !isMain}
            {...register(`researchers.${index}.mobile_number`, { required: isMain })}
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
          <Form.Group className='flex-container custom-input'>
            <Form.Label className='custom-label'>College</Form.Label>
            <Form.Select
              className='custom-control'
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

          <Form.Group className='flex-container custom-input'>
            <Form.Label className='custom-label'>Department</Form.Label>
            <Form.Select
              className='custom-control'
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
  const BASE_URL = "https://adamsoncr.tekteachlms.com"
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [representative, setRepresentative] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(false)
  const [budgetBreakdown, setBudgetBreakdown] = useState()
  const { control, handleSubmit, register, setValue, watch, reset, defaultValues } = useForm({
    defaultValues: {
      title: '',
      category: [],
      purpose_id: 1,
      version_number: '',
      research_duration: '',
      ethical_considerations: false,
      submitted_by: '',
      submitted_date: '',
      researchers: Array(5).fill({}),
      endorsements: [],
      breakdown: []
    },
  });
  const breakdownValues = useWatch({
    control,
    name: 'breakdown',
  }) || [];

  const totalAmount = breakdownValues.reduce((acc, curr) => {
    const isChecked = curr?.checked;
    const amount = parseFloat(curr?.amount) || 0;
    return isChecked ? acc + amount : acc;
  }, 0);



  const toRoman = (num) => {
    const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
    return romans[num - 1] || num;
  };

  const documentDescriptions = {
    "Letter of Intent": "This application must be submitted together with the letter of intent to apply for research funding addressed to the CRD Executive Director, endorsed and signed by the College Research Coordinator, Department Chair and the College Dean.",
    "Research Proposal": "Full proposal should be submitted together with this form which includes Background of the Study, Review of Related Literature and Methodology.",
    "Researcher/s Curriculum Vitae (CV)": "A copy of the Researcher/s Curriculum Vitae (CV) should also be submitted. The content of the CV must include the list of previous research done by the researcher, incorporating his/her thesis or dissertation topic/study.",
    "Initial Review and Screening": "All researches will undergo initial review and screening prior to approval.",
    "Ethics Review": "Proposals with human participants must undergo Ethics Review by the UERC.",
    "Gantt Chart": "Activities related to project implementation. Exclude proposal preparation.",
    "Detailed Budget Breakdown": "Must have high-probability of estimation accuracy of project expenses."
  };

  console.log({ budgetBreakdown })


  useEffect(() => {
    const fetchData = async () => {
      const categoryRes = await new ResearchApplicationAPI().fetchCategories();
      if (categoryRes.ok) {
        setCategories(categoryRes.data.ResearchCategory);
      }

      const repRes = await new ResearchApplicationAPI().fetchEndorsementRepresentative();
      if (repRes.ok) {
        const reps = repRes.data.EndorsementRepresentative;
        setRepresentative(reps);

        reset({
          ...defaultValues,
          endorsements: reps.map(r => ({
            endorsement_rep_id: r.id,
            endorsement_rep_name: '',
            status: parseInt(4),
          }))
        });
      }

      const docTypesRes = await new ResearchApplicationAPI().fetchDocumentTypes();
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
      } else {
        console.log("error fetching research details");
      }
    };


    fetchResearchDetails();
  }, [reset]);

  useEffect(() => {
    if (budgetBreakdown?.length) {
      const breakdownDefaults = budgetBreakdown.map(item => ({
        checked: false,
        fund_id: item.id,
        amount: ''
      }));

      reset(prev => ({
        ...prev,
        breakdown: breakdownDefaults
      }));
    }
  }, [budgetBreakdown, reset]);

  const onSubmit = async (data) => {
    console.log('✅ Final Submitted Data:', data);
    console.log('✅ Endorsements:', data.endorsements);
    setLoading(true)

    try {
      const researchResponse = await new ResearchApplicationAPI().createResearch({
        title: data.title,
        category: data.category.filter(Boolean).join(','),
        purpose_id: data.purpose_id,
        version_number: data.version_number,
        research_duration: data.research_duration,
        ethical_considerations: data.ethical_considerations ? 1 : 0,
        submitted_by: data.submitted_by,
        submitted_date: data.submitted_date,
        status_id: 3 
      });

      if (!researchResponse.ok) return alert('Failed to create research.');
      const researchId = researchResponse.data.Research.id;

      for (const investigator of data.researchers.filter(r => r.id_number)) {
        await new ResearchApplicationAPI().createResearchInvestigators({
          research_id: researchId,
          ...investigator,
        });
      }

      for (const endorsement of data.endorsements) {
        await new ResearchApplicationAPI().createEndorsement({
          research_id: researchId,
          ...endorsement,
        });
      }

      for (const document of data.documents || []) {
        if (!document || !document.file || !document.document_title_id) continue;

        const file = document.file[0];
        if (!(file instanceof File)) continue;

        const formData = new FormData();
        formData.append('document_filepath', file);

        const token = await window.localStorage.getItem("token");

        const response = await fetch(
          `${BASE_URL}/api/v1/research_documents/create/${researchId}/${document.document_title_id}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          console.warn(`❌ Failed to upload document with title ID ${document.document_title_id}`);
        } else {
          console.log(`✅ Document ${document.document_title_id} uploaded successfully`);
        }
      }

      for (const breakdown of data.breakdown) {
        if (!breakdown.checked) continue;

        await new ResearchApplicationAPI().createBudgetBreakdown({
          research_id: researchId,
          fund_id: parseInt(breakdown.fund_id),
          amount: parseInt(breakdown.amount)
        });
      }



      alert('Research submitted successfully.');

      reset({
        ...defaultValues,
        endorsements: representative.map(r => ({
          endorsement_rep_id: r.id,
          endorsement_rep_name: '',
          status: '',
        })),
      });
      setStep(1);

    } catch (e) {
      console.error(e);
      alert('An error occurred during submission.');
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="application-form">
      {loading && <TransparentLoader />}
      <div className='form-container'>
        <h1 className='mt-5 mb-5 fw-bold text-white'> New Research Application</h1>
        <Form className="form" onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <>
              <FormCard className='flex-container'>
                <Form.Label className='title me-3'>Title</Form.Label>
                <Form.Control as="textarea" rows={4} {...register('title', { required: true })} />
              </FormCard>
              <FormCard>
                <h5 className="title">I. Protocol’s 5-point Research Agenda Category</h5>
                <div
                  className='content-checkbox'>
                  {categories.map(item => (
                    <Form.Check
                      key={item.id}
                      label={item.research_name}
                      type="checkbox"
                      {...register('category')}
                      value={item.id}
                    />
                  ))}
                </div>
              </FormCard>
              <FormCard>
                <h5 className="title">II. Purpose of Submission</h5>
                <Row className='px-4'>
                  <Col>
                    <Row>
                      <Col>
                        <Form.Check label="Initial" type="radio" value={1} {...register('purpose_id')} defaultChecked />
                      </Col>
                      <Col>
                        <Form.Check label="Resubmission" type="radio" value={2} {...register('purpose_id')} />
                      </Col>
                    </Row>
                  </Col>
                  <Col className='flex-container mt--6'>
                    <Form.Label className='mb-0 form-labels'>Version Number</Form.Label>
                    <Form.Control type='text'  {...register('version_number')} />
                  </Col>
                </Row>
              </FormCard>
              <FormCard>
                <div className="title flex flex-row"><span className='me-4'>III. Investigators</span><span className="text-danger">*</span> Required Fields</div>
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
            </>)}

          {step === 2 && (
            <>
              <FormCard>
                <h5 className="fw-bold mb-3">IV. Research Duration</h5>
                <TextInputCustom label="Duration (semesters)" isForm={true} type="text" {...register('research_duration')} />
              </FormCard>

              <FormCard>
                <h5 className="fw-bold mb-3">V. Ethical Considerations</h5>
                <Form.Check label="With Human Participants" isForm={true} type="checkbox" {...register('ethical_considerations')} />
              </FormCard>

              <FormCard>
                <h5 className="fw-bold mb-3">VI. Submission</h5>
                <Row>
                  <Col>
                    <TextInputCustom label="Submitted by" isForm={true} type="text" {...register('submitted_by')} />
                  </Col>
                  <Col>
                    <TextInputCustom isForm={true} type="date" {...register('submitted_date')} />
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
                        label={item.rep_name}
                        type="text"
                        placeholder=""
                        {...register(`endorsements.${index}.endorsement_rep_name`)}
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

              <h4 className='text-white'>Notes:</h4>

              {documentTypes.map((doc, index) => (
                <FormCard>
                  <div key={doc.id} className="mb-4">
                    <p className="fw-bold mb-1">{`${toRoman(index + 1)}. ${doc.document_name}`}</p>
                    <p className="mb-2">{documentDescriptions[doc.document_name]}</p>

                    {["Letter of Intent", "Research Proposal", "Researcher/s Curriculum Vitae (CV)", "Gantt Chart", "Detailed Budget Breakdown"].includes(doc.document_name) && (
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

                        {doc.id == 7 &&
                          <div className='breakdown mt-4'>
                            <Row className='breakdown-column px-5'>
                              <Col className='text-center mb-3'>Maintenance/Operational Fund</Col>
                              <Col className='text-center mb-3'>Total (in Php)</Col>

                              {budgetBreakdown?.map((item, i) => (
                                <Row key={i} className='py-3'>
                                  <Col>
                                    <Form.Check
                                      type='checkbox'
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
                                      type='number'
                                      step='0.01'
                                      className='text-end'
                                      {...register(`breakdown.${i}.amount`)}
                                    />
                                  </Col>
                                </Row>
                              ))}

                              <Row className='my-3'>
                                <Col className='ms-4'><b>Overall Total Amount</b></Col>
                                <Col>
                                  <Form.Control
                                    readOnly
                                    value={(totalAmount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    className='text-end'
                                  />
                                </Col>
                              </Row>
                            </Row>
                          </div>
                        }
                      </>
                    )}
                  </div>
                </FormCard>
              ))}
            </>)}

          <div className='btn-groups'>
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
                <Button className='btn-confirmation-custom' variant="primary" type="submit">Submit</Button>
              </>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}

export default ApplicationForm;

// import React, { useEffect, useState } from "react";
// import { Form, Row, Col, Button } from "react-bootstrap";
// import { useForm, Controller } from "react-hook-form";
// import FormCard from "../../../components/Card/FormCard";
// import TextInputCustom from "../../../components/Input/TextInputCustom";
// import OutlineButton from "../../../components/Buttons/OutlineButton";
// import ConfirmationButton from "../../../components/Buttons/ConfirmationButton";
// import ResearchApplicationAPI from "../../../api/ResearchApplicationAPI";
// import TransparentLoader from "../../../components/Loader/TransparentLoader";

// function ApplicationForm() {
//   const BASE_URL = "https://adamsoncr.tekteachlms.com";
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState(1);
//   const [researchDetails, setResearchDetails] = useState([]);
//   const [departments, setDepartments] = useState([]);

//   const [mainCollege, setMainCollege] = useState("");
//   const [mainDepartment, setMainDepartment] = useState("");

//   const [sameCollege, setSameCollege] = useState(false);
//   const [sameDepartment, setSameDepartment] = useState(false);

//   const [coAuthors, setCoAuthors] = useState([
//     { id: 2, enabled: false, college: "", department: "" },
//     { id: 3, enabled: false, college: "", department: "" },
//     { id: 4, enabled: false, college: "", department: "" },
//     { id: 5, enabled: false, college: "", department: "" },
//   ]);

//   const { register, handleSubmit, control, reset, watch, setValue } = useForm({
//     defaultValues: {
//       title: "",
//       category: [],
//       purpose_id: "",
//       version_number: "",
//       research_duration: "",
//       ethical_considerations: false,
//       submitted_by: "",
//       submitted_date: "",
//       researchers: [
//         { id_number: "", first_name: "", last_name: "", mobile_no: "", email: "", college: "", department: "" },
//         ...coAuthors.map(() => ({ id_number: "", first_name: "", last_name: "", mobile_no: "", email: "", college: "", department: "" }))
//       ],
//       endorsements: [],
//       documents: [],
//     },
//   });

//   useEffect(() => {
//     const fetchResearchDetails = async () => {
//       let res = await new ResearchApplicationAPI().fetchResearchDetails();
//       if (res.ok) {
//         setResearchDetails(res.data?.Details);
//         // Initialize endorsements and documents once data is fetched
//         reset((prev) => ({
//           ...prev,
//           endorsements: res.data?.Details?.EndorsementRepresentative?.map(rep => ({
//             endorsement_rep_id: rep.id,
//             endorsement_rep_name: "",
//             status: "",
//           })),
//           documents: res.data?.Details?.DocumentTypes?.map(doc => ({
//             file: null,
//             document_title_id: doc.id
//           })),
//         }));
//       } else {
//         console.log("error fetching research details");
//       }
//     };

//     const fetchDepartments = async () => {
//       let res = await new ResearchApplicationAPI().fetchDepartments();
//       if (res.ok) {
//         setDepartments(res.data?.Departments);
//       } else {
//         console.error(res.data);
//       }
//     };

//     fetchResearchDetails();
//     fetchDepartments();
//   }, [reset]);

//   const toggleCoAuthor = (id) => {
//     setCoAuthors((prev) =>
//       prev.map((co) => (co.id === id ? { ...co, enabled: !co.enabled } : co))
//     );
//   };

//   // Sync same college/department to all co-authors
//   useEffect(() => {
//     if (sameCollege) {
//       coAuthors.forEach((co, index) =>
//         setValue(`researchers.${index + 1}.college`, mainCollege)
//       );
//     }
//   }, [sameCollege, mainCollege, coAuthors, setValue]);

//   useEffect(() => {
//     if (sameDepartment) {
//       coAuthors.forEach((co, index) =>
//         setValue(`researchers.${index + 1}.department`, mainDepartment)
//       );
//     }
//   }, [sameDepartment, mainDepartment, coAuthors, setValue]);

//   const onSubmit = async (data) => {
//     console.log('✅ Final Submitted Data:', data);
//     setLoading(true);

//     try {
//       const researchResponse = await new ResearchApplicationAPI().createResearch({
//         title: data.title,
//         category: data.category.filter(Boolean).join(','),
//         purpose_id: data.purpose_id,
//         version_number: data.version_number,
//         research_duration: data.research_duration,
//         ethical_considerations: data.ethical_considerations ? 1 : 0,
//         submitted_by: data.submitted_by,
//         submitted_date: data.submitted_date,
//       });

//       if (!researchResponse.ok) return alert('Failed to create research.');
//       const researchId = researchResponse.data.Research.id;

//       // Include main author + only enabled co-authors
//       const activeResearchers = [
//         data.researchers[0], // main author
//         ...coAuthors
//           .map((co, index) => ({ ...data.researchers[index + 1], enabled: co.enabled }))
//           .filter((r) => r.enabled && r.id_number) // only enabled co-authors with ID
//       ];

//       for (const investigator of activeResearchers) {
//         await new ResearchApplicationAPI().createResearchInvestigators({
//           research_id: researchId,
//           ...investigator,
//         });
//       }

//       for (const endorsement of data.endorsements.map(e => ({
//         ...e,
//         status: e.status || 4,
//       }))) {
//         await new ResearchApplicationAPI().createEndorsement({
//           research_id: researchId,
//           ...endorsement,
//         });
//       }

//       for (const document of data.documents || []) {
//         if (!document || !document.file || !document.document_title_id) continue;

//         const file = document.file[0];
//         if (!(file instanceof File)) continue;

//         const formData = new FormData();
//         formData.append('document_filepath', file);

//         const token = await window.localStorage.getItem("token");

//         const response = await fetch(
//           `${BASE_URL}/api/v1/research_documents/create/${researchId}/${document.document_title_id}`,
//           {
//             method: 'POST',
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//             body: formData,
//           }
//         );

//         if (!response.ok) {
//           console.warn(`❌ Failed to upload document with title ID ${document.document_title_id}`);
//         } else {
//           console.log(`✅ Document ${document.document_title_id} uploaded successfully`);
//         }
//       }

//       alert('Research submitted successfully.');
//       setStep(1);
//     } catch (e) {
//       console.error(e);
//       alert('An error occurred during submission.');
//     } finally {
//       setLoading(false);
//     }
//   };


//   return (
//     <div className="application-form">
//       {loading && <TransparentLoader />}
//       <div className="form-container">
//         <h1 className="mt-5 mb-5 fw-bold text-white">New Research Application</h1>

//         <Form className="form" onSubmit={handleSubmit(onSubmit)}>
//           {step === 1 && (
//             <>
//               {/* Title */}
//               <FormCard className="flex-container">
//                 <Form.Label className="title me-3">Title</Form.Label>
//                 <Form.Control as="textarea" rows={4} {...register("title")} />
//               </FormCard>

//               {/* Category */}
//               <FormCard>
//                 <h5 className="title">I. Protocol’s 5-point Research Agenda Category</h5>
//                 <div className="content-checkbox">
//                   {researchDetails?.ResearchCategory?.map((item) => (
//                     <Form.Check
//                       key={item.id}
//                       type="checkbox"
//                       label={item.research_name}
//                       value={item.id}
//                       {...register("category")}
//                     />
//                   ))}
//                 </div>
//               </FormCard>

//               {/* Purpose */}
//               <FormCard>
//                 <h5 className="title">II. Purpose of Submission</h5>
//                 <Row className="px-4">
//                   <Col>
//                     <Row>
//                       {researchDetails?.ResearchPurpose?.map((purpose) => (
//                         <Col key={purpose.id}>
//                           <Form.Check
//                             type="radio"
//                             label={purpose?.purpose_name}
//                             value={purpose.id}
//                             {...register("purpose_id")}
//                           />
//                         </Col>
//                       ))}
//                     </Row>
//                   </Col>

//                   <Col className="flex-container mt--6">
//                     <Form.Label className="mb-0 form-labels">Version Number</Form.Label>
//                     <Form.Control type="text" {...register("version_number")} />
//                   </Col>
//                 </Row>
//               </FormCard>

//               {/* Investigators */}
//               <FormCard>
//                 <h5 className="title">III. Investigators</h5>
//                 <div className="mb-4 px-4">
//                   <p className="fw-bold mb-3">Researcher 1 (Main Author)</p>
//                   <Row>
//                     <Col sm={12} md={12} lg={6} className="form-input-container">
//                       <TextInputCustom label="ID Number" isForm={true} {...register("researchers.0.id_number")} />
//                       <TextInputCustom label="First Name" isForm={true} {...register("researchers.0.first_name")} />
//                       <TextInputCustom label="Last Name" isForm={true} {...register("researchers.0.last_name")} />
//                       <TextInputCustom label="Mobile No." isForm={true} {...register("researchers.0.mobile_no")} />
//                       <TextInputCustom label="Email" isForm={true} type="email" {...register("researchers.0.email")} />
//                     </Col>

//                     <Col>
//                       <Form.Group className="flex-container custom-input">
//                         <Form.Label className="custom-label">College</Form.Label>
//                         <Form.Select
//                           className="custom-control"
//                           value={mainCollege}
//                           onChange={(e) => {
//                             setMainCollege(e.target.value);
//                             setValue("researchers.0.college", e.target.value);
//                           }}
//                         >
//                           <option value="">Select College</option>
//                           <option value="College A">College A</option>
//                           <option value="College B">College B</option>
//                         </Form.Select>
//                       </Form.Group>

//                       <Form.Check
//                         type="checkbox"
//                         label="Same College to all co-authors"
//                         checked={sameCollege}
//                         onChange={(e) => setSameCollege(e.target.checked)}
//                       />

//                       <Form.Group className="flex-container custom-input">
//                         <Form.Label className="custom-label">Department</Form.Label>
//                         <Form.Select
//                           className="custom-control"
//                           value={mainDepartment}
//                           onChange={(e) => {
//                             setMainDepartment(e.target.value);
//                             setValue("researchers.0.department", e.target.value);
//                           }}
//                         >
//                           <option value="">Select Department</option>
//                           {departments?.map((item) => (
//                             <option key={item.id} value={item.dept_name}>
//                               {item.dept_name}
//                             </option>
//                           ))}
//                         </Form.Select>
//                       </Form.Group>

//                       <Form.Check
//                         type="checkbox"
//                         label="Same Department to all co-authors"
//                         checked={sameDepartment}
//                         onChange={(e) => setSameDepartment(e.target.checked)}
//                       />
//                     </Col>
//                   </Row>
//                 </div>

//                 {coAuthors.map((coAuthor, index) => (
//                   <div key={coAuthor.id} className="mb-4 px-4">
//                     <Form.Check
//                       type="checkbox"
//                       label={`Researcher ${coAuthor.id} (Co-author)`}
//                       className="mb-2 margin-left-29"
//                       checked={coAuthor.enabled}
//                       onChange={() => toggleCoAuthor(coAuthor.id)}
//                     />

//                     <Row>
//                       <Col sm={12} md={12} lg={6} className="form-input-container">
//                         <TextInputCustom
//                           label="ID Number"
//                           isForm={true}
//                           disabled={!coAuthor.enabled}
//                           {...register(`researchers.${index + 1}.id_number`)}
//                         />
//                         <TextInputCustom
//                           label="First Name"
//                           isForm={true}
//                           disabled={!coAuthor.enabled}
//                           {...register(`researchers.${index + 1}.first_name`)}
//                         />
//                         <TextInputCustom
//                           label="Last Name"
//                           isForm={true}
//                           disabled={!coAuthor.enabled}
//                           {...register(`researchers.${index + 1}.last_name`)}
//                         />
//                         <TextInputCustom
//                           label="Mobile No."
//                           isForm={true}
//                           disabled={!coAuthor.enabled}
//                           {...register(`researchers.${index + 1}.mobile_no`)}
//                         />
//                         <TextInputCustom
//                           label="Email"
//                           isForm={true}
//                           type="email"
//                           disabled={!coAuthor.enabled}
//                           {...register(`researchers.${index + 1}.email`)}
//                         />
//                       </Col>

//                       <Col>
//                         <Form.Group className="flex-container custom-input">
//                           <Form.Label className="custom-label">College</Form.Label>
//                           <Controller
//                             control={control}
//                             name={`researchers.${index + 1}.college`}
//                             render={({ field }) => (
//                               <Form.Select
//                                 {...field}
//                                 value={coAuthor.enabled ? (sameCollege ? mainCollege : field.value) : ""}
//                                 disabled={!coAuthor.enabled || sameCollege}
//                                 onChange={(e) => field.onChange(e.target.value)}
//                               >
//                                 <option value="">Select College</option>
//                                 <option value="College A">College A</option>
//                                 <option value="College B">College B</option>
//                               </Form.Select>
//                             )}
//                           />
//                         </Form.Group>

//                         <Form.Group className="flex-container custom-input">
//                           <Form.Label className="custom-label">Department</Form.Label>
//                           <Controller
//                             control={control}
//                             name={`researchers.${index + 1}.department`}
//                             render={({ field }) => (
//                               <Form.Select
//                                 {...field}
//                                 value={coAuthor.enabled ? (sameDepartment ? mainDepartment : field.value) : ""}
//                                 disabled={!coAuthor.enabled || sameDepartment}
//                                 onChange={(e) => field.onChange(e.target.value)}
//                               >
//                                 <option value="">Select Department</option>
//                                 {departments?.map((item) => (
//                                   <option key={item.id} value={item.dept_name}>
//                                     {item.dept_name}
//                                   </option>
//                                 ))}
//                               </Form.Select>
//                             )}
//                           />
//                         </Form.Group>
//                       </Col>
//                     </Row>
//                   </div>
//                 ))}
//               </FormCard>
//             </>
//           )}

//           {step === 2 && (
//             <>
//               {/* Research Duration */}
//               <FormCard>
//                 <h5 className="fw-bold mb-3">IV. Research Duration</h5>
//                 <TextInputCustom label="Duration (semesters)" isForm={true} {...register("research_duration")} />
//               </FormCard>

//               {/* Ethical Considerations */}
//               <FormCard>
//                 <h5 className="fw-bold mb-3">V. Ethical Considerations</h5>
//                 <Form.Check label="With Human Participants" type="checkbox" {...register("ethical_considerations")} />
//               </FormCard>

//               {/* Submission */}
//               <FormCard>
//                 <h5 className="fw-bold mb-3">VI. Submission</h5>
//                 <Row>
//                   <Col>
//                     <TextInputCustom label="Submitted by" isForm={true} {...register("submitted_by")} />
//                   </Col>
//                   <Col>
//                     <TextInputCustom label="Date" type="date" isForm={true} {...register("submitted_date")} />
//                   </Col>
//                 </Row>
//               </FormCard>

//               {/* Endorsements */}
//               <FormCard>
//                 <h5 className="fw-bold mb-3">VII. Endorsement</h5>
//                 {researchDetails?.EndorsementRepresentative?.map((rep, index) => (
//                   <Row key={rep.id}>
//                     <Col>
//                       <TextInputCustom label={rep.rep_name} isForm={true} {...register(`endorsements.${index}.endorsement_rep_name`)} />
//                     </Col>
//                     <Col>
//                       <Form.Group className="flex-container custom-input">
//                         <Form.Label className="custom-label">College</Form.Label>
//                         <Form.Select className="custom-control" defaultValue={4} disabled>
//                           {(researchDetails?.StatusTables || []).map((status) => (
//                             <option key={status?.id} >{status?.status}</option>
//                           ))}
//                         </Form.Select>
//                       </Form.Group>
//                     </Col>
//                   </Row>
//                 ))}
//               </FormCard>

//               {/* Documents */}
//               {researchDetails?.DocumentTypes?.map((doc, index) => (
//                 <FormCard key={doc.id}>
//                   <div className="mb-4">
//                     <p className="fw-bold mb-1">{index + 1}. {doc.document_name}</p>
//                     <Form.Control
//                       type="file"
//                       accept=".pdf,.doc,.docx,.xls,.xlsx"
//                       {...register(`documents.${index}.file`)}
//                     />
//                   </div>
//                 </FormCard>
//               ))}
//             </>
//           )}

//           <div className="btn-groups">
//             {step === 1 ? (
//               <>
//                 <OutlineButton label="Cancel" />
//                 <OutlineButton label="Save as Draft" />
//                 <ConfirmationButton label="Next" onProceed={() => setStep(2)} />
//               </>
//             ) : (
//               <>
//                 <OutlineButton label="Back" onCancel={() => setStep(1)} />
//                 <OutlineButton label="Save as Draft" />
//                 <Button type="submit" className="btn-confirmation-custom" variant="primary">
//                   Submit
//                 </Button>
//               </>
//             )}
//           </div>
//         </Form>
//       </div>
//     </div>
//   );
// }

// export default ApplicationForm;
