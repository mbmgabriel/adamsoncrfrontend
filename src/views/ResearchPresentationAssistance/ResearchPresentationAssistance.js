import React, { useState } from "react";
import MainContainer from "../../components/Layout/MainContainer";
import AdamsonSeal from "../../assets/image/adamson_logo.png";
import ApplicationHistory from "../../components/ApplicationHistory/ApplicationHistory";
import { FiArrowLeft } from "react-icons/fi";

const proofRequirements = [
  "Notice of Acceptance to Paper Presentation and Publication",
  "Copy of abstract of accepted paper",
  "Copy of Conference Program (if available)",
  "A brief description of how the faculty member plans to manage the classes to be missed while on official business.",
  "For conferences outside Metro Manila, an itinerary that includes the program of activities, arrival and departure dates, and the presenter's return date in their work at the university.",
];

function AssistanceField({ label, name, type = "text", multiline = false, rowClass = "" }) {
  return (
    <div className={`assistance-request__table-row ${rowClass}`} role="row">
      <label htmlFor={name}>{label}</label>
      <div role="cell">
        {multiline || type === "text" ? (
          <textarea aria-label={label} id={name} rows={multiline ? 3 : 1} />
        ) : (
          <input aria-label={label} id={name} type={type} />
        )}
      </div>
    </div>
  );
}

function ResearchPresentationAssistance() {
  const [showForm, setShowForm] = useState(false);

  return (
    <MainContainer>
      {showForm ? (
        <main className="assistance-request" aria-labelledby="assistance-request-title">
          <div className="application-history__form-navigation">
            <button type="button" onClick={() => setShowForm(false)}>
              <FiArrowLeft aria-hidden="true" />
              Back to past applications
            </button>
          </div>
          <form className="assistance-request__sheet">
            <header className="assistance-request__header">
              <div className="assistance-request__brand">
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

            <h1 id="assistance-request-title">
              RESEARCH PAPER PRESENTATION REQUEST FOR ASSISTANCE FORM
            </h1>

            <div className="assistance-request__table" role="table" aria-label="Research paper presentation request for assistance">
              <div className="assistance-request__table-row assistance-request__table-row--header" role="row">
                <div role="columnheader">APPLICANT PROFILE/<br />INFORMATION</div>
                <div role="columnheader">DETAILS</div>
              </div>

              <AssistanceField label="Name of Presenter:" name="presenterName" rowClass="assistance-request__table-row--medium" />
              <AssistanceField label="Email Address:" name="email" type="email" />
              <AssistanceField label="Contact Number:" name="contactNumber" type="tel" rowClass="assistance-request__table-row--medium" />
              <AssistanceField label="Title of Conference and Contact Information:" name="conferenceInformation" multiline rowClass="assistance-request__table-row--large" />
              <AssistanceField label="Title of the Research Paper:" name="researchPaperTitle" multiline rowClass="assistance-request__table-row--large" />
              <AssistanceField label="Website/Internet Link of Conference:" name="conferenceWebsite" type="url" />
              <AssistanceField label="Date of Acceptance:" name="acceptanceDate" type="date" />
              <AssistanceField label="Date of Conference:" name="conferenceDate" type="date" />

              <div className="assistance-request__table-row assistance-request__table-row--proof" role="row">
                <div className="assistance-request__proof-label" role="cell">Proof of:</div>
                <div className="assistance-request__proof-items" role="cell">
                  {proofRequirements.map((proof, index) => (
                    <div className="assistance-request__proof-item" key={proof}>
                      <label>
                        <span className="assistance-request__proof-letter">{String.fromCharCode(97 + index)})</span>
                        <input aria-label={`${String.fromCharCode(97 + index)}) ${proof}`} type="checkbox" />
                        <span>{proof}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </main>
      ) : (
        <ApplicationHistory
          title="Research Presentation Assistance"
          description="View your previous requests or begin a new request for research paper presentation assistance."
          emptyMessage="New requests will appear here after they are submitted."
          onCreate={() => setShowForm(true)}
        />
      )}
    </MainContainer>
  );
}

export default ResearchPresentationAssistance;
