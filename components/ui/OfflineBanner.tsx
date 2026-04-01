"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Appears at the top of the app when the user loses internet connection.
 * Automatically hides when connection is restored.
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2 bg-[var(--danger)]/15 border-b border-[var(--danger)]/20 px-4 py-2">
            <WifiOff size={14} className="text-[var(--danger)] flex-shrink-0" />
            <p className="text-xs font-medium text-[var(--danger)]">
              No internet connection — some features may be unavailable
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
