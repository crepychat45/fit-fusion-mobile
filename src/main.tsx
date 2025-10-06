import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ensure React is globally available
if (typeof window !== "undefined") {
  (window as any).React = React;
  
  // Clear old service worker caches
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
    
    caches.keys().then((names) => {
      names.forEach((name) => {
        if (name !== 'fitfusion-v2') {
          caches.delete(name);
        }
      });
    });
  }
  
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
