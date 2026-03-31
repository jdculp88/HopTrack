"use client";

import { useState, useMemo } from "react";
import { Mail, Send, Users, Crown, Star, TrendingUp, UserPlus, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

type Tier = "all" | "vip" | "power_user" | "regular" | "new";

interface Customer {
  user_id: string;
  display_name: string;
  visits: number;
}

interface MessagesClientProps {
  breweryId: string;
  breweryName: string;
  customers: Customer[];
}

function getTierForVisits(visits: number): "vip" | "power_user" | "regular" | "new" {
  if (visits >= 10) return "vip";
  if (visits >= 5) return "power_user";
  if (visits >= 2) return "regular";
  return "new";
}

const TIER_OPTIONS: { key: Tier; label: string; icon: React.ComponentType<{ size?: number }>; description: string }[] = [
  { key: "all", label: "All Customers", icon: Users, description: "Everyone who has visited" },
  { key: "vip", label: "VIP", icon: Crown, description: "10+ visits" },
  { key: "power_user", label: "Power Users", icon: Star, description: "5\u20139 visits" },
  { key: "regular", label: "Regulars", icon: TrendingUp, description: "2\u20134 visits" },
  { key: "new", label: "New Visitors", icon: UserPlus, description: "1 visit" },
];

export function MessagesClient({ breweryId, breweryName, customers }: MessagesClientProps) {
  const [selectedTier, setSelectedTier] = useState<Tier>("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { success, error: showError } = useToast();

  const filteredCount = useMemo(() => {
    if (selectedTier === "all") return customers.length;
    return customers.filter((c) => getTierForVisits(c.visits) === selectedTier).length;
  }, [customers, selectedTier]);

  const tierCounts = useMemo(() => {
    const counts: Record<Tier, number> = { all: customers.length, vip: 0, power_user: 0, regular: 0, new: 0 };
    customers.forEach((c) => {
      counts[getTierForVisits(c.visits)]++;
    });
    return counts;
  }, [customers]);

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      showError("Please fill in both subject and message body.");
      return;
    }
    if (filteredCount === 0) {
      showError("No customers in this segment to message.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/brewery/${breweryId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier, subject: subject.trim(), body: body.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      const data = await res.json();
      const pushInfo = data.push_count > 0
        ? ` (${data.push_count} push notification${data.push_count !== 1 ? "s" : ""} sent)`
        : "";
      success(`Message sent to ${data.count} customer${data.count !== 1 ? "s" : ""}!${pushInfo}`);
      setSent(true);
      setSubject("");
      setBody("");
      setTimeout(() => setSent(false), 3000);
    } catch (err: any) {
      showError(err.message || "Something went wrong. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 pt-16 lg:pt-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Messages
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Send in-app notifications to your customers by segment.
        </p>
      </div>

      {/* Tier selector */}
      <div className="rounded-2xl border p-5 space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h2 className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>
          Select audience
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TIER_OPTIONS.map(({ key, label, icon: Icon, description }) => {
            const isActive = selectedTier === key;
            const count = tierCounts[key];
            return (
              <button
                key={key}
                onClick={() => setSelectedTier(key)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all border"
                style={
                  isActive
                    ? {
                        background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                        borderColor: "var(--accent-gold)",
                        color: "var(--accent-gold)",
                      }
                    : {
                        background: "var(--surface-2)",
                        borderColor: "var(--border)",
                        color: "var(--text-secondary)",
                      }
                }
              >
                <Icon size={18} />
                <span className="font-display font-semibold text-xs">{label}</span>
                <span className="text-[10px] font-mono" style={{ color: isActive ? "var(--accent-gold)" : "var(--text-muted)" }}>
                  {count} · {description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Composer */}
      <div className="rounded-2xl border p-5 space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>
            Compose message
          </h2>
          <span
            className="text-xs font-mono px-3 py-1 rounded-full"
            style={{
              background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
              color: "var(--accent-gold)",
            }}
          >
            This will reach {filteredCount} customer{filteredCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. New tap alert, Weekend special, Event reminder"
            maxLength={120}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-gold)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message to customers..."
            rows={5}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none border transition-colors resize-none"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-gold)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
          <p className="text-right text-xs mt-1 font-mono" style={{ color: "var(--text-muted)" }}>
            {body.length}/500
          </p>
        </div>

        {/* Send button */}
        <div className="flex items-center justify-end gap-3">
          <AnimatePresence>
            {sent && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-1.5 text-sm font-medium"
                style={{ color: "#4A7C59" }}
              >
                <CheckCircle size={16} />
                Sent
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim() || filteredCount === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "var(--accent-gold)",
              color: "var(--bg)",
            }}
          >
            {sending ? (
              <>
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Loader2 size={16} />
                </motion.span>
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send to {filteredCount} customer{filteredCount !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {customers.length === 0 && (
        <div className="rounded-2xl border p-16 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p className="text-4xl mb-3">
            <Mail size={48} style={{ color: "var(--text-muted)", margin: "0 auto" }} />
          </p>
          <p className="font-display text-xl" style={{ color: "var(--text-primary)" }}>No customers yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            When guests start sessions at your brewery, you can message them here.
          </p>
        </div>
      )}
    </div>
  );
}
