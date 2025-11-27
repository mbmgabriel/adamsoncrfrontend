import React, { useEffect, useState } from "react";
import { Table, Nav, Badge } from "react-bootstrap";
import Auth from "../../../api/Auth";
import ResearchApplicationAPI from "../../../api/ResearchApplicationAPI";
import SearchBar from "../../../components/Search/SearchBar";
import { FaFilePdf, FaFileCsv } from "react-icons/fa";
import Tooltip from "../../../components/Tooltip/Tooltip";
import Pagination from "../../../components/PaginationComponent/Pagination";
import { useHistory } from "react-router-dom";

function ReviewTable() {
  const history = useHistory();
  const [researches, setResearches] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // NEW
  const userID = localStorage.getItem("id");

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

  useEffect(() => {
    fetchResearches();
    fetchStatus();
  }, []);

  // -----------------------
  // 🔥 FILTERING BY TAB
  // -----------------------
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
        return true; // all
    }
  });

  // -----------------------
  // 🔥 PAGINATION ON FILTERED RESULTS
  // -----------------------
  const displayedResearches = filteredResearches.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalItems = filteredResearches.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="research-table">
      <div className="research-container">
        <div className="title">New Research Application Review</div>
        <div className="search-div">
          <SearchBar placeholder="(Type to search Research Title, Research Name)" />
          <Tooltip text="Export to PDF" position="bottom">
            <FaFilePdf size={30} className="cursor-pointer" color="white" />
          </Tooltip>
          <Tooltip text="Export to CSV" position="bottom">
            <FaFileCsv size={30} className="cursor-pointer" color="white" />
          </Tooltip>
        </div>

        {/* -----------------------
            🔥 WORKING TABS
        ------------------------ */}
        <Nav className="mt-4 research-tabs" variant="underline" activeKey={activeTab}>
          <Nav.Item>
            <Nav.Link eventKey="all" onClick={() => { setActiveTab("all"); setPage(1); }}>
              All
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="new" onClick={() => { setActiveTab("new"); setPage(1); }}>
              New
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="revised"
              onClick={() => { setActiveTab("revised"); setPage(1); }}
            >
              Revised
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="endorsed"
              onClick={() => { setActiveTab("endorsed"); setPage(1); }}
            >
              Endorsed
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <div className="table-div">
          <Table striped bordered hover variant="light" responsive>
            <thead>
              <tr>
                <th style={{ width: "55%", textAlign: "center" }}>
                  Research Title
                </th>
                <th style={{ width: "25%", textAlign: "center" }}>
                  Lead Researcher Name
                </th>
                <th style={{ width: "20%", textAlign: "center" }}>
                  Research Status
                </th>
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

          {/* PAGINATION */}
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
