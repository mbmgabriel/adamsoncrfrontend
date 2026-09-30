import React from "react";
import Routes from "../src/routes/Routes";
import UserContextProvider from "./context/UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <UserContextProvider >
      <Routes />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
      />
    </UserContextProvider>
  );
}
