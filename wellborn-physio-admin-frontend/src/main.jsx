import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css";


// ============================================================
// ROOT ELEMENT
// ============================================================

const rootElement = document.getElementById("root");

if (!rootElement) {

  throw new Error(
    "Root element with id='root' was not found."
  );

}


// ============================================================
// CREATE ROOT
// ============================================================

const root = createRoot(rootElement);


// ============================================================
// RENDER APP
// ============================================================

root.render(

  <React.StrictMode>

    <App />

  </React.StrictMode>

);