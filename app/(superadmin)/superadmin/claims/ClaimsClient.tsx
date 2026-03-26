"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, Building2, Mail, User, Calendar, Search } from "lucide-react";
import { formatDate } from "@/lib/dates";

type Claim = {
  id: string;
  status: "pending" | "approved" | "rejected";
  role: string;
  business_email: string;
  notes: string | null;
  created_at: string;
  brewery: { id: string; name: string; city: string; state: string } | null;
  claimant: { id: string; display_name: string; username: string } | null;
};

const STATUS_TABS = ["all", "pending", "approved", "rejected"] as const;
type Tab = (typeof STATUS_TABS)[number];

export function ClaimsClient({ initialClaims }: { initialClaims: Claim[] }) {
  const [claims, setClaims]       = useState<Claim[]>(initialClaims);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [loading, setLoading]     = useState<string | null>(null);
  const [search, setSearch]       = useState("");

  const pendingCount = claims.filter((c) => c.status === "pending").length;

  const filtered = claims
    .filter((c) => activeTab === "all" || c.status === activeTab)
    .filter((c) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.brewery?.name?.toLowerCase().includes(q) ||
        c.claimant?.display_name?.toLowerCase().includes(q) ||
        c.claimant?.username?.toLowerCase().includes(q) ||
        c.business_email?.toLowerCase().includes(q)
      );
    });

  async function handleAction(claimId: string, action: "approve" | "reject") {
    setLoading(claimId);
    try {
      const res = await fetch("/api/admin/claims", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim_id: claimId, action }),
      });
      if (res.ok) {
        setClaims((prev) =>
          prev.map((c) =>
            c.id === claimId
              ? { ...c, status: action === "approve" ? "approved" : "rejected" }
              : c
          )
        );
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Claims Queue</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {pendingCount} pending {pendingCount === 1 ? "claim" : "claims"} awaiting review
          </p>
        </div>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border w-full max-w-sm mb-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <Search size={14} style={{ color: "var(--text-muted)" }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brewery, claimant, or email…"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl w-fit mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors"
            style={{
              background: activeTab === tab ? "var(--accent-gold)" : "transparent",
              color:      activeTab === tab ? "var(--bg)"           : "var(--text-secondary)",
            }}
          >
            {tab}
            {tab === "pending" && pendingCount > 0 && (
              <span
                className="ml-1.5 text-xs rounded-full px-1.5 py-0.5"
                style={{ background: "var(--danger)", color: "var(--text-primary)" }}
              >
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <Clock size={32} className="mx-auto mb-3 opacity-40" />
              <p>No {activeTab === "all" ? "" : activeTab} claims</p>
            </div>
          )}
          {filtered.map((claim) => (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              style={{
                background:   "var(--surface)",
                borderColor:  claim.status === "pending" ? "var(--accent-amber)" : "var(--border)",
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={claim.status} />
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    {formatDate(claim.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Building2 size={13} className="text-[var(--text-muted)]" />
                  <span className="font-semibold text-[var(--text-primary)]">
                    {claim.brewery?.name ?? "Unknown brewery"}
                  </span>
                  {claim.brewery && (
                    <span className="text-xs text-[var(--text-muted)]">
                      · {claim.brewery.city}, {claim.brewery.state}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {claim.claimant?.display_name ?? "Unknown"} (@{claim.claimant?.username})
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail size={12} />
                    {claim.business_email}
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    <Calendar size={12} />
                    {claim.role}
                  </span>
                </div>
                {claim.notes && (
                  <p className="mt-2 text-sm text-[var(--text-muted)] italic">"{claim.notes}"</p>
                )}
              </div>
              {claim.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleAction(claim.id, "approve")}
                    disabled={loading === claim.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
                    style={{ background: "rgba(61,122,82,0.12)", color: "var(--success)" }}
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(claim.id, "reject")}
                    disabled={loading === claim.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
                    style={{ background: "rgba(196,75,58,0.1)", color: "var(--danger)" }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Claim["status"] }) {
  const styles = {
    pending:  { bg: "rgba(232,132,26,0.12)", color: "var(--accent-amber)", label: "Pending"  },
    approved: { bg: "rgba(61,122,82,0.12)",  color: "var(--success)",      label: "Approved" },
    rejected: { bg: "rgba(196,75,58,0.1)",   color: "var(--danger)",       label: "Rejected" },
  }[status];
  return (
    <span
      className="text-xs font-mono font-medium px-2 py-0.5 rounded-full capitalize"
      style={{ background: styles.bg, color: styles.color }}
    >
      {styles.label}
    </span>
  );
}
