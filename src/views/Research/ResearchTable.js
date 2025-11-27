import React, { useEffect, useState } from "react";
import { Table, Nav, Badge } from "react-bootstrap";
import Auth from "../../api/Auth";
import ResearchApplicationAPI from "../../api/ResearchApplicationAPI";
import ResearchModal from "./modal/ResearchModal";
import SearchBar from "../../components/Search/SearchBar";
import { FaFilePdf, FaFileCsv } from "react-icons/fa";
import Tooltip from "../../components/Tooltip/Tooltip";
import Pagination from "../../components/PaginationComponent/Pagination";

function ResearchTable() {
  const [researches, setResearches] = useState([]);
  const [status, setStatus] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All");

  const pageSize = 10;

  const fetchResearches = async () => {
    const response = await new Auth().fetchResearches();
    if (response.ok) {
      setResearches(response.data);
    } else {
      console.error(response.error);
    }
  };

  const fetchStatus = async () => {
    const response = await new ResearchApplicationAPI().fetchStatus();
    if (response.ok) {
      setStatus(response.data?.StatusTables);
    } else {
      console.log(response.data);
    }
  };

  const fetchResearchById = async (id) => {
    const response = await new ResearchApplicationAPI().fetchResearchById(id);
    if (response.ok) {
      setSelectedResearch(response.data.Research);
    } else {
      console.error(response.errorMessage);
    }
  };

  useEffect(() => {
    fetchResearches();
    fetchStatus();
  }, []);

  const destroyResearch = async (id) => {
    const response = await new ResearchApplicationAPI().destroyResearch(id);
    if (response.ok) {
      alert("Research Deleted");
      fetchResearches();
    } else {
      alert("Something went wrong");
    }
  };

  const handleViewResearch = (id) => {
    setShowModal(true);
    fetchResearchById(id);
  };

  // 🔥 FILTER BY STATUS ID
  const filteredResearches = researches.filter((r) => {
    if (activeTab === "All") return true;

    const statusObj = status.find((s) => s.id === r.status_id);
    if (!statusObj) return false;

    return statusObj.status === activeTab;
  });

  const totalItems = filteredResearches.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const displayedResearches = [...filteredResearches]
    .reverse()
    .slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="research-table">
      <div className="research-container">
        <div className="title">Research Proposals</div>

        <div className="search-div">
          <SearchBar placeholder="(Type to search Research Title, Research Name)" />
          <Tooltip text="Export to PDF" position="bottom">
            <FaFilePdf size={30} className="cursor-pointer" color="white" />
          </Tooltip>
          <Tooltip text="Export to CSV" position="bottom">
            <FaFileCsv size={30} className="cursor-pointer" color="white" />
          </Tooltip>
        </div>

        {/* 🔥 FIXED TABS TO MATCH BACKEND STATUS NAMES */}
        <Nav
          className="mt-4 research-tabs"
          variant="underline"
          activeKey={activeTab}
          onSelect={(selectedKey) => {
            setActiveTab(selectedKey);
            setPage(1);
          }}
        >
          <Nav.Item>
            <Nav.Link eventKey="All">All</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="For Approval">For Approval</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="On-going">Ongoing</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="Completed">Completed</Nav.Link>
          </Nav.Item>
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
            <tbody>
              {displayedResearches.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.submitted_by}</td>
                  <td style={{ textAlign: "center" }}>
                    <Badge
                      pill
                      bg={
                        item.status_id === 1
                          ? "warning"
                          : item.status_id === 2
                          ? "success"
                          : item.status_id === 3
                          ? "danger"
                          : "secondary"
                      }
                    >
                      {Array.isArray(status)
                        ? status.find((s) => s.id === item.status_id)?.status || "Unknown"
                        : "Unknown"}
                    </Badge>
                  </td>
                </tr>
              ))}
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

        <ResearchModal
          showModal={showModal}
          handleClose={() => setShowModal(false)}
          research={selectedResearch}
        />
      </div>
    </div>
  );
}

export default ResearchTable;
