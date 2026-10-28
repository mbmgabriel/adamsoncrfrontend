import React from "react";
import MainContainer from "../../components/Layout/MainContainer";
import CardCustom from "../../components/Card/CardCustom";
import {
  MdAssignmentAdd,
  MdCoPresent,
  MdMenuBook,
  MdOutlineRateReview,
  MdOutlineScience,
  MdOutlineChecklist,
} from "react-icons/md";
import { FaFileCircleCheck } from "react-icons/fa6";
import { FaChalkboardTeacher } from "react-icons/fa";
import { HiGiftTop, HiUserGroup } from "react-icons/hi2";
import Notifications from "../../components/Notifications/NotificationFeed";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import ReviewStatusChart from "../../components/DashboardCharts/ReviewStatusChart";
import ResearchProposalsChart from "../../components/DashboardCharts/ResearchProposalsChart";
import PresentedResearchChart from "../../components/DashboardCharts/PresentedResearchChart";
import PublishedResearchChart from "../../components/DashboardCharts/PublishedResearchChart";

import { useSiteContent } from '../../context/SiteContentContext';
import SiteAnnouncements from '../../components/SiteContent/SiteAnnouncements';

function Dashboard() {
  const announcements = useSiteContent().filter(row => row.kind === 'announcement');
  const history = useHistory();
  const role_id = localStorage.getItem("role_id");
  const roleName = (localStorage.getItem("role") || "").toLowerCase();
  const isResearcherRole = roleName.includes("researcher");
  const isApprovalRole = ["coordinator", "chairperson", "department chair", "dean"]
    .some((role) => roleName.includes(role));
  const isUrbRole = ["university review board", "urb reviewer", "urb member"]
    .some((role) => roleName.includes(role)) || roleName === "urb";
  const isCrdRole = role_id === "6" || role_id === "8" ||
    ["crd staff", "director", "executive director"].some((role) => roleName.includes(role));
  const isCrdDirectorRole = roleName.includes("director");
  const defaultCardContent = [
    {
      icon: <MdAssignmentAdd />,
      title: "Write your new research proposals.",
      footer: "New Research Application",
      path: "/new-research-application",
    },
    {
      icon: <FaFileCircleCheck />,
      title: "Have your completed research cleared.",
      footer: "Revised Research Proposals",
      path: "/research-application-review",
    },
    {
      icon: <FaChalkboardTeacher />,
      title: "Ask Research Presentation Assistance.",
      footer: "Research Paper Presentation Request for Assistance Application",
      path: "/research-presentation-assistance",
    },
    {
      icon: <HiGiftTop />,
      title: "Request assistance for your research paper presentation.",
      footer: "Request for Incentive Form",
      path: "/research-incentive-request",
      isVisible: role_id !== "6" && role_id !== "8",
    },
    {
      icon: <HiUserGroup />,
      title: "View Research Review Board",
      footer: "Research Review Board",
      path: "/urb-review",
      isVisible: role_id === "6" || role_id === "8",
    },
  ];

  const approvalCardContent = [
    {
      icon: <FaFileCircleCheck />,
      title: "View new research proposals.",
      footer: "New Research Applications",
      path: "/research-application-review",
    },
    {
      icon: <MdOutlineRateReview />,
      title: "Recheck submitted revised proposals.",
      footer: "Revised Research Proposals",
      path: "/research-application-review",
    },
    {
      icon: <MdOutlineScience />,
      title: "View research proposal application status.",
      footer: "Research Application Status",
      path: "/research",
    },
    {
      icon: <MdMenuBook />,
      title: "View presented and/or published researches.",
      footer: "Presented/Published Researches",
      isVisible: false, // Temporarily hidden while under development.
      onClick: () => toast.info("Research presentation and publication is under development."),
    },
  ];

  const crdCardContent = [
    {
      icon: <FaFileCircleCheck />,
      title: "View endorsed research proposals.",
      footer: "New Research Applications",
      path: "/research-application-review",
    },
    {
      icon: <MdOutlineScience />,
      title: "View research status.",
      footer: "Research Status",
      path: "/research",
    },
    {
      icon: <MdCoPresent />,
      title: "View presented and/or published researches.",
      footer: "Presented/Published Researches",
      isVisible: false, // Temporarily hidden while under development.
      onClick: () => toast.info("Research presentation and publication is under development."),
    },
    {
      icon: <HiUserGroup />,
      title: "View Research Review Board.",
      footer: "Research Review Board",
      path: "/urb-review",
      isVisible: role_id === "6" || roleName.includes("crd staff"),
    },
    {
      icon: <FaChalkboardTeacher />,
      title: "Review submitted presentation assistance requests.",
      footer: "Presentation Assistance Requests for Approval",
      path: "/research-presentation-assistance-review",
      isVisible: isCrdDirectorRole,
    },
    {
      icon: <HiGiftTop />,
      title: "Review submitted incentive applications.",
      footer: "Incentive Applications for Approval",
      path: "/research-incentive-review",
      isVisible: isCrdDirectorRole,
    },
  ];

  const urbCardContent = [
    {
      icon: <FaFileCircleCheck />,
      title: "View new research proposals for review.",
      footer: "New Research Applications",
      path: "/research-application-review",
    },
    {
      icon: <MdOutlineRateReview />,
      title: "View all reviewed proposals.",
      footer: "Reviewed Research Proposals",
      path: "/research-application-review",
    },
  ];

  const cardContent = isUrbRole
    ? urbCardContent
    : isCrdRole
      ? crdCardContent
      : isApprovalRole
        ? approvalCardContent
        : defaultCardContent;

  const quickActions = cardContent.filter(item => item.isVisible !== false);
  if ([2, 6, 7].includes(Number(role_id))) {
    quickActions.splice(2, 0, {
      icon: <MdOutlineChecklist />,
      title: "Track approved research, requirements, and project progress.",
      footer: "Project monitoring",
      path: "/project-monitoring",
    });
  }

  const analyticsSummary = [
    { label: "Applications reviewed", value: 35, icon: <MdOutlineRateReview /> },
    { label: "Research proposals", value: 60, icon: <MdOutlineScience /> },
    { label: "Presented research", value: 11, icon: <MdCoPresent /> },
    { label: "Published research", value: 17, icon: <MdMenuBook /> },
  ];

  return (
    <MainContainer activeHeader={"Home"}>
      <div className="home">
        <SiteAnnouncements announcements={announcements} />
        <section className="dashboard-actions">
          <div className="dashboard-section-heading">
            <span>Workspace</span>
            <h2>Quick actions</h2>
          </div>
          <div className="card-holder">
            {quickActions.map((item, index) => (
              <CardCustom
                key={index}
                icon={item.icon}
                title={item.title}
                footer={item.footer}
                path={item.onClick || (() => history.push(item.path))}
                isVisible={item.isVisible ?? true}
              />
            ))}
          </div>
        </section>
        <div className="center notification-holder">
          <Notifications />
        </div>
        {!isResearcherRole && roleName !== "administrator" && (
          <section className="graph-containers dashboard-analytics">
            <div className="dashboard-analytics-header">
              <div>
                <div className="dashboard-analytics-eyebrow">Analytics overview</div>
                <h2>Research activity</h2>
              </div>
              <div className="dashboard-analytics-date">Updated Jan 28, 2024</div>
            </div>

            <div className="dashboard-kpi-grid">
              {analyticsSummary.map((item) => (
                <div className="dashboard-kpi" key={item.label}>
                  <span className="dashboard-kpi-icon" aria-hidden="true">{item.icon}</span>
                  <div>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="dashboard-chart-grid">
              <ReviewStatusChart />
              <ResearchProposalsChart />
              <PresentedResearchChart />
              <PublishedResearchChart />
            </div>
          </section>
        )}
      </div>
    </MainContainer>
  );
}

export default Dashboard;
