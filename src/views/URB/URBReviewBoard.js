import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import MainContainer from "../../components/Layout/MainContainer";
import FormCard from "../../components/Card/FormCard";
import TextInputCustom from "../../components/Input/TextInputCustom";
import OutlineButton from "../../components/Buttons/OutlineButton";
import ConfirmationButton from "../../components/Buttons/ConfirmationButton";

const researchers = [
  "Researcher 1 (Main Author)",
  "Researcher 2 (Co-author)",
  "Researcher 3 (Co-author)",
];

const reviewers = Array.from({ length: 6 }, (_, index) => ({
  id: `urb-reviewer-${index + 1}`,
  label: `URB Reviewer ${index + 1}`,
  optional: index >= 3,
}));

function BlankField({ label }) {
  return (
    <TextInputCustom
      label={label}
      type="text"
      isForm={true}
      disabled={true}
      value=""
      readOnly
    />
  );
}

function ResearcherDetails({ label }) {
  return (
    <div className="urb-person-section">
      <p className="urb-person-title">{label}</p>
      <Row className="urb-fields-row">
        <Col sm={12} lg={6}>
          <BlankField label="ID Number" />
          <BlankField label="Name" />
          <BlankField label="Email" />
        </Col>
        <Col sm={12} lg={6}>
          <BlankField label="College" />
          <BlankField label="Department" />
        </Col>
      </Row>
    </div>
  );
}

function ReviewerAssignment({ reviewer }) {
  return (
    <div className="urb-reviewer-section">
      <div className="urb-reviewer-heading">
        {reviewer.optional && (
          <Form.Check type="checkbox" id={`${reviewer.id}-enabled`} />
        )}
        <span>{reviewer.label}</span>
      </div>

      <Row className="urb-fields-row">
        <Col sm={12} lg={6}>
          <BlankField label="Name" />
          <BlankField label="Position" />
        </Col>
        <Col sm={12} lg={6}>
          <BlankField label="Type" />
          <BlankField label="Department/ Office" />
        </Col>
      </Row>
    </div>
  );
}

function URBReviewBoard() {
  const history = useHistory();

  return (
    <MainContainer activeHeader={"Home"}>
      <div className="application-form urb-review-board">
        <div className="form-container">
          <h1 className="urb-page-title text-white">
            New Research Application URB Review
          </h1>

          <p className="urb-section-label text-white">Research Details</p>
          <FormCard className="urb-card urb-research-card">
            <div className="urb-title-row">
              <Form.Label className="urb-title-label">Title</Form.Label>
              <Form.Control
                as="textarea"
                rows={1}
                className="urb-title-control"
                disabled={true}
                value=""
                readOnly
              />
            </div>

            <div className="urb-investigators">
              <p className="urb-group-title">Investigators</p>
              {researchers.map((researcher) => (
                <ResearcherDetails key={researcher} label={researcher} />
              ))}
            </div>
          </FormCard>

          <p className="urb-section-label text-white">
            University Review Board (URB) Assignment
          </p>
          <FormCard className="urb-card urb-assignment-card">
            {reviewers.map((reviewer) => (
              <ReviewerAssignment key={reviewer.label} reviewer={reviewer} />
            ))}
          </FormCard>

          <div className="urb-actions">
            <OutlineButton label="Cancel" onCancel={() => history.goBack()} />
            <ConfirmationButton label="Assign" />
          </div>
        </div>
      </div>
    </MainContainer>
  );
}

export default URBReviewBoard;
