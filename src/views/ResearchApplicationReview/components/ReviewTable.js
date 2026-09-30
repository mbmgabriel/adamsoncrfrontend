import React, { useEffect, useState } from "react";
import Auth from "../../../api/Auth";
import SearchBar from "../../../components/Search/SearchBar";
import { FaFilePdf, FaFileCsv } from "react-icons/fa";
import { MdOutlineRateReview } from "react-icons/md";
import Pagination from "../../../components/PaginationComponent/Pagination";
import { useHistory } from "react-router-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatDisplayName } from "../../../utils/formatName";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip, Legend);

function ReviewTable() {
  const history = useHistory();
  const [researches, setResearches] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const userID = localStorage.getItem("id");
  const roleID = localStorage.getItem("role_id");

  const chartData = {
    labels: ["CoA", "CBA", "CCIT", "CELA", "CoE", "CoL", "CoN", "CoP", "CoS", "GS", "SVST"],
    datasets: [
      {
        data: [20, 23, 26, 21, 23, 7, 11, 18, 24, 11, 7],
        backgroundColor: [
          "#a93226", "#f1c40f", "#0b6623", "#1f3a93", "#d35400",
          "#8e44ad", "#e67abf", "#6c5ce7", "#ff8c00", "#7bdc00", "#1e00ff"
        ],
        borderRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#52677d", font: { size: 11, weight: 600 } },
      },
      y: {
        beginAtZero: true,
        max: 30,
        border: { display: false },
        grid: { color: "#e4eaf0" },
        ticks: { color: "#718096", stepSize: 5 },
      },
    },
  };

  const fetchResearches = async () => {
    const response = await new Auth().fetchResearches();
    if (response.ok) setResearches(response.data);
    else console.error(response.error);
  };

  useEffect(() => {
    fetchResearches();
  }, []);

  const getUserEndorsement = (item) =>
    item.Endorsements?.find(
      (endorsement) => String(endorsement.endorsement_rep_id) === String(userID)
    );

  const matchesTab = (item, tabKey) => {
    const statusID = getUserEndorsement(item)?.status_id;

    if (tabKey === "new") return statusID === 4 || statusID == null;
    if (tabKey === "revised") return statusID === 5;
    if (tabKey === "endorsed") return statusID === 6;
    return true;
  };

  const filteredResearches = researches.filter((item) => matchesTab(item, activeTab));

  const sortedResearches = [...filteredResearches].sort(
    (a, b) => new Date(b.submitted_date) - new Date(a.submitted_date)
  );

  const searchedResearches = sortedResearches.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDisplayName(item.submitted_by)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const totalItems = searchedResearches.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const displayedResearches = searchedResearches.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const tabDefinitions = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "revised", label: "Revised" },
    { key: "endorsed", label: "Endorsed" },
  ];

  const getReviewStatus = (item) => getUserEndorsement(item)?.StatusTable?.status || "Not reviewed";

  const getReviewTone = (item) => {
    const statusID = getUserEndorsement(item)?.status_id;
    if (statusID === 6) return "success";
    if (statusID === 5) return "pending";
    if (statusID === 4) return "info";
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

  const exportToCSV = () => {
    const headers = ["Research Title", "Lead Researcher Name", "Research Status"];
    const rows = searchedResearches.map((item) => {
      return [
        item.title,
        formatDisplayName(item.submitted_by),
        getReviewStatus(item),
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "researches.csv";
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Research Title", "Lead Researcher Name", "Research Status"];
    const tableRows = searchedResearches.map((item) => {
      return [
        item.title,
        formatDisplayName(item.submitted_by),
        getReviewStatus(item),
      ];
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
      {(roleID === "6" || roleID === "8") && (
        <div className="research-analytics-panel">
          <div className="research-analytics-header">
            <div>
              <div className="research-eyebrow">CRD pre-screening</div>
              <h2>Endorsed new research applications</h2>
            </div>
            <span className="research-period">SY 2024-2025</span>
          </div>

          <div className="research-chart-grid">
            <div className="research-chart-canvas">
              <Bar data={chartData} options={chartOptions} />
            </div>

            <div className="research-chart-legend" aria-label="Applications by college">
              {chartData.labels.map((label, i) => (
                <div key={label} className="research-chart-legend-item">
                  <span
                    style={{
                      backgroundColor: chartData.datasets[0].backgroundColor[i],
                    }}
                  />
                  <span>{label}</span>
                  <strong>{chartData.datasets[0].data[i]}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="research-container">
        <div className="research-page-header">
          <div>
            <div className="research-eyebrow">Reviewer queue</div>
            <h1 className="title">Research Application Review</h1>
          </div>
          <div className="research-result-count" aria-live="polite">
            {totalItems} {totalItems === 1 ? "application" : "applications"}
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

        <div className="research-tabs" role="tablist" aria-label="Review status">
          {tabDefinitions.map((tab) => (
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
              <span className="research-tab-count">
                {researches.filter((item) => matchesTab(item, tab.key)).length}
              </span>
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
                  <th>Review status</th>
                </tr>
              </thead>
              <tbody>
                {displayedResearches.map((item) => {
                  return (
                    <tr
                      key={item.id}
                      data-clickable="true"
                      role="link"
                      tabIndex="0"
                      aria-label={`Review ${item.title}`}
                      onClick={() => history.push(`/review-form/${item.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          history.push(`/review-form/${item.id}`);
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
                        <span className={`research-status research-status--${getReviewTone(item)}`}>
                          {getReviewStatus(item)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {displayedResearches.length === 0 && (
                  <tr className="research-empty-row">
                    <td colSpan="4">
                      <div className="research-empty-state">
                        <MdOutlineRateReview aria-hidden="true" />
                        <strong>No applications found</strong>
                        <span>Try another search or review status.</span>
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
      </div>
    </div>
  );
}

export default ReviewTable;
