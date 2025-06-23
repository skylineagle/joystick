import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { scan } from "react-scan";
import { v4 as uuidv4 } from "uuid";
import App from "./App.tsx";

import "./index.css";

if (import.meta.env.NODE_ENV !== "production") {
  scan({
    enabled: import.meta.env.NODE_ENV !== "production",
    trackUnnecessaryRenders: true,
  });
}

if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "undefined") {
  crypto.randomUUID = function () {
    return uuidv4() as `${string}-${string}-${string}-${string}-${string}`;
  };
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
