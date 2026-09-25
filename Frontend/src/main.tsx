import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app";
import "./index.css";

(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) {
        reg.update();
        reg.unregister();
      }
    });
  }
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
