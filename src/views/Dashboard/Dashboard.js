import React from "react";
import MainContainer from "../../components/Layout/MainContainer";
import CardCustom from "../../components/Card/CardCustom";
import { MdAssignmentAdd } from "react-icons/md";
import { FaFileCircleCheck } from "react-icons/fa6";
import { FaChalkboardTeacher } from "react-icons/fa";
import { HiGiftTop } from "react-icons/hi2";
import Notifications from "./component/Notifications";
import { useHistory } from "react-router-dom";
import ReviewStatusChart from "../../components/DashboardCharts/ReviewStatusChart";
import ResearchProposalsChart from "../../components/DashboardCharts/ResearchProposalsChart";
import PresentedResearchChart from "../../components/DashboardCharts/PresentedResearchChart";
import PublishedResearchChart from "../../components/DashboardCharts/PublishedResearchChart";

function Dashboard() {
  const history = useHistory();

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
      path: "/new-research-application",
    },
    {
      icon: <HiGiftTop />,
      title: "Receive Research Incentives",
      footer: "New Research Application",
      path: "/new-research-application",
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

  return (
    <MainContainer activeHeader={"Home"}>
      <div className="home">
        <div className="card-holder">
          {cardContent.map((item) => (
            <CardCustom
              icon={item.icon}
              title={item.title}
              footer={item.footer}
              path={() => history.push(item.path)}
            />
          ))}
        </div>
        <div className="center notification-holder">
          <Notifications item={notificationsData} />
        </div>
        <div className="graph-containers container-fluid mt-4">
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <ReviewStatusChart />
            </div>

            <div className="col-12 col-lg-6">
              <ResearchProposalsChart />
            </div>

            <div className="col-12 col-lg-6">
              <PresentedResearchChart />
            </div>

            <div className="col-12 col-lg-6">
              <PublishedResearchChart />
            </div>
          </div>
        </div>
      </div>
    </MainContainer>
  );
}

export default Dashboard;
