// frontend/src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // or "./App.css", depending on your CSS structure

// Create the root and render the App component into the div with id="root"
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
