// WHY: Every React application needs an entry point that connects React to the DOM
// WHAT: Initializes the React application and renders it into the DOM
// NOTE: This file should remain simple and focused on bootstrapping the app

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// WHY: Need to create a root-level React container and render in strict mode
// WHAT: Creates a React root and renders the main App component
// NOTE: StrictMode helps catch common mistakes and warns about legacy features
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
