"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Shield, X, Eye } from "lucide-react";
import { variants, spring } from "@/lib/animation";

interface ImpersonationBannerProps {
  breweryId: string;
  breweryName: string;
}

export function ImpersonationBanner({ breweryId, breweryName }: ImpersonationBannerProps) {
  const [exiting, setExiting] = useState(false);

  const exitImpersonation = async () => {
    setExiting(true);
    try {
      await fetch("/api/superadmin/impersonate", { method: "DELETE" });
      window.location.href = `/superadmin/breweries/${breweryId}`;
    } catch {
      setExiting(false);
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 px-4 py-2"
      style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
      {...variants.slideDown}
      transition={spring.snappy}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Shield size={14} className="flex-shrink-0" />
          <span className="text-xs font-mono font-bold truncate">
            Viewing as {breweryName}
          </span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0"
            style={{ background: "rgba(0,0,0,0.15)" }}
          >
            <Eye size={8} className="inline mr-1" />
            Read-only
          </span>
        </div>
        <button
          onClick={exitImpersonation}
          disabled={exiting}
          className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
          style={{ background: "rgba(0,0,0,0.15)" }}
        >
          <X size={12} />
          {exiting ? "Exiting..." : "Exit"}
        </button>
      </div>
    </motion.div>
  );
}
