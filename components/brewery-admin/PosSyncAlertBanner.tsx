"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

interface PosSyncAlertBannerProps {
  breweryId: string;
}

export function PosSyncAlertBanner({ breweryId }: PosSyncAlertBannerProps) {
  const [alert, setAlert] = useState<{ provider: string; health: string; lastSyncAt: string | null; lastSyncStatus: string | null } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/pos/status?brewery_id=${breweryId}`);
      if (!res.ok) return;
      const json = await res.json();
      const connections = json.data?.connections || [];

      // Find the worst-health active connection
      const unhealthy = connections.find(
        (c: any) => c.status === "active" && (c.health === "red" || c.health === "yellow")
      );

      if (unhealthy) {
        setAlert({
          provider: unhealthy.provider,
          health: unhealthy.health,
          lastSyncAt: unhealthy.last_sync_at,
          lastSyncStatus: unhealthy.last_sync_status,
        });
      }
    } catch {
      // Non-critical
    }
  }, [breweryId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  if (!alert || dismissed) return null;

  const isError = alert.health === "red";
  const bannerBg = isError ? "rgba(239,68,68,0.08)" : "rgba(234,179,8,0.08)";
  const bannerBorder = isError ? "rgba(239,68,68,0.2)" : "rgba(234,179,8,0.2)";
  const iconColor = isError ? "#ef4444" : "#eab308";

  const message = alert.lastSyncStatus === "failed"
    ? `Your ${capitalize(alert.provider)} sync failed${alert.lastSyncAt ? ` ${formatTimeAgo(alert.lastSyncAt)}` : ""}`
    : `Your ${capitalize(alert.provider)} sync is stale${alert.lastSyncAt ? ` — last synced ${formatTimeAgo(alert.lastSyncAt)}` : ""}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="mb-4 overflow-hidden"
      >
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: bannerBg, border: `1px solid ${bannerBorder}` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle size={14} style={{ color: iconColor }} className="flex-shrink-0" />
            <span style={{ color: "var(--text-primary)" }}>{message}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/brewery-admin/${breweryId}/pos-sync`}
              className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors min-h-[28px] flex items-center"
              style={{ background: "var(--surface-2)", color: "var(--text-primary)" }}
            >
              View Details
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg transition-opacity hover:opacity-70"
              aria-label="Dismiss alert"
            >
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}
