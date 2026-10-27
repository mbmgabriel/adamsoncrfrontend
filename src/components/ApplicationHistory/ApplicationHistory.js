import usePagination from "../../hooks/usePagination";
import Pagination from "../PaginationComponent/Pagination";
import React from "react";
import Loader from '../Loader/Loader';
import { FiArrowLeft, FiFileText, FiPlus, FiPrinter } from "react-icons/fi";

const getStatusTone = (status) => {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  if (/rejected|declined|disapproved/.test(normalizedStatus)) return "rejected";
  if (normalizedStatus.includes("approved")) return "approved";
  return "ongoing";
};

function ApplicationHistory({
  applications = [],
  description,
  emptyMessage,
  emptyTitle = "No past applications yet",
  errorMessage,
  isLoading = false,
  nameColumnLabel,
  nameColumnField,
  onCreate,
  onBack,
  onRetry,
  onSelect,
  onPrint,
  canPrint = () => false,
  showApplicationId = true,
  showCreate = true,
  tableDescription = "Review the applications you have previously submitted.",
  tableTitle = "Past applications",
  title,
}) {
  const { displayedItems, ...pagination } = usePagination(applications);
  const showNameColumn = Boolean(nameColumnLabel && nameColumnField);
  const columnCount = 3 + Number(showApplicationId) + Number(showNameColumn) + Number(Boolean(onPrint));

  return (
    <main className="application-history" aria-labelledby="application-history-title">
      <section className="application-history__container">
        {onBack && (
          <button
            className="application-history__back-button"
            onClick={onBack}
            type="button"
          >
            <FiArrowLeft aria-hidden="true" />
            Back to dashboard
          </button>
        )}

        <header className="application-history__header">
          <div>
            <span className="application-history__eyebrow">Application history</span>
            <h1 id="application-history-title">{title}</h1>
            <p>{description}</p>
          </div>

          {showCreate && (
            <button
              className="application-history__create-button"
              onClick={onCreate}
              type="button"
            >
              <FiPlus aria-hidden="true" />
              New Application
            </button>
          )}
        </header>

        <div className="application-history__table-card">
          {!isLoading && errorMessage && applications.length > 0 && (
            <div className="application-history__empty-state" role="alert">
              <span>{errorMessage}</span>
              {onRetry && <button onClick={onRetry} type="button">Try again</button>}
            </div>
          )}
          <div className="application-history__table-heading">
            <div>
              <h2>{tableTitle}</h2>
              <p>{tableDescription}</p>
            </div>
            <span aria-live="polite">
              {applications.length} {applications.length === 1 ? "application" : "applications"}
            </span>
          </div>

          <div className="application-history__table-scroll">
            <table>
              <thead>
                <tr>
                  {showApplicationId && <th className="application-history__id-column">ID</th>}
                  <th className="application-history__title-column">Research title</th>
                  {showNameColumn && <th className="application-history__name-column">{nameColumnLabel}</th>}
                  <th>Date submitted</th>
                  <th>Status</th>
                  {onPrint && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((application) => (
                  <tr
                    aria-label={onSelect ? `View application ${application.id}` : undefined}
                    className={onSelect ? "application-history__selectable-row" : undefined}
                    key={application.id}
                    onClick={onSelect ? () => onSelect(application) : undefined}
                    onKeyDown={onSelect ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        if (event.target !== event.currentTarget) return;
                        event.preventDefault();
                        onSelect(application);
                      }
                    } : undefined}
                    tabIndex={onSelect ? 0 : undefined}
                  >
                    {showApplicationId && <td className="application-history__id-column" data-label="ID">{application.id}</td>}
                    <td data-label="Research title">
                      <span className="application-history__cell-text application-history__cell-text--title" title={application.title}>
                        {application.title}
                      </span>
                    </td>
                    {showNameColumn && (
                      <td data-label={nameColumnLabel}>
                        <span className="application-history__cell-text application-history__cell-text--name" title={application[nameColumnField]?.trim()}>
                          {application[nameColumnField]?.trim() || "—"}
                        </span>
                      </td>
                    )}
                    <td data-label="Date submitted">{application.submittedDate}</td>
                    <td data-label="Status">
                      <span className={`application-history__status application-history__status--${getStatusTone(application.status)}`}>
                        {application.status}
                      </span>
                    </td>
                    {onPrint && (
                      <td data-label="Actions">
                          <button className="application-history__print-button" type="button"
                            disabled={!canPrint(application)}
                            title={canPrint(application) ? "Print approved form" : "Printing is available after approval"}
                            aria-label={`Print form for ${application.title}`}
                            onClick={(event) => { event.stopPropagation(); onPrint(application); }}>
                            <FiPrinter aria-hidden="true" /> Print
                          </button>
                      </td>
                    )}
                  </tr>
                ))}

                {isLoading && (
                  <tr className="application-history__empty-row">
                    <td colSpan={columnCount}>
                      <div className="application-history__empty-state">
                        <Loader label="Loading applications…" />
                        <span>Please wait while your requests are retrieved.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {!isLoading && errorMessage && applications.length === 0 && (
                  <tr className="application-history__empty-row">
                    <td colSpan={columnCount}>
                      <div className="application-history__empty-state" role="alert">
                        <FiFileText aria-hidden="true" />
                        <strong>Applications could not be loaded</strong>
                        <span>{errorMessage}</span>
                        {onRetry && (
                          <button onClick={onRetry} type="button">
                            Try again
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}

                {!isLoading && !errorMessage && applications.length === 0 && (
                  <tr className="application-history__empty-row">
                    <td colSpan={columnCount}>
                      <div className="application-history__empty-state">
                        <FiFileText aria-hidden="true" />
                        <strong>{emptyTitle}</strong>
                        <span>{emptyMessage}</span>
                        {showCreate && (
                          <button onClick={onCreate} type="button">
                            <FiPlus aria-hidden="true" />
                            Create your first application
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="application-history__pagination"><Pagination currentPage={pagination.page} onPageChange={pagination.setPage} {...pagination} /></div>
        </div>
      </section>
    </main>
  );
}

export default ApplicationHistory;
