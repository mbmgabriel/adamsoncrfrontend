import React, { useEffect, useState } from "react";
import Auth from "../../api/Auth";
import ResearchApplicationAPI from "../../api/ResearchApplicationAPI";
import ResearchModal from "./modal/ResearchModal";
import SearchBar from "../../components/Search/SearchBar";
import { FaFilePdf, FaFileCsv } from "react-icons/fa";
import { MdOutlineInventory2 } from "react-icons/md";
import Pagination from "../../components/PaginationComponent/Pagination";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatDisplayName } from "../../utils/formatName";

function ResearchTable() {
  const [researches, setResearches] = useState([]);
  const [status, setStatus] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const pageSize = 10;

  const fetchResearches = async () => {
    const response = await new Auth().fetchResearches();
    if (response.ok) setResearches(response.data);
    else console.error(response.error);
  };

  const fetchStatus = async () => {
    const response = await new ResearchApplicationAPI().fetchStatus();
    if (response.ok) setStatus(response.data?.StatusTables);
    else console.log(response.data);
  };

  const fetchResearchById = async (id) => {
    const response = await new ResearchApplicationAPI().fetchResearchById(id);
    if (response.ok) setSelectedResearch(response.data.Research);
    else console.error(response.errorMessage);
  };

  useEffect(() => {
    fetchResearches();
    fetchStatus();
  }, []);

  const handleViewResearch = (id) => {
    setSelectedResearch(undefined);
    setShowModal(true);
    fetchResearchById(id);
  };

  const filteredResearches = researches
    .filter((r) => {
      if (activeTab === "All") return true;

      const statusObj = status?.find((s) => s.id === r.status_id);
      if (!statusObj) return false;
      return statusObj.status === activeTab;
    })
    .filter((r) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        r.title?.toLowerCase().includes(term) ||
        formatDisplayName(r.submitted_by).toLowerCase().includes(term)
      );
    });

  const totalItems = filteredResearches.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const displayedResearches = [...filteredResearches]
    .reverse()
    .slice((page - 1) * pageSize, page * pageSize);

  const getStatusName = (item) =>
    status?.find((statusItem) => statusItem.id === item.status_id)?.status || "Unknown";

  const getStatusTone = (statusID) => {
    if (statusID === 1) return "pending";
    if (statusID === 2) return "success";
    if (statusID === 3) return "danger";
    return "neutral";
  };

  const formatDate = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";

    return new Intl.DateTimeFormat("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const tabs = [
    { key: "All", label: "All" },
    { key: "For Approval", label: "For Approval" },
    { key: "On-going", label: "Ongoing" },
    { key: "Completed", label: "Completed" },
  ];

  const getTabCount = (tabKey) => {
    if (tabKey === "All") return researches.length;
    return researches.filter((item) => getStatusName(item) === tabKey).length;
  };

  const exportToCSV = () => {
    const headers = ["Research Title", "Lead Researcher Name", "Research Status"];
    const rows = filteredResearches.map((r) => {
      const statusName = status?.find((s) => s.id === r.status_id)?.status || "Unknown";
      return [r.title, formatDisplayName(r.submitted_by), statusName];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "researches.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Research Title", "Lead Researcher Name", "Research Status"];
    const tableRows = filteredResearches.map((r) => {
      const statusName = status?.find((s) => s.id === r.status_id)?.status || "Unknown";
      return [r.title, formatDisplayName(r.submitted_by), statusName];
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("researches.pdf");
  };

  return (
    <div className="research-table">
      <div className="research-container">
        <div className="research-page-header">
          <div>
            <div className="research-eyebrow">Proposal registry</div>
            <h1 className="title">Research Proposals</h1>
          </div>
          <div className="research-result-count" aria-live="polite">
            {totalItems} {totalItems === 1 ? "proposal" : "proposals"}
          </div>
        </div>

        <div className="research-toolbar">
          <SearchBar
            placeholder="Search by title or researcher"
            onSearch={(value) => {
              setSearchTerm(value);
              setPage(1);
            }}
          />
          <div className="research-export-actions" aria-label="Export options">
            <button type="button" className="research-export-button" onClick={exportToPDF}>
              <FaFilePdf aria-hidden="true" />
              <span>PDF</span>
            </button>
            <button type="button" className="research-export-button" onClick={exportToCSV}>
              <FaFileCsv aria-hidden="true" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        <div className="research-tabs" role="tablist" aria-label="Research status">
          {tabs.map((tab) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`nav-link${activeTab === tab.key ? " active" : ""}`}
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
            >
              {tab.label}
              <span className="research-tab-count">{getTabCount(tab.key)}</span>
            </button>
          ))}
        </div>

        <div className="table-div">
          <div className="research-table-scroll">
            <table className="research-data-table">
              <thead>
                <tr>
                  <th className="research-title-column">Research title</th>
                  <th>Lead researcher</th>
                  <th>Submitted</th>
                  <th>Research status</th>
                </tr>
              </thead>
              <tbody>
                {displayedResearches.map((item) => (
                  <tr
                    key={item.id}
                    data-clickable="true"
                    role="button"
                    tabIndex="0"
                    aria-haspopup="dialog"
                    aria-label={`View ${item.title}`}
                    onClick={() => handleViewResearch(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleViewResearch(item.id);
                      }
                    }}
                  >
                    <td data-label="Research title">
                      <span className="research-title-button">{item.title}</span>
                    </td>
                    <td data-label="Lead researcher">
                      {formatDisplayName(item.submitted_by) || "Not available"}
                    </td>
                    <td data-label="Submitted" className="research-date">{formatDate(item.submitted_date)}</td>
                    <td data-label="Status">
                      <span className={`research-status research-status--${getStatusTone(item.status_id)}`}>
                        {getStatusName(item)}
                      </span>
                    </td>
                  </tr>
                ))}
                {displayedResearches.length === 0 && (
                  <tr className="research-empty-row">
                    <td colSpan="4">
                      <div className="research-empty-state">
                        <MdOutlineInventory2 aria-hidden="true" />
                        <strong>No proposals found</strong>
                        <span>Try another search or status.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        </div>

        <ResearchModal
          showModal={showModal}
          handleClose={() => {
            setShowModal(false);
            setSelectedResearch(undefined);
          }}
          research={selectedResearch}
        />
      </div>
    </div>
  );
}

export default ResearchTable;
