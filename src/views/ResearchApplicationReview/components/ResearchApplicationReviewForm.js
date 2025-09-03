import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import FormCard from '../../../components/Card/FormCard';
import TextInputCustom from '../../../components/Input/TextInputCustom';
import OutlineButton from '../../../components/Buttons/OutlineButton';
import ConfirmationButton from '../../../components/Buttons/ConfirmationButton';
import MainContainer from '../../../components/Layout/MainContainer';
import CustomModal from '../../../components/Modal/CustomModal';
import { RxQuestionMarkCircled } from "react-icons/rx";

export function ResearcherSection({ index, isMain, control, register, watch, setValue }) {
  const numberLabel = isMain ? 'Researcher 1 (Main Author)' : `Researcher ${index + 1} (Co-author)`;

  const enabled = isMain ? true : watch(`researchers.${index}.enabled`);
  const sameCollege = watch('sameCollege');
  const sameDept = watch('sameDept');
  const mainCollege = watch('researchers.0.college');
  const mainDept = watch('researchers.0.dept');

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
              {...register('sameCollege')}
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
              {...register('sameDept')}
            />
          )}
        </Col>
      </Row>
    </div>
  );
}

function ApplicationForm() {
  const [step, setStep] = useState(1);
  const [proceedStep, setProceedStep] = useState(1)
  const [confirmationModal, setConfirmationModal] = useState(false)
  const { control, handleSubmit, register, setValue, watch } = useForm({
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

  console.log({ confirmationModal })

  const documentDescriptions = {
    'Letter of Intent': 'This application must be submitted together with the letter of intent...',
    'Research Proposal': 'Full proposal should be submitted together with this form...',
    'Researcher/s Curriculum Vitae (CV)': 'A copy of the Researcher/s Curriculum Vitae (CV)...',
    'Initial Review and Screening': 'All researches will undergo initial review...',
    'Ethics Review': 'Proposals with human participants must undergo Ethics Review...',
    'Gantt Chart': 'Activities related to project implementation...',
    'Detailed Budget Breakdown': 'Must have high-probability of estimation accuracy...',
  };

  const categories = [
    { id: 1, research_name: 'Category 1' },
    { id: 2, research_name: 'Category 2' },
  ];

  const representative = [
    { id: 1, rep_name: 'Coordinator' },
    { id: 2, rep_name: 'Dean' },
  ];

  const documentTypes = [
    { id: 1, document_name: 'Letter of Intent' },
    { id: 2, document_name: 'Research Proposal' },
    { id: 3, document_name: 'Researcher/s Curriculum Vitae (CV)' },
    { id: 4, document_name: 'Initial Review and Screening' },
    { id: 5, document_name: 'Ethics Review' },
    { id: 6, document_name: 'Gantt Chart' },
    { id: 7, document_name: 'Detailed Budget Breakdown' },
  ];

  const toRoman = (num) => {
    const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
    return romans[num - 1] || num;
  };

  const onSubmit = (data) => {
    console.log('Form Data:', data);
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
          {proceedStep === 1 ?
            `Are you sure you want to endorse this research “Research Title” to the department's chairperson?` :
            `The research "Research Title" is endorsed to the department's chairperson `
          }
        </div>
      </div>
      <div className="center gap-5 mt-2"><ConfirmationButton
        label={proceedStep === 1 ? "Cancel" : "Ok"}
        onProceed={() => {setConfirmationModal(false); setProceedStep(1)}}
      />
        {proceedStep === 1 &&
          <OutlineButton label="Yes" onCancel={() => setProceedStep(2)} />}
      </div>
    </CustomModal>
  )

  return (
    <MainContainer>
      <div className="application-form">
        <div className="form-container">
          <h1 className="mt-5 mb-5 fw-bold text-white">New Research Application Review</h1>
          <Form className="form" onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <>
                <FormCard className="flex-container">
                  <Form.Label className="title me-3">Title</Form.Label>
                  <Form.Control as="textarea" rows={4} {...register('title', { required: true })} />
                </FormCard>

                <FormCard>
                  <h5 className="title">I. Protocol’s 5-point Research Agenda Category</h5>
                  <div className="content-checkbox">
                    {categories.map((item) => (
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
                  <Row className="px-4">
                    <Col>
                      <Row>
                        <Col>
                          <Form.Check
                            label="Initial"
                            type="radio"
                            value={1}
                            {...register('purpose_id')}
                            defaultChecked
                          />
                        </Col>
                        <Col>
                          <Form.Check
                            label="Resubmission"
                            type="radio"
                            value={2}
                            {...register('purpose_id')}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col className="flex-container mt--6">
                      <Form.Label className="mb-0 form-labels">Version Number</Form.Label>
                      <Form.Control type="text" {...register('version_number')} />
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
                    {...register('research_duration')}
                  />
                </FormCard>

                <FormCard>
                  <h5 className="fw-bold mb-3">V. Ethical Considerations</h5>
                  <Form.Check
                    label="With Human Participants"
                    isForm={true}
                    type="checkbox"
                    {...register('ethical_considerations')}
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
                        {...register('submitted_by')}
                      />
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
                          {...register(`endorsements.${index}.endorsement_rep_name`)}
                        />
                      </Col>

                      <Col>
                        <TextInputCustom
                          isForm={true}
                          label="Status"
                          type="text"
                          placeholder="Not yet endorsed"
                          {...register(`endorsements.${index}.status`)}
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
                      {[
                        'Letter of Intent',
                        'Research Proposal',
                        'Researcher/s Curriculum Vitae (CV)',
                        'Gantt Chart',
                        'Detailed Budget Breakdown',
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
                          </>
                        )}
                    </div>
                  </FormCard>
                ))}

                <div>
                  <Form.Check
                    type="checkbox"
                    label="Remarks"
                    className='mb-3 mt-5 text-white'
                  />
                  <FormCard className="bg-ccit">
                    <Form.Control
                      as="textarea"
                      placeholder='Type in your comments/suggestions.'
                      rows={8}
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
                <OutlineButton label="Save as Draft" />
                <ConfirmationButton label="Next" onProceed={() => setStep(2)} />
              </>
            ) : (
              <>
                <OutlineButton label="Back" onCancel={() => setStep(1)} />
                <OutlineButton label="Save as Draft" />
                <Button className="btn-confirmation-custom" variant="primary" type="submit">
                  Submit
                </Button>
                <OutlineButton label="Endorse" onCancel={() => setConfirmationModal(true)} />
              </>
            )}
          </div>
        </div>
      </div>
      {confirmationModal && endorsementConfirmation()}
    </MainContainer>
  );
}

export default ApplicationForm;
