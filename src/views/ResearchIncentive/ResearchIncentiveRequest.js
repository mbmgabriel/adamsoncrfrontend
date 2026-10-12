import React, { useState } from "react";
import MainContainer from "../../components/Layout/MainContainer";
import AdamsonSeal from "../../assets/image/adamson_logo.png";
import ApplicationHistory from "../../components/ApplicationHistory/ApplicationHistory";
import { FiArrowLeft } from "react-icons/fi";

const incentiveTypes = [
  "Publication Incentive",
  "Citation Incentive",
  "H-index incentive",
];

const attachments = [
  "Internet Link /Hyperlink (for online access)",
  "Link to Google Scholar Account",
  "Electronic Copy (for soft copy submission)",
  "Photocopy of Article /Book (for hard copy submission)",
];

const peerReviewProof = [
  "Evaluation of Peer Reviewers",
  "Communication with Editor",
  "Corrections Made",
];

function StaticField({ label, multiline = false, rowClass = "" }) {
  return (
    <div className={`publication-incentive__row ${rowClass}`} role="row">
      <label>{label}</label>
      <div role="cell">
        <textarea aria-label={label} rows={multiline ? 3 : 1} />
      </div>
    </div>
  );
}

function CheckboxList({ items, label }) {
  return (
    <div className="publication-incentive__checkbox-list" aria-label={label}>
      {items.map((item) => (
        <label key={item}>
          <input type="checkbox" />
          <span>{item}</span>
        </label>
      ))}
    </div>
  );
}

function ResearchIncentiveRequest() {
  const [showForm, setShowForm] = useState(false);

  return (
    <MainContainer>
      {showForm ? (
        <main className="publication-incentive" aria-labelledby="publication-incentive-title">
          <div className="application-history__form-navigation">
            <button type="button" onClick={() => setShowForm(false)}>
              <FiArrowLeft aria-hidden="true" />
              Back to past applications
            </button>
          </div>
          <form className="publication-incentive__sheet">
            <header className="publication-incentive__header">
              <div className="publication-incentive__brand">
                <img src={AdamsonSeal} alt="Adamson University" />
                <span>ADAMSON<br />UNIVERSITY</span>
              </div>
              <address>
                <strong>Center for Research and Development</strong><br />
                900 San Marcelino Street, Manila<br />
                1000 Manila, Philippines<br />
                Office No. (02) 8525-0604/ (+632)-524-2011 Loc. 153
              </address>
            </header>

            <h1 id="publication-incentive-title">RESEARCH PUBLICATION, CITATION, AND H-INDEX INCENTIVE FORM</h1>

            <div className="publication-incentive__table" role="table" aria-label="Research publication, citation, and H-index incentive form">
              <div className="publication-incentive__row publication-incentive__row--header" role="row">
                <div role="columnheader">AUTHOR PROFILE/<br />INFORMATION</div>
                <div role="columnheader">DETAILS</div>
              </div>

              <StaticField label="Name of Author/s:" rowClass="publication-incentive__row--medium" />
              <StaticField label="Email Address of the Author/s:" />
              <StaticField label="Contact Number of the Author/s:" rowClass="publication-incentive__row--medium" />

              <div className="publication-incentive__row publication-incentive__row--incentive" role="row">
                <label>Incentive Type and Category<br />(Please mark appropriate):</label>
                <div role="cell"><CheckboxList items={incentiveTypes} label="Incentive type and category" /></div>
              </div>

              <StaticField label="Date of Submission" />
              <StaticField label="Name and Contact Information of Publisher/" rowClass="publication-incentive__row--medium" multiline />
              <StaticField label="Title of the Research Work/ Published Article/Book:" rowClass="publication-incentive__row--large" multiline />
              <StaticField label="Date of Publication:" rowClass="publication-incentive__row--large" />
              <StaticField label="Date of Citation (If" />
              <StaticField label="No. of Citation:" />
              <StaticField label="ISBN/ISSN/DOI:" />

              <div className="publication-incentive__row publication-incentive__row--attachments" role="row">
                <label>Attachments (Attach all that apply):</label>
                <div role="cell"><CheckboxList items={attachments} label="Attachments" /></div>
              </div>

              <div className="publication-incentive__row publication-incentive__row--peer-review" role="row">
                <div role="cell">
                  <strong>Proof of Peer-Review</strong>
                  <p>Proof of Peer Review<br />(Required for Publication Incentive; Optional for Citation/H-index Incentive)</p>
                </div>
                <div role="cell"><CheckboxList items={peerReviewProof} label="Proof of peer review" /></div>
              </div>
            </div>
          </form>
        </main>
      ) : (
        <ApplicationHistory
          title="Research Incentive Requests"
          description="View your previous incentive requests or submit a new publication, citation, or H-index application."
          emptyMessage="New incentive requests will appear here after they are submitted."
          onCreate={() => setShowForm(true)}
        />
      )}
    </MainContainer>
  );
}

export default ResearchIncentiveRequest;
