import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import FormCard from '../../../components/Card/FormCard';
import TextInputCustom from '../../../components/Input/TextInputCustom';

const researchAgenda = [
  'Productivity and Competitiveness in Business and Education',
  'Advancement of Science and Technology',
  'Integrative Development Approaches in Social Science, Humanities and Communication',
  'Community Health and the Effective Delivery of Health Care',
  'Environmental Conservation and Preservation',
];

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
              {/* …add your real options here */}
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
  return (
    <div className="application-form">
      <Form className="form">
        <FormCard>
          <TextInputCustom label="Title" type="text" className="mb-4" />
        </FormCard>

        <FormCard>
          <h5 className="fw-bold mb-3">
            I. Protocol’s 5-point Research Agenda Category
            <small className="ms-1 fst-italic">
              (check at least one)
            </small>
          </h5>
          {researchAgenda.map((item, idx) => (
            <Form.Check
              key={idx}
              id={`agenda-${idx}`}
              type="checkbox"
              label={item}
              className="mb-1"
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
              />
            </Col>
            <Col md={3}>
              <Form.Check
                id="purpose-resubmission"
                name="purpose"
                type="radio"
                label="Resubmission"
              />
            </Col>
            <Col md={6}>
              <TextInputCustom
                label="Version Number"
                type="text"
                placeholder="e.g., v1.0"
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
      </Form>
    </div>
  );
}

export default ApplicationForm;
