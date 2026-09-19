import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/lib/i18n";
import { initSentry } from "@/lib/sentry";
import { startFlakyHeartbeat } from "@/lib/flakyHeartbeat";
import "./index.css";
import App from "./App.tsx";

initSentry();
startFlakyHeartbeat();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
