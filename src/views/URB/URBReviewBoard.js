import React, { useEffect, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";
import MainContainer from "../../components/Layout/MainContainer";
import FormCard from "../../components/Card/FormCard";
import { FiArrowLeft, FiArrowRight, FiCheck, FiFileText, FiPlus, FiSearch, FiTrash2, FiUsers } from "react-icons/fi";
import "./urb-review.scss";
import DashboardBackButton from "../../components/Navigation/DashboardBackButton";
import ResearchApplicationAPI from "../../api/ResearchApplicationAPI";
import usePagination from "../../hooks/usePagination";
import Loader from '../../components/Loader/Loader';
import Pagination from "../../components/PaginationComponent/Pagination";
import Auth from "../../api/Auth";

const displayName = (person) => [person?.first_name, person?.middle_name, person?.last_name].filter(Boolean).join(" ");

export default function URBReviewBoard() {
  const history = useHistory();
  const location = useLocation();
  const id = new URLSearchParams(location.search).get("research_id");
  const [search, setSearch] = useState("");
  const [researches, setResearches] = useState([]);
  const [research, setResearch] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState(["", ""]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const isStaff = (localStorage.getItem("role") || "").toLowerCase().includes("crd staff") || Number(localStorage.getItem("role_id")) === 6;

  const isUrbMember = Number(localStorage.getItem("role_id")) === 8 || (localStorage.getItem("role") || "").toLowerCase().includes("university review board");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setBusy(true);
      setError("");
      try {
        if (!isStaff && !isUrbMember) throw new Error("URB assignments are available to CRD staff and assigned URB members.");
        const api = new ResearchApplicationAPI();
        if (!id) {
          const response = await new Auth().fetchResearches();
          if (!response.ok) throw new Error("Research applications could not be loaded.");
          if (active) setResearches(response.data);
        } else {
          const response = await api.fetchWorkflow(id);
          if (!response.ok) throw new Error(response.data?.message || "Research could not be loaded.");
          if (active) {
            setResearch(response.data.research);
            setWorkflow(response.data.workflow);
            const existing = response.data.workflow.assigned_urb.map((member) => String(member.user_id));
            setSelected(existing.length ? existing : ["", ""]);
          }
          if (isStaff) {
            const response = await api.fetchUrbMembers();
            if (!response.ok) throw new Error(response.data?.message || "URB members could not be loaded.");
            if (active) setMembers(response.data.members);
          }
        }
      } catch (error) { if (active) setError(error.message); }
      finally { if (active) setBusy(false); }
    };
    load();
    return () => { active = false; };
  }, [id, isStaff, isUrbMember]);

  const assign = async (event) => {
    event.preventDefault();
    setError("");
    const ids = selected.map(Number);
    if (ids.length < 2 || ids.some((value) => !value) || new Set(ids).size !== ids.length) {
      setError("Select at least two different URB members. Each reviewer slot must have a member.");
      return;
    }
    setBusy(true);
    try {
      const response = await new ResearchApplicationAPI().assignUrbMembers(id, ids);
      if (!response.ok) throw new Error(response.data?.message || "Reviewers could not be assigned.");
      history.push(`/review-form/${id}`);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  };

  const filtered = researches.filter(item => `${item.title || ""} ${item.submitted_by || ""}`.toLowerCase().includes(search.trim().toLowerCase()));
  const { displayedItems, ...pagination } = usePagination(filtered, `${id || "list"}:${search}`);
  const selectedCount = selected.filter(Boolean).length;

  return (
    <MainContainer activeHeader="Home">
      <main className="application-form urb-review-board">
        <div className="form-container">
          <div className="page-back-navigation">
            {id ? <button type="button" className="page-back-button" onClick={() => history.push("/urb-review")}><FiArrowLeft aria-hidden="true" /> Back to URB board</button> : <DashboardBackButton />}
          </div>
          <header className="urb-header">
            <div><span className="urb-eyebrow">University Review Board</span>
              <h1>{id ? "Manage URB reviewers" : isStaff ? "URB reviewer assignments" : "Assigned research"}</h1>
              <p>{id ? "Choose the board members who will review this research application." : isStaff ? "Select a research application to assign or manage its URB reviewers." : "Review the research applications assigned to your account."}</p>
            </div>
            <span className="urb-header-tag"><FiUsers /> {id ? `${selectedCount} selected` : `${researches.length} applications`}</span>
          </header>
          {error && <Alert variant="danger" role="alert">{error}</Alert>}
          {busy && <Loader />}
          {!isStaff && !isUrbMember ? null : !id ? (
            <FormCard className="urb-card urb-queue">
              <div className="urb-card-heading"><span className="urb-icon"><FiFileText /></span><div><h2>Research applications</h2><p>{isStaff ? "URB assignment is available after dean endorsement." : "Open an application to review its details and leave your decision."}</p></div></div>
              <div className="urb-search"><FiSearch aria-hidden="true" /><Form.Control aria-label="Search research applications" placeholder="Search by title or researcher" value={search} onChange={event => setSearch(event.target.value)} /></div>
              <div className="urb-list-caption"><span>Research title / Researcher</span><span>{filtered.length} results</span></div>
              {!busy && !filtered.length && <div className="urb-empty"><FiFileText /><h3>{search ? "No matching applications" : "No research applications yet"}</h3><p>{search ? "Try another title or researcher name." : "Applications will appear here when they are ready for review."}</p></div>}
              <div className="urb-research-list">{displayedItems.map(item => (
                <article className="urb-research-item" key={item.id}>
                  <div className="urb-list-icon"><FiFileText /></div><div className="urb-research-item-copy"><h3>{item.title}</h3><p>{item.submitted_by || "Research application"}{item.version_number ? ` · Version ${item.version_number}` : ""}</p></div>
                  <Button type="button" className="btn-outline-custom" onClick={() => history.push(isStaff ? `/urb-review?research_id=${item.id}` : `/review-form/${item.id}`)}>{isStaff ? "Manage reviewers" : "Review research"} <FiArrowRight /></Button>
                </article>
              ))}</div>
              <Pagination currentPage={pagination.page} onPageChange={pagination.setPage} {...pagination} />
            </FormCard>
          ) : research && (
            <>
              <FormCard className="urb-card urb-overview">
                <div className="urb-card-heading"><span className="urb-icon"><FiFileText /></span><div><h2>Research overview</h2><p>Application details for the assigned review board.</p></div><span className="urb-version">Version {research.version_number || "1"}</span></div>
                <h3 className="urb-research-title">{research.title}</h3>
                <div className="urb-investigator-list">{(research.ResearchInvestigators || []).map((person, index) => (
                  <div className="urb-investigator" key={person.id || index}>
                    <span className="urb-person-avatar"><FiUsers /></span><div><span className="urb-small-label">{index === 0 ? "Lead researcher" : `Co-author ${index}`}</span><h4>{displayName(person)}</h4><p>{[person.college, person.dept].filter(Boolean).join(" · ") || "Affiliation not provided"}</p><p>{person.email}</p></div>
                  </div>
                ))}{!research.ResearchInvestigators?.length && <p>{research.submitted_by || "No investigator details provided."}</p>}</div>
              </FormCard>
              {isStaff ? <Form onSubmit={assign}>
                <FormCard className="urb-card urb-assignment-card">
                  <div className="urb-card-heading"><span className="urb-icon"><FiUsers /></span><div><h2>Assign URB reviewers</h2><p>Select at least two members. You can add more reviewers as needed.</p></div><span className="urb-count">{selectedCount} selected</span></div>
                  <div className="urb-assignment-note"><FiCheck /><p>Saving records your CRD staff endorsement. All assigned URB members must approve before the director completes the research.</p></div>
                  {!workflow?.can_assign_urb && <Alert variant="info">{workflow?.stage === "completed" ? "This research is completed. Reviewer assignments are read only." : workflow?.stage === "revision_required" ? "The researcher is making revisions. Reviewer assignments are read only until resubmission." : "Assignments become available after coordinator, chairperson, and dean endorsements."}</Alert>}
                  <div className="urb-reviewer-grid">{selected.map((value, index) => {
                    const member = members.find(entry => String(entry.id) === value);
                    const approved = workflow?.assigned_urb.some(entry => String(entry.user_id) === value && entry.status_id === 6);
                    return <section className={`urb-reviewer-card${approved ? " is-approved" : ""}`} key={index}>
                      <div className="urb-reviewer-top"><span className="urb-reviewer-number">{index + 1}</span><h3>URB reviewer {index + 1}</h3>{approved && <span className="urb-approved"><FiCheck /> Approved</span>}{selected.length > 2 && <Button type="button" variant="link" className="urb-remove" aria-label={`Remove reviewer ${index + 1}`} disabled={approved || busy || !workflow?.can_assign_urb} onClick={() => setSelected(items => items.filter((_, position) => position !== index))}><FiTrash2 /></Button>}</div>
                      <Form.Label htmlFor={`urb-member-${index}`}>Board member <span aria-hidden="true">*</span></Form.Label>
                      <Form.Select id={`urb-member-${index}`} required disabled={approved || busy || !workflow?.can_assign_urb} value={value} onChange={event => setSelected(items => items.map((item, position) => position === index ? event.target.value : item))}>
                        <option value="">Choose a URB member</option>{members.map(entry => <option key={entry.id} value={entry.id} disabled={selected.some((item, position) => position !== index && item === String(entry.id))}>{displayName(entry)}</option>)}
                      </Form.Select>
                      <p className="urb-member-detail">{member ? (member.Department?.dept_name || member.Department?.dept_desc || "University Review Board") : "Member details appear after selection."}</p>
                      {approved && <p className="urb-lock-note">This member has approved and must remain assigned.</p>}
                    </section>;
                  })}</div>
                  <Button type="button" className="btn-outline-custom urb-add" disabled={busy || !workflow?.can_assign_urb || selected.length >= members.length} onClick={() => setSelected(items => [...items, ""])}><FiPlus /> Add reviewer</Button>
                  {members.length < 2 && <p className="text-danger mt-3">At least two active URB accounts are required.</p>}
                </FormCard>
                <div className="urb-actions"><Button type="button" className="btn-outline-custom" onClick={() => history.push(`/review-form/${id}`)}><FiArrowLeft /> Back to research</Button><Button type="submit" className="btn-confirmation-custom" disabled={busy || !workflow?.can_assign_urb || members.length < 2}>{busy ? "Saving…" : "Save reviewers"} <FiCheck /></Button></div>
              </Form> : <div className="urb-actions"><Button type="button" className="btn-confirmation-custom" onClick={() => history.push(`/review-form/${id}`)}>Review research <FiArrowRight /></Button></div>}
            </>
          )}
        </div>
      </main>
    </MainContainer>
  );
}
