import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Arcade from "./Arcade";
import "./index.css";

const currentPath = window.location.pathname.replace(/\/+$/, "");
const Page = currentPath === "/game" ? Arcade : App;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>,
);
