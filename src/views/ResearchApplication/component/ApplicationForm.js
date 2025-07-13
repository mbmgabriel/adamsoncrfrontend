import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import FormCard from '../../../components/Card/FormCard';
import TextInputCustom from '../../../components/Input/TextInputCustom';
import ResearchApplicationAPI from '../../../api/ResearchApplicationAPI';
import TransparentLoader from '../../../components/Loader/TransparentLoader';

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
    <div className="mb-4">
      {!isMain && (
        <Form.Check
          type="checkbox"
          id={`researcher-enable-${index}`}
          label={numberLabel}
          className="mb-2"
          {...register(`researchers.${index}.enabled`)}
        />
      )}

      {isMain && <h6 className="fw-bold mb-3">{numberLabel} <span className="text-danger">*</span> Required Fields</h6>}

      <Row className="g-3">
        <Col md={4}>
          <TextInputCustom
            label="ID Number"
            type="text"
            required={isMain}
            disabled={!enabled && !isMain}
            {...register(`researchers.${index}.id_number`, { required: isMain })}
          />
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>College</Form.Label>
            <Form.Select
              disabled={(sameCollege && !isMain) || (!enabled && !isMain)}
              {...register(`researchers.${index}.college`)}
            >
              <option value="">Select College</option>
              <option value="college-1">College 1</option>
              <option value="college-2">College 2</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex align-items-end">
          {isMain && (
            <Form.Check
              type="checkbox"
              label="Same College to all co-authors"
              {...register("sameCollege")}
            />
          )}
        </Col>
      </Row>

      <Row className="g-3 mt-0">
        <Col md={4}>
          <TextInputCustom
            label="First Name"
            type="text"
            required={isMain}
            disabled={!enabled && !isMain}
            {...register(`researchers.${index}.first_name`, { required: isMain })}
          />
        </Col>
        <Col md={4}>
          <TextInputCustom
            label="Last Name"
            type="text"
            required={isMain}
            disabled={!enabled && !isMain}
            {...register(`researchers.${index}.last_name`, { required: isMain })}
          />
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Department</Form.Label>
            <Form.Select
              disabled={(sameDept && !isMain) || (!enabled && !isMain)}
              {...register(`researchers.${index}.dept`)}
            >
              <option value="">Select Department</option>
              <option value="dept-1">Department 1</option>
              <option value="dept-2">Department 2</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {isMain && (
        <Row className="mt-2">
          <Col md={4} />
          <Col md={4} />
          <Col md={4}>
            <Form.Check
              type="checkbox"
              label="Same Department to all co-authors"
              {...register("sameDept")}
            />
          </Col>
        </Row>
      )}

      <Row className="g-3 mt-0">
        <Col md={4}>
          <TextInputCustom
            label="Mobile No."
            type="text"
            required={isMain}
            disabled={!enabled && !isMain}
            {...register(`researchers.${index}.mobile_number`, { required: isMain })}
          />
        </Col>
        <Col md={4}>
          <TextInputCustom
            label="Email"
            type="email"
            required={isMain}
            disabled={!enabled && !isMain}
            {...register(`researchers.${index}.email`, { required: isMain })}
          />
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
  const toRoman = (num) => {
    const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
    return romans[num - 1] || num;
  };
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
    },
  });

  const documentDescriptions = {
    "Letter of Intent": "This application must be submitted together with the letter of intent to apply for research funding addressed to the CRD Executive Director, endorsed and signed by the College Research Coordinator, Department Chair and the College Dean.",
    "Research Proposal": "Full proposal should be submitted together with this form which includes Background of the Study, Review of Related Literature and Methodology.",
    "Researcher/s Curriculum Vitae (CV)": "A copy of the Researcher/s Curriculum Vitae (CV) should also be submitted. The content of the CV must include the list of previous research done by the researcher, incorporating his/her thesis or dissertation topic/study.",
    "Initial Review and Screening": "All researches will undergo initial review and screening prior to approval.",
    "Ethics Review": "Proposals with human participants must undergo Ethics Review by the UERC.",
    "Gantt Chart": "Activities related to project implementation. Exclude proposal preparation.",
    "Detailed Budget Breakdown": "Must have high-probability of estimation accuracy of project expenses."
  };


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
            status: '',
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
      <Form onSubmit={handleSubmit(onSubmit)} className="form">
        {step === 1 && (
          <>
            <FormCard>
              <TextInputCustom label="Title" type="text" {...register('title', { required: true })} />
            </FormCard>

            <FormCard>
              <h5 className="fw-bold mb-3">I. Protocol’s 5-point Research Agenda Category</h5>
              {categories.map(item => (
                <Form.Check
                  key={item.id}
                  label={item.research_name}
                  type="checkbox"
                  {...register('category')}
                  value={item.id}
                />
              ))}
            </FormCard>

            <FormCard>
              <h5 className="fw-bold mb-3">II. Purpose of Submission</h5>
              <Form.Check label="Initial" type="radio" value={1} {...register('purpose_id')} defaultChecked />
              <Form.Check label="Resubmission" type="radio" value={2} {...register('purpose_id')} />
              <TextInputCustom label="Version Number" type="text" {...register('version_number')} />
            </FormCard>

            <FormCard>
              <h5 className="fw-bold mb-3">III. Investigators</h5>
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

            <div className="d-flex justify-content-end mt-4">
              <Button variant="primary" onClick={() => setStep(2)}>Next</Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <FormCard>
              <h5 className="fw-bold mb-3">IV. Research Duration</h5>
              <TextInputCustom label="Duration (semesters)" type="text" {...register('research_duration')} />
            </FormCard>

            <FormCard>
              <h5 className="fw-bold mb-3">V. Ethical Considerations</h5>
              <Form.Check label="With Human Participants" type="checkbox" {...register('ethical_considerations')} />
            </FormCard>

            <FormCard>
              <h5 className="fw-bold mb-3">VI. Submission</h5>
              <TextInputCustom label="Submitted by" type="text" {...register('submitted_by')} />
              <TextInputCustom label="Submission Date" type="date" {...register('submitted_date')} />
            </FormCard>

            <FormCard>
              <h5 className="fw-bold mb-3">VII. Endorsement</h5>
              {representative.map((item, index) => (
                <Row key={item.id} className="g-3 mb-2">
                  <input
                    type="hidden"
                    {...register(`endorsements.${index}.endorsement_rep_id`)}
                    value={item.id}
                  />

                  <Col>
                    <TextInputCustom
                      label={item.rep_name}
                      type="text"
                      placeholder=""
                      {...register(`endorsements.${index}.endorsement_rep_name`)}
                    />
                  </Col>

                  <Col>
                    <TextInputCustom
                      label="Status"
                      type="text"
                      placeholder="Not yet endorsed"
                      {...register(`endorsements.${index}.status`)}
                    />
                  </Col>
                </Row>
              ))}
            </FormCard>

            <FormCard>
              <h5 className="fw-bold mb-3">VII. Endorsement</h5>
              {documentTypes.map((doc, index) => (
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
                    </>
                  )}
                </div>
              ))}
            </FormCard>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="outline-secondary" onClick={() => setStep(1)} className="me-2">Back</Button>
              <Button variant="primary" type="submit">Submit</Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}

export default ApplicationForm;
