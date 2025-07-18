import React from "react";
import { Route, Redirect } from "react-router-dom";

export function AuthRoute({ component: Component, ...rest }) {
  const token = window.localStorage.getItem("token");
  return (
    <Route
      {...rest}
      render={props =>
        !token ? <Component {...props} /> : <Redirect to="/dashboard" />
      }
    />
  );
}