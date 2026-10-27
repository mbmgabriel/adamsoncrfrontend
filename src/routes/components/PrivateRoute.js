import React from "react";
import { Route, Redirect } from "react-router-dom";

import { isAdministrator } from '../../utils/userLanding';

export function PrivateRoute({ component: Component, workspaceOnly = false, ...rest }) {
  const token = window.localStorage.getItem("token");
  return (
    <Route
      {...rest}
      render={props =>
        !token ? <Redirect to="/" /> : workspaceOnly && isAdministrator(window.localStorage.getItem("role")) ? <Redirect to="/admin" /> : <Component {...props} />
      }
    />
  );
}