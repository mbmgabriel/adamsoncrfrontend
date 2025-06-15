import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Switch
} from "react-router-dom";
import Dashboard from '../views/Dashboard/Dashboard'
import Login from "../views/Login";
import { AuthRoute } from "./components/AuthRoute";
import { PrivateRoute } from "./components/PrivateRoute";

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
        </Switch>
      </Router>
    </div>
  );
}
