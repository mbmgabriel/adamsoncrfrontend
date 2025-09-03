import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Switch
} from "react-router-dom";
import Dashboard from '../views/Dashboard/Dashboard'
import Login from "../views/Login";
import { AuthRoute } from "./components/AuthRoute";
import { PrivateRoute } from "./components/PrivateRoute";
import NewResearchApplication from "../views/ResearchApplication/NewResearchApplication";
import Research from "../views/Research/Research";
import ResearchApplicationReviewTable from "../views/ResearchApplicationReview/ResearchApplicationReviewTable"
import ResearchApplicationReviewForm from "../views/ResearchApplicationReview/components/ResearchApplicationReviewForm"

export default function Routing() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    console.log({ token });
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="content">
      <Router>
        <Switch>
          <AuthRoute path='/' exact component={Login} />
          <PrivateRoute path='/dashboard' exact component={Dashboard} />
          <PrivateRoute path='/new-research-application' exact component={NewResearchApplication} />
          <PrivateRoute path='/research' exact component={Research} />
          <PrivateRoute path='/research-application-review' exact component={ResearchApplicationReviewTable} />
          <PrivateRoute path='/review-form/:id' exact component={ResearchApplicationReviewForm} />
        </Switch>
      </Router>
    </div>
  );
}
