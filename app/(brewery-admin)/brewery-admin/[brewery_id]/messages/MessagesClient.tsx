"use client";

import { useState, useMemo } from "react";
import { Mail, Send, Users, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { computeSegment, SEGMENTS, type CustomerSegment } from "@/lib/crm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

type Audience = "all" | CustomerSegment;

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

export function MessagesClient({ breweryId, breweryName: _breweryName, customers }: MessagesClientProps) {
  const [selectedAudience, setSelectedAudience] = useState<Audience>("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { success, error: showError } = useToast();

  const filteredCount = useMemo(() => {
    if (selectedAudience === "all") return customers.length;
    return customers.filter((c) => computeSegment(c.visits) === selectedAudience).length;
  }, [customers, selectedAudience]);

  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = { all: customers.length };
    SEGMENTS.forEach((s) => { counts[s.id] = 0; });
    customers.forEach((c) => {
      const seg = computeSegment(c.visits);
      counts[seg] = (counts[seg] ?? 0) + 1;
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
        body: JSON.stringify({ tier: selectedAudience, subject: subject.trim(), body: body.trim() }),
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
      <PageHeader title="Messages" subtitle="Send in-app notifications to your customers by segment." className="mb-0" />

      {/* Segment selector */}
      <Card padding="spacious" className="space-y-4">
        <h2 className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>
          Select audience
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {/* All option */}
          <button
            onClick={() => setSelectedAudience("all")}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all border"
            style={
              selectedAudience === "all"
                ? { background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", borderColor: "var(--accent-gold)", color: "var(--accent-gold)" }
                : { background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-secondary)" }
            }
          >
            <Users size={18} />
            <span className="font-display font-semibold text-xs">All</span>
            <span className="text-[10px] font-mono" style={{ color: selectedAudience === "all" ? "var(--accent-gold)" : "var(--text-muted)" }}>
              {segmentCounts.all} customers
            </span>
          </button>

          {/* Segment options from CRM */}
          {SEGMENTS.map((seg) => {
            const isActive = selectedAudience === seg.id;
            return (
              <button
                key={seg.id}
                onClick={() => setSelectedAudience(seg.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all border"
                style={
                  isActive
                    ? { background: seg.bgColor, borderColor: seg.color, color: seg.color }
                    : { background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-secondary)" }
                }
              >
                <span className="text-lg">{seg.emoji}</span>
                <span className="font-display font-semibold text-xs">{seg.label}</span>
                <span className="text-[10px] font-mono" style={{ color: isActive ? seg.color : "var(--text-muted)" }}>
                  {segmentCounts[seg.id] ?? 0} · {seg.minVisits}{seg.maxVisits ? `-${seg.maxVisits}` : "+"} visits
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Composer */}
      <Card padding="spacious" className="space-y-4">
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
      </Card>

      {/* Empty state */}
      {customers.length === 0 && (
        <Card className="p-16 text-center">
          <p className="text-4xl mb-3">
            <Mail size={48} style={{ color: "var(--text-muted)", margin: "0 auto" }} />
          </p>
          <p className="font-display text-xl" style={{ color: "var(--text-primary)" }}>No customers yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            When guests start sessions at your brewery, you can message them here.
          </p>
        </Card>
      )}
    </div>
  );
}
