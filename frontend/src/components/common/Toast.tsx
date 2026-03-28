"use client";

import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/stores/toastStore";
import type { ToastType } from "@/stores/toastStore";

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

const bgMap: Record<ToastType, string> = {
  success: "bg-green-50 border-green-200",
  error: "bg-red-50 border-red-200",
  info: "bg-blue-50 border-blue-200",
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <>
      {/* Desktop: bottom-right */}
      <div className="hidden md:block fixed bottom-6 right-6 z-[100] space-y-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${bgMap[toast.type]}`}
            >
              {iconMap[toast.type]}
              <span className="text-sm font-medium text-gray-900">
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile: top */}
      <div className="md:hidden fixed top-4 left-4 right-4 z-[100] space-y-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${bgMap[toast.type]}`}
            >
              {iconMap[toast.type]}
              <span className="text-sm font-medium text-gray-900 flex-1">
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
