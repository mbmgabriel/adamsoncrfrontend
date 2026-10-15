import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useHistory } from "react-router-dom";

function DashboardBackButton() {
  const history = useHistory();

  return (
    <button
      className="page-back-button"
      onClick={() => history.push("/dashboard")}
      type="button"
    >
      <FiArrowLeft aria-hidden="true" />
      Back to dashboard
    </button>
  );
}

export default DashboardBackButton;
