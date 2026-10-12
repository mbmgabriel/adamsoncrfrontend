import React from "react";
import { FiFileText, FiPlus } from "react-icons/fi";

function ApplicationHistory({
  applications = [],
  description,
  emptyMessage,
  onCreate,
  title,
}) {
  return (
    <main className="application-history" aria-labelledby="application-history-title">
      <section className="application-history__container">
        <header className="application-history__header">
          <div>
            <span className="application-history__eyebrow">Application history</span>
            <h1 id="application-history-title">{title}</h1>
            <p>{description}</p>
          </div>

          <button
            className="application-history__create-button"
            onClick={onCreate}
            type="button"
          >
            <FiPlus aria-hidden="true" />
            New Application
          </button>
        </header>

        <div className="application-history__table-card">
          <div className="application-history__table-heading">
            <div>
              <h2>Past applications</h2>
              <p>Review the applications you have previously submitted.</p>
            </div>
            <span aria-live="polite">
              {applications.length} {applications.length === 1 ? "application" : "applications"}
            </span>
          </div>

          <div className="application-history__table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Research title</th>
                  <th>Date submitted</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td data-label="Application ID">{application.id}</td>
                    <td data-label="Research title">{application.title}</td>
                    <td data-label="Date submitted">{application.submittedDate}</td>
                    <td data-label="Status">
                      <span className="application-history__status">
                        {application.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {applications.length === 0 && (
                  <tr className="application-history__empty-row">
                    <td colSpan="4">
                      <div className="application-history__empty-state">
                        <FiFileText aria-hidden="true" />
                        <strong>No past applications yet</strong>
                        <span>{emptyMessage}</span>
                        <button onClick={onCreate} type="button">
                          <FiPlus aria-hidden="true" />
                          Create your first application
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ApplicationHistory;
