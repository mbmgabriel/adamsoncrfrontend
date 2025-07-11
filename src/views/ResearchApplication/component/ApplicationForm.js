import React, { useEffect, useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import FormCard from '../../../components/Card/FormCard';
import TextInputCustom from '../../../components/Input/TextInputCustom';
import ResearchApplicationAPI from '../../../api/ResearchApplicationAPI';

function ResearcherSection({ index, isMain }) {
  const numberLabel = isMain ? 'Researcher 1 (Main Author)' : `Researcher ${index + 1} (Co - author)`;

  return (
    <div className="mb-4">
      {!isMain && (
        <Form.Check
          type="checkbox"
          id={`researcher-enable-${index}`}
          label={numberLabel}
          className="mb-2"
        />
      )}

      {isMain && <h6 className="fw-bold mb-3">{numberLabel}  <span className="text-danger">*</span> Required Fields</h6>}

      <Row className="g-3">
        <Col md={4}>
          <TextInputCustom label="ID Number" type="text" required={isMain} />
        </Col>

        <Col md={4}>
          <Form.Group controlId={`researcher-college-${index}`}>
            <Form.Label>College</Form.Label>
            <Form.Select>
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
              id="same-college"
              label="Same College to all co-authors"
            />
          )}
        </Col>
      </Row>

      <Row className="g-3 mt-0">
        <Col md={4}>
          <TextInputCustom label="First Name" type="text" required={isMain} />
        </Col>
        <Col md={4}>
          <TextInputCustom label="Last Name" type="text" required={isMain} />
        </Col>
        <Col md={4}>
          <Form.Group controlId={`researcher-dept-${index}`}>
            <Form.Label>Department</Form.Label>
            <Form.Select>
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
              id="same-dept"
              label="Same Department to all co-authors"
            />
          </Col>
        </Row>
      )}

      <Row className="g-3 mt-0">
        <Col md={4}>
          <TextInputCustom label="Mobile No." type="text" required={isMain} />
        </Col>
        <Col md={4}>
          <TextInputCustom label="Email" type="email" required={isMain} />
        </Col>
      </Row>
    </div>
  );
}

function ApplicationForm() {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([])
  const [title, setTitle] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [purposeId, setPurposeId] = useState(1);
  const [version, setVersion] = useState('');
  const [duration, setDuration] = useState('');
  const [ethical, setEthical] = useState(false);
  const [submittedBy, setSubmittedBy] = useState('');
  const [submittedDate, setSubmittedDate] = useState('');

  const fetchCategories = async () => {
    let response = await new ResearchApplicationAPI().fetchCategories()
    if (response.ok) {
      setCategories(response.data.ResearchCategory)
    } else {
      console.error(response.error)
    }
  }

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const createResearch = async () => {
    if (selectedCategories.length < 1) {
      alert('Please select at least one Research Agenda Category.');
      return;
    }

    const data = {
      title,
      category: selectedCategories.join(', '),
      purpose_id: purposeId,
      version_number: version,
      research_duration: duration,
      ethical_considerations: ethical ? 1 : 0,
      submitted_by: submittedBy,
      submitted_date: submittedDate
    };

    try {
      const response = await new ResearchApplicationAPI().createResearch(data);
      if (response.ok) {
        alert('Research submitted successfully.');
      } else {
        alert('Submission failed.');
      }
    } catch (error) {
      console.error('API error:', error);
      alert('An error occurred during submission.');
    }
  };

  const createResearchInvestigators = async () => {
    const data = {
      "research_id": 0,
      "id_number": "string",
      "first_name": "string",
      "middle_name": "string",
      "last_name": "string",
      "mobile_number": "string",
      "email": "string",
      "college": "string",
      "dept": "string"
    }

    try {
      const response = await new ResearchApplicationAPI().createResearchInvestigators(data)
      if (response.ok) {
        alert('Research submitted successfully.');
      } else {
        alert('Submission failed.');
      }
    } catch (error) {
      console.error('API error:', error);
      alert('An error occurred during submission.');
    }
  }

  useEffect(() => {
    fetchCategories()
  },[])

  return (
    <div className="application-form">
      <Form className="form">
        {step === 1 && (
          <>
            <FormCard>
              <TextInputCustom
                label="Title"
                type="text"
                className="mb-4"
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormCard>

            <FormCard>
              <h5 className="fw-bold mb-3">
                I. Protocol’s 5-point Research Agenda Category
                <small className="ms-1 fst-italic">(check at least one)</small>
              </h5>
              {categories?.map((item) => (
                <Form.Check
                  key={item.id}
                  id={`agenda-${item.id}`}
                  type="checkbox"
                  label={item.research_name}
                  className="mb-1"
                  checked={selectedCategories.includes(item.id)}
                  onChange={() => handleCategoryChange(item.id)}
                />
              ))}
            </FormCard>

            <FormCard>
              <h5 className="fw-bold mt-4 mb-3">II. Purpose of Submission</h5>
              <Row className="g-3">
                <Col md={3}>
                  <Form.Check
                    id="purpose-initial"
                    name="purpose"
                    type="radio"
                    label="Initial"
                    defaultChecked
                    onChange={() => setPurposeId(1)}
                  />
                </Col>
                <Col md={3}>
                  <Form.Check
                    id="purpose-resubmission"
                    name="purpose"
                    type="radio"
                    label="Resubmission"
                    onChange={() => setPurposeId(2)}
                  />
                </Col>
                <Col md={6}>
                  <TextInputCustom
                    label="Version Number"
                    type="text"
                    placeholder="e.g., v1.0"
                    onChange={(e) => setVersion(e.target.value)}
                  />
                </Col>
              </Row>
            </FormCard>

            <FormCard>
              <h5 className="fw-bold mt-4 mb-3">III. Investigators</h5>
              <ResearcherSection index={0} isMain />
              {[1, 2, 3, 4].map((i) => (
                <ResearcherSection key={i} index={i} isMain={false} />
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
              <TextInputCustom
                label="Research Duration (in semester)"
                type="text"
                onChange={(e) => setDuration(e.target.value)}
              />
            </FormCard>

            <FormCard>
              <h5 className="fw-bold mb-3">V. Ethical Considerations</h5>
              <Form.Check
                type="checkbox"
                id="ethics-human"
                label="with Human Participants"
                onChange={(e) => setEthical(e.target.checked)}
              />
            </FormCard>

            <FormCard>
              <h5 className="fw-bold mb-3">VI. Submission</h5>
              <Row className="g-3">
                <Col md={6}>
                  <TextInputCustom
                    label="Submitted by"
                    type="text"
                    onChange={(e) => setSubmittedBy(e.target.value)}
                  />
                </Col>
                <Col md={6}>
                  <TextInputCustom
                    label="Submission Date"
                    type="date"
                    onChange={(e) => setSubmittedDate(e.target.value)}
                  />
                </Col>
              </Row>
            </FormCard>

            <FormCard>
              <h5 className="fw-bold mb-3">VII. Endorsement</h5>
              <Row className="g-3">
                <Col md={4}>
                  <TextInputCustom label="College Research Coordinator" type="text" />
                  <Form.Text className="text-muted">Status: Not yet endorsed</Form.Text>
                </Col>
                <Col md={4}>
                  <TextInputCustom label="Department Chairperson" type="text" />
                  <Form.Text className="text-muted">Status: Not yet endorsed</Form.Text>
                </Col>
                <Col md={4}>
                  <TextInputCustom label="College Dean" type="text" />
                  <Form.Text className="text-muted">Status: Not yet endorsed</Form.Text>
                </Col>
              </Row>
            </FormCard>

            <FormCard>
              <h5 className="fw-bold mb-3">Notes:</h5>
              {[
                {
                  title: 'i. Letter of Intent',
                  desc: '...signed by the College Research Coordinator, Department Chair and the College Dean.',
                },
                {
                  title: 'ii. Research Proposal',
                  desc: '...includes Background of the Study, Review of Related Literature and Methodology.',
                },
                {
                  title: "iii. Researcher's Curriculum Vitae (CV)",
                  desc: '...list of previous research done by the researcher, incorporating thesis or dissertation topic/study.',
                },
                {
                  title: 'iv. Initial Review and Screening',
                  desc: 'All researches will undergo initial review and screening prior to approval.',
                },
                {
                  title: 'v. Ethics Review',
                  desc: 'Proposals with human participants must undergo Ethics Review by the UERC.',
                },
                {
                  title: 'vi. Gantt Chart',
                  desc: 'Activities related to project implementation. Exclude proposal preparation.',
                },
                {
                  title: 'vii. Detailed Budget Breakdown',
                  desc: 'Must have high-probability of estimation accuracy of project expenses.',
                },
              ].map((note, index) => (
                <div key={index} className="mb-4">
                  <p className="fw-bold mb-1">{note.title}</p>
                  <p className="mb-2">{note.desc}</p>
                  {index < 3 || index === 5 || index === 6 ? (
                    <Button variant="primary">Upload File</Button>
                  ) : null}
                </div>
              ))}
            </FormCard>

            <div className="d-flex justify-content-end mt-4">
              <div>
                <Button variant="outline-secondary" className="me-2" onClick={() => setStep(1)}>Cancel</Button>
                <Button variant="outline-primary" className="me-2">Save as Draft</Button>
                <Button variant="primary" onClick={createResearch}>Submit</Button>
              </div>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}

export default ApplicationForm;
