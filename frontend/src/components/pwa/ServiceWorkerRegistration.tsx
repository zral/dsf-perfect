"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const isProd = process.env.NODE_ENV === "production";

      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          if (isProd) {
            console.log("SW registered:", reg.scope);
          } else {
            console.log("[DEV] SW registered:", reg.scope);
          }
        })
        .catch((err) => {
          console.error("SW registration failed:", err);
        });
    }
  }, []);

  return null;
}
