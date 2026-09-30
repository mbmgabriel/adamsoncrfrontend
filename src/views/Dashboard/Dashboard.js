import React from "react";
import MainContainer from "../../components/Layout/MainContainer";
import CardCustom from "../../components/Card/CardCustom";
import {
  MdAssignmentAdd,
  MdCoPresent,
  MdMenuBook,
  MdOutlineRateReview,
  MdOutlineScience,
} from "react-icons/md";
import { FaFileCircleCheck } from "react-icons/fa6";
import { FaChalkboardTeacher } from "react-icons/fa";
import { HiGiftTop, HiUserGroup } from "react-icons/hi2";
import Notifications from "./component/Notifications";
import { useHistory } from "react-router-dom";
import ReviewStatusChart from "../../components/DashboardCharts/ReviewStatusChart";
import ResearchProposalsChart from "../../components/DashboardCharts/ResearchProposalsChart";
import PresentedResearchChart from "../../components/DashboardCharts/PresentedResearchChart";
import PublishedResearchChart from "../../components/DashboardCharts/PublishedResearchChart";

function Dashboard() {
  const history = useHistory();
  const role_id = localStorage.getItem("role_id");

  const cardContent = [
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

  const notificationsData = [
    {
      date: "April 3, 2025",
      time: "10:30 PM",
      description:
        "A new remark on your applied new research proposal entitled “Research Title”.",
    },
    {
      date: "March 24, 2025",
      time: "1:56 PM",
      description: "The college dean has endorsed your new research proposal.",
    },
    {
      date: "March 23, 2025",
      time: "11:30 AM",
      description:
        "The department chairperson has endorsed your new research proposal.",
    },
    {
      date: "March 15, 2025",
      time: "9:00 AM",
      description:
        "The research coordinator has endorsed your new research proposal.",
    },
    {
      date: "April 3, 2025",
      time: "10:30 PM",
      description:
        "A new remark on your applied new research proposal entitled “Research Title”.",
    },
    {
      date: "March 24, 2025",
      time: "1:56 PM",
      description: "The college dean has endorsed your new research proposal.",
    },
    {
      date: "March 23, 2025",
      time: "11:30 AM",
      description:
        "The department chairperson has endorsed your new research proposal.",
    },
    {
      date: "March 15, 2025",
      time: "9:00 AM",
      description:
        "The research coordinator has endorsed your new research proposal.",
    },
  ];

  const analyticsSummary = [
    { label: "Applications reviewed", value: 35, icon: <MdOutlineRateReview /> },
    { label: "Research proposals", value: 60, icon: <MdOutlineScience /> },
    { label: "Presented research", value: 11, icon: <MdCoPresent /> },
    { label: "Published research", value: 17, icon: <MdMenuBook /> },
  ];

  return (
    <MainContainer activeHeader={"Home"}>
      <div className="home">
        <section className="dashboard-actions">
          <div className="dashboard-section-heading">
            <span>Workspace</span>
            <h2>Quick actions</h2>
          </div>
          <div className="card-holder">
            {cardContent.map((item, index) => (
              <CardCustom
                key={index}
                icon={item.icon}
                title={item.title}
                footer={item.footer}
                path={() => history.push(item.path)}
                isVisible={item.isVisible ?? true}
              />
            ))}
          </div>
        </section>
        <div className="center notification-holder">
          <Notifications item={notificationsData} />
        </div>
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
      </div>
    </MainContainer>
  );
}

export default Dashboard;
