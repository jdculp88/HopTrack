"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, Plus, Trash2, Copy, Check, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/components/ui/Toast";

interface ApiKeyEntry {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export function ApiKeyManager({ breweryId }: { breweryId: string }) {
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const fetchKeys = useCallback(async () => {
    const res = await fetch(`/api/v1/brewery/${breweryId}/api-keys`);
    if (res.ok) {
      const { data } = await res.json();
      setKeys(data ?? []);
    }
    setLoading(false);
  }, [breweryId]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const activeKeys = keys.filter(k => !k.revoked_at);
  const revokedKeys = keys.filter(k => k.revoked_at);

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    const res = await fetch(`/api/v1/brewery/${breweryId}/api-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName.trim() }),
    });
    setCreating(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toastError(err.error ?? "Failed to create API key");
      return;
    }

    const { data } = await res.json();
    setNewlyCreatedKey(data.key);
    setNewKeyName("");
    setShowCreate(false);
    success("API key created! Copy it now — it won't be shown again.");
    fetchKeys();
  }

  async function handleRevoke(keyId: string) {
    const res = await fetch(`/api/v1/brewery/${breweryId}/api-keys`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key_id: keyId }),
    });
    setRevokeConfirm(null);
    if (res.ok) {
      success("API key revoked");
      fetchKeys();
    } else {
      toastError("Failed to revoke key");
    }
  }

  function handleCopy() {
    if (!newlyCreatedKey) return;
    navigator.clipboard.writeText(newlyCreatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function timeAgo(dateStr: string | null) {
    if (!dateStr) return "Never";
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4" style={{ color: "var(--text-muted)" }}>
        <Loader2 size={16} className="animate-spin" /> Loading API keys...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Newly created key banner */}
      <AnimatePresence>
        {newlyCreatedKey && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border p-4"
            style={{ borderColor: "var(--accent-gold)", background: "rgba(212,168,67,0.08)" }}
          >
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle size={16} style={{ color: "var(--accent-gold)", flexShrink: 0, marginTop: 2 }} />
              <p className="text-sm font-medium" style={{ color: "var(--accent-gold)" }}>
                Copy your API key now. It will not be shown again.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <code
                className="text-xs font-mono flex-1 px-3 py-2 rounded-lg truncate"
                style={{ background: "var(--surface-2)", color: "var(--text-primary)" }}
              >
                {newlyCreatedKey}
              </code>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg transition-colors"
                style={{ background: "var(--surface-2)", color: copied ? "var(--accent-gold)" : "var(--text-muted)" }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <button
              onClick={() => setNewlyCreatedKey(null)}
              className="text-xs mt-2 underline"
              style={{ color: "var(--text-muted)" }}
            >
              I've copied it, dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active keys */}
      {activeKeys.length === 0 && !showCreate ? (
        <div className="text-center py-6 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <Key size={24} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No API keys yet</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Create one to access the HopTrack Public API
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeKeys.map(key => (
            <div
              key={key.id}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Key size={14} style={{ color: "var(--accent-gold)" }} />
                  <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {key.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <code className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {key.key_prefix}...
                  </code>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Last used: {timeAgo(key.last_used_at)}
                  </span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {revokeConfirm === key.id ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2"
                  >
                    <button
                      onClick={() => setRevokeConfirm(null)}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{ color: "var(--text-muted)", background: "var(--surface-2)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={{ color: "#fff", background: "var(--danger)" }}
                    >
                      Revoke
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="trash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <button
                      onClick={() => setRevokeConfirm(key.id)}
                      className="p-2 rounded-lg transition-colors hover:opacity-80"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Revoked keys (collapsed) */}
      {revokedKeys.length > 0 && (
        <details className="text-xs" style={{ color: "var(--text-muted)" }}>
          <summary className="cursor-pointer hover:underline">{revokedKeys.length} revoked key{revokedKeys.length > 1 ? "s" : ""}</summary>
          <div className="mt-2 space-y-1 pl-2">
            {revokedKeys.map(key => (
              <div key={key.id} className="flex items-center gap-2 opacity-50">
                <code className="font-mono">{key.key_prefix}...</code>
                <span>{key.name}</span>
                <span>— revoked {timeAgo(key.revoked_at)}</span>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
              Key Name
            </label>
            <input
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="e.g. Website Widget, POS Integration"
              maxLength={50}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
              style={{ borderColor: "var(--border)", background: "var(--surface-2)", color: "var(--text-primary)" }}
              onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
            />
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => { setShowCreate(false); setNewKeyName(""); }}
                className="text-sm px-4 py-2 rounded-xl"
                style={{ color: "var(--text-muted)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newKeyName.trim()}
                className="text-sm px-4 py-2 rounded-xl font-medium flex items-center gap-1.5 disabled:opacity-50"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                Generate Key
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create button */}
      {!showCreate && activeKeys.length < 5 && (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full py-3 rounded-xl border border-dashed text-sm font-medium flex items-center justify-center gap-2 transition-colors hover:opacity-80"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <Plus size={16} /> Create API Key
        </button>
      )}

      {activeKeys.length >= 5 && (
        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
          Maximum 5 active keys. Revoke one to create a new one.
        </p>
      )}
    </div>
  );
}
