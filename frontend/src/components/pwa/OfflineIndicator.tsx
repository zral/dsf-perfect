"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Status = "online" | "offline" | "reconnected" | null;

export default function OfflineIndicator() {
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    // Set initial state only if already offline
    if (!navigator.onLine) {
      setStatus("offline");
    }

    const handleOffline = () => setStatus("offline");
    const handleOnline = () => {
      setStatus("reconnected");
      setTimeout(() => setStatus(null), 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const isVisible = status === "offline" || status === "reconnected";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={`fixed top-16 left-0 right-0 z-40 ${
            status === "offline"
              ? "bg-amber-50 border-b border-amber-200"
              : "bg-green-50 border-b border-green-200"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
            {status === "offline" ? (
              <>
                <WifiOff className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  Du er offline — noe funksjonalitet er begrenset
                </span>
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Du er tilkoblet igjen
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
