import React, { useEffect, useState } from "react";
import { Table, Nav, Badge, Row, Col, Card } from "react-bootstrap";
import Auth from "../../../api/Auth";
import ResearchApplicationAPI from "../../../api/ResearchApplicationAPI";
import SearchBar from "../../../components/Search/SearchBar";
import { FaFilePdf, FaFileCsv } from "react-icons/fa";
import Tooltip from "../../../components/Tooltip/Tooltip";
import Pagination from "../../../components/PaginationComponent/Pagination";
import { useHistory } from "react-router-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// ✅ CHART ONLY (no UI interference)
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
  const [status, setStatus] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const userID = localStorage.getItem("id");

  // ✅ CHART DATA
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
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 30 },
    },
  };

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

  useEffect(() => {
    fetchResearches();
    fetchStatus();
  }, []);

  const filteredResearches = researches.filter((item) => {
    const userEndorsement = item.Endorsements?.find(
      (e) => e.endorsement_rep_id.toString() === userID
    );
    const statusID = userEndorsement?.status_id;

    switch (activeTab) {
      case "new":
        return statusID === 4 || statusID === undefined || statusID === null;
      case "revised":
        return statusID === 5;
      case "endorsed":
        return statusID === 6;
      default:
        return true;
    }
  });

  const sortedResearches = [...filteredResearches].sort(
    (a, b) => new Date(b.submitted_date) - new Date(a.submitted_date)
  );

  const searchedResearches = sortedResearches.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submitted_by?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = searchedResearches.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const displayedResearches = searchedResearches.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const exportToCSV = () => {
    const headers = ["Research Title", "Lead Researcher Name", "Research Status"];
    const rows = searchedResearches.map((item) => {
      const userEndorsement = item.Endorsements?.find(
        (e) => e.endorsement_rep_id.toString() === userID
      );
      const userStatus = userEndorsement?.StatusTable?.status || "Not Reviewed";
      return [item.title, item.submitted_by, userStatus];
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
      const userEndorsement = item.Endorsements?.find(
        (e) => e.endorsement_rep_id.toString() === userID
      );
      const userStatus = userEndorsement?.StatusTable?.status || "Not Reviewed";
      return [item.title, item.submitted_by, userStatus];
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
      {/* <div className="research-container">
        <div className="title">CRD Pre-screening </div>
        <div className="mb-4 p-3" style={{ background: "#f8f9fa", borderRadius: "60px" }}>
          <h5 className="text-center fw-bold">
            Endorsed (from the College Dean) New Research Application
          </h5>
          <div className="text-center mb-3">SY 2024 - 2025</div>

          <Row>
            <Col md={9}>
              <Bar data={chartData} options={chartOptions} />
            </Col>

            <Col md={3}>
              {chartData.labels.map((label, i) => (
                <div key={i} className="d-flex align-items-center mb-1">
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: chartData.datasets[0].backgroundColor[i],
                      marginRight: 8,
                    }}
                  />
                  <small>
                    {label} ({chartData.datasets[0].data[i]})
                  </small>
                </div>
              ))}
            </Col>
          </Row>
        </div>
      </div> */}

      {/* 🔒 YOUR ORIGINAL UI BELOW — UNTOUCHED */}
      <div className="research-container">
        <div className="title">New Research Application Review</div>

        <div className="search-div">
          <SearchBar
            placeholder="(Type to search Research Title, Research Name)"
            onSearch={(value) => {
              setSearchTerm(value);
              setPage(1);
            }}
          />
          <Tooltip text="Export to PDF" position="bottom">
            <FaFilePdf
              size={30}
              className="cursor-pointer"
              color="white"
              onClick={exportToPDF}
            />
          </Tooltip>
          <Tooltip text="Export to CSV" position="bottom">
            <FaFileCsv
              size={30}
              className="cursor-pointer"
              color="white"
              onClick={exportToCSV}
            />
          </Tooltip>
        </div>

        <Nav className="mt-4 research-tabs" variant="underline" activeKey={activeTab}>
          {["all", "new", "revised", "endorsed"].map((tab) => (
            <Nav.Item key={tab}>
              <Nav.Link
                eventKey={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        <div className="table-div">
          <Table striped bordered hover variant="light" responsive>
            <thead>
              <tr>
                <th style={{ width: "55%", textAlign: "center" }}>Research Title</th>
                <th style={{ width: "25%", textAlign: "center" }}>Lead Researcher Name</th>
                <th style={{ width: "20%", textAlign: "center" }}>Research Status</th>
              </tr>
            </thead>
            <tbody className="cursor-pointer">
              {displayedResearches.map((item) => {
                const userEndorsement = item.Endorsements?.find(
                  (e) => e.endorsement_rep_id.toString() === userID
                );
                const userStatusID = userEndorsement?.status_id;
                const userStatus = userEndorsement?.StatusTable?.status;

                return (
                  <tr
                    key={item.id}
                    onClick={() => history.push(`/review-form/${item.id}`)}
                  >
                    <td>{item.title}</td>
                    <td>{item.submitted_by}</td>
                    <td style={{ textAlign: "center" }}>
                      <Badge
                        pill
                        bg={
                          userStatusID === 6
                            ? "success"
                            : userStatusID === 4
                              ? "danger"
                              : userStatusID === 5
                                ? "warning"
                                : "secondary"
                        }
                      >
                        {userStatus || "Not Reviewed"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

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