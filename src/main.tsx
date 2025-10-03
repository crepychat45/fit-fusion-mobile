import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ensure React is globally available
(window as any).React = React;

// Performance monitoring
if (typeof window !== "undefined") {
  // Log performance metrics
  window.addEventListener("load", () => {
    console.info("App loaded successfully");
  });
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  console.error("Root container not found");
}
