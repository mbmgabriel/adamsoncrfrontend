import usePagination from "../../../hooks/usePagination";
import Pagination from "../../../components/PaginationComponent/Pagination";
import React from "react";
import { Modal, Button, Tab, Tabs, Table, Badge, Spinner } from "react-bootstrap";
import { FaExternalLinkAlt } from "react-icons/fa";
import { BASE_URL } from "../../../constants/url";
import { formatDisplayName } from "../../../utils/formatName";

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const getPersonName = (person) => {
  if (!person) return "";
  if (typeof person === "string") return formatDisplayName(person);

  return (
    formatDisplayName(person.name) ||
    formatDisplayName(
      person.first_name,
      person.middle_name,
      person.last_name
    )
  );
};

const getRepresentativeName = (endorsement) => {
  const directName =
    endorsement.endorsement_rep_name ||
    endorsement.rep_name ||
    endorsement.representative_name;

  if (directName) return directName;

  const representative =
    endorsement.EndorsementRepresentative ||
    endorsement.endorsement_representative ||
    endorsement.Representative ||
    endorsement.representative ||
    endorsement.User ||
    endorsement.user;

  return (
    getPersonName(representative?.User) ||
    getPersonName(representative?.user) ||
    getPersonName(representative) ||
    "Not available"
  );
};

const getEndorsementStatus = (endorsement) =>
  endorsement.status || endorsement.StatusTable?.status || "Pending";

const isEndorsementComplete = (endorsement) =>
  [2, 6].includes(Number(endorsement.status_id)) ||
  ["endorsed", "approved", "completed"].includes(
    String(getEndorsementStatus(endorsement)).trim().toLowerCase()
  );

const getProgressState = (endorsement) => {
  if (isEndorsementComplete(endorsement)) return "complete";

  const status = String(getEndorsementStatus(endorsement)).trim().toLowerCase();
  if (
    Number(endorsement.status_id) === 5 ||
    status.includes("revis") ||
    status.includes("return")
  ) {
    return "revision";
  }

  return "pending";
};

const getDocumentUrl = (filePath) => {
  if (!filePath) return "";

  const normalizedPath = filePath.replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;

  return `${BASE_URL}/${normalizedPath.replace(/^\/+/, "")}`;
};

const EmptySection = ({ message }) => (
  <div className="research-detail-empty">{message}</div>
);

const ResearchModal = ({ showModal, handleClose, research }) => {
  const { displayedItems: investigators, ...pagination } = usePagination(research?.research_investigators || [], `${showModal}:${research?.id}`);
  return (
    <Modal
      show={showModal}
      onHide={handleClose}
      size="lg"
      centered
      scrollable
      dialogClassName="research-detail-modal"
      contentClassName="research-detail-content"
    >
      <Modal.Header closeButton className="research-detail-header">
        <div>
          <div className="research-detail-eyebrow">Proposal details</div>
          <Modal.Title>{research?.title || "Loading proposal"}</Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body className="research-detail-body">
        {!research ? (
          <div className="research-detail-loading" role="status">
            <Spinner animation="border" size="sm" />
            <span>Loading proposal details...</span>
          </div>
        ) : (
          <Tabs defaultActiveKey="general" className="research-detail-tabs" fill>
            <Tab eventKey="general" title="General info">
              <div className="research-detail-grid">
                <div className="research-detail-field">
                  <span>Submitted by</span>
                  <strong>
                    {formatDisplayName(research.submitted_by) || "Not available"}
                  </strong>
                </div>
                <div className="research-detail-field">
                  <span>Submitted date</span>
                  <strong>{formatDate(research.submitted_date)}</strong>
                </div>
                <div className="research-detail-field">
                  <span>Duration</span>
                  <strong>{research.research_duration || "Not available"}</strong>
                </div>
                <div className="research-detail-field">
                  <span>Purpose</span>
                  <strong>{research.purpose_id === 1 ? "Initial" : "Resubmission"}</strong>
                </div>
                <div className="research-detail-field research-detail-field--wide">
                  <span>Ethical considerations</span>
                  <strong>
                    {research.ethical_considerations
                      ? "With Human Participants"
                      : "Without Human Participants"}
                  </strong>
                </div>
              </div>
            </Tab>

            <Tab eventKey="categories" title="Categories">
              {research.category?.length ? (
                <div className="research-detail-tags">
                  {research.category.map((category) => (
                    <span key={category.id}>{category.research_name}</span>
                  ))}
                </div>
              ) : (
                <EmptySection message="No categories have been added." />
              )}
            </Tab>

            <Tab eventKey="endorsements" title="Endorsements">
              {research.endorsements?.length ? (
                <div className="research-endorsement-progress">
                  {(() => {
                    const completedCount = research.endorsements.filter(isEndorsementComplete).length;
                    const progress = Math.round(
                      (completedCount / research.endorsements.length) * 100
                    );

                    return (
                      <div className="research-endorsement-progress__summary">
                        <div className="research-endorsement-progress__summary-text">
                          <strong>Endorsement progress</strong>
                          <span>
                            {completedCount} of {research.endorsements.length} complete
                          </span>
                        </div>
                        <div
                          className="research-endorsement-progress__track"
                          role="progressbar"
                          aria-label="Endorsement completion"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={progress}
                        >
                          <span style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    );
                  })()}
                  <div className="research-endorsement-progress__list">
                    {research.endorsements.map((endorsement, index) => {
                      const representativeName = getRepresentativeName(endorsement);
                      const endorsementStatus = getEndorsementStatus(endorsement);
                      const progressState = getProgressState(endorsement);

                      return (
                        <div
                          className={`research-endorsement-progress__item is-${progressState}`}
                          key={`${representativeName}-${index}`}
                        >
                          <span
                            className="research-endorsement-progress__marker"
                            aria-hidden="true"
                          />
                          <div className="research-endorsement-progress__details">
                            <div className="research-endorsement-progress__person">
                              <strong>{representativeName}</strong>
                              <Badge
                                bg={
                                  progressState === "complete"
                                    ? "success"
                                    : progressState === "revision"
                                      ? "warning"
                                      : "secondary"
                                }
                              >
                                {endorsementStatus}
                              </Badge>
                            </div>
                            <div
                              className="research-endorsement-progress__item-track"
                              role="progressbar"
                              aria-label={`${representativeName} endorsement progress`}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={progressState === "complete" ? 100 : 0}
                            >
                              <span />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <EmptySection message="No endorsements are available." />
              )}
            </Tab>

            <Tab eventKey="investigators" title="Investigators">
              {research.research_investigators?.length ? (
                <div className="research-detail-table-wrap">
                  <Table responsive className="research-detail-table research-detail-table--wide">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Department</th>
                        <th>College</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investigators.map((investigator, index) => (
                        <tr key={`${investigator.id_number}-${index}`}>
                          <td>{investigator.id_number || "Not available"}</td>
                          <td>{investigator.name || "Not available"}</td>
                          <td>{investigator.email || "Not available"}</td>
                          <td>{investigator.mobile_number || "Not available"}</td>
                          <td>{investigator.dept || "Not available"}</td>
                          <td>{investigator.college || "Not available"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Pagination currentPage={pagination.page} onPageChange={pagination.setPage} {...pagination} />
                </div>
              ) : (
                <EmptySection message="No investigators are listed." />
              )}
            </Tab>

            <Tab eventKey="documents" title="Documents">
              {research.research_documents?.length ? (
                <div className="research-detail-documents">
                  {research.research_documents.map((document, index) => (
                    <a
                      href={getDocumentUrl(document.document_filepath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={`${document.document_name}-${index}`}
                    >
                      <span>{document.document_name || "Research document"}</span>
                      <FaExternalLinkAlt aria-hidden="true" />
                    </a>
                  ))}
                </div>
              ) : (
                <EmptySection message="No documents are attached." />
              )}
            </Tab>
          </Tabs>
        )}
      </Modal.Body>
      <Modal.Footer className="research-detail-footer">
        <Button variant="primary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResearchModal;
