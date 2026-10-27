import React from "react";
import { Route, Redirect } from "react-router-dom";

import { getLandingPath } from '../../utils/userLanding';

export function AuthRoute({ component: Component, ...rest }) {
  const token = window.localStorage.getItem("token");
  return (
    <Route
      {...rest}
      render={props =>
        !token ? <Component {...props} /> : <Redirect to={getLandingPath(window.localStorage.getItem("role"))} />
      }
    />
  );
}