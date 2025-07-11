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
        </Switch>
      </Router>
    </div>
  );
}
