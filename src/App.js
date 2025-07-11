import React from "react";
import Routes from "../src/routes/Routes";
import UserContextProvider from "./context/UserContext";

export default function App() {
  return (
    <UserContextProvider >
      <Routes />
    </UserContextProvider>
  );
}
