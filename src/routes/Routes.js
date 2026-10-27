import React, { useEffect, useState } from "react";
import Loader from '../components/Loader/Loader';
import {
  BrowserRouter as Router,
  Switch
} from "react-router-dom";
import { NotificationProvider } from '../context/NotificationContext';
import Notifications from '../views/Notifications/Notifications';
import Dashboard from '../views/Dashboard/Dashboard'
import Login from "../views/Login";
import { AuthRoute } from "./components/AuthRoute";
import { PrivateRoute } from "./components/PrivateRoute";
import NewResearchApplication from "../views/ResearchApplication/NewResearchApplication";
import Research from "../views/Research/Research";
import ResearchApplicationReviewTable from "../views/ResearchApplicationReview/ResearchApplicationReviewTable"
import ResearchApplicationReviewForm from "../views/ResearchApplicationReview/components/ResearchApplicationReviewForm"
import URBReviewBoard from "../views/URB/URBReviewBoard";
import ResearchIncentiveRequest from "../views/ResearchIncentive/ResearchIncentiveRequest";
import ResearchIncentiveReview from "../views/ResearchIncentive/ResearchIncentiveReview";
import ResearchPresentationAssistance from "../views/ResearchPresentationAssistance/ResearchPresentationAssistance";
import ResearchPresentationAssistanceReview from "../views/ResearchPresentationAssistance/ResearchPresentationAssistanceReview";

import AdminPortal from '../views/Admin/AdminPortal';
import ContentPage from '../views/Content/ContentPage';
import { SiteContentProvider } from '../context/SiteContentContext';

export default function Routing() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    setLoading(false);
  }, []);

  if (loading) {
    return <div className="portal-loader-page"><Loader /></div>;
  }

  return (
    <div className="content">
      <Router>
        <SiteContentProvider><NotificationProvider>
        <Switch>
          <AuthRoute path='/' exact component={Login} />
          <PrivateRoute path='/admin' component={AdminPortal} />
          <PrivateRoute path='/faqs' exact component={ContentPage} />
          <PrivateRoute path='/about-crd' exact component={ContentPage} />
          <PrivateRoute path='/notifications' exact component={Notifications} />
          <PrivateRoute workspaceOnly path='/dashboard' exact component={Dashboard} />
          <PrivateRoute workspaceOnly path='/new-research-application' exact component={NewResearchApplication} />
          <PrivateRoute workspaceOnly path='/research-incentive-request' exact component={ResearchIncentiveRequest} />
          <PrivateRoute workspaceOnly path='/research-incentive-review' exact component={ResearchIncentiveReview} />
          <PrivateRoute workspaceOnly path='/research-presentation-assistance' exact component={ResearchPresentationAssistance} />
          <PrivateRoute workspaceOnly path='/research-presentation-assistance-review' exact component={ResearchPresentationAssistanceReview} />
          <PrivateRoute workspaceOnly path='/research' exact component={Research} />
          <PrivateRoute workspaceOnly path='/research-application-review' exact component={ResearchApplicationReviewTable} />
          <PrivateRoute workspaceOnly path='/review-form/:id' exact component={ResearchApplicationReviewForm} />
          <PrivateRoute workspaceOnly path='/urb-review' exact component={URBReviewBoard} />
        </Switch>
        </NotificationProvider></SiteContentProvider>
      </Router>
    </div>
  );
}
