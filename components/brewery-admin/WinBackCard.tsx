"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Send, ChevronDown, Lock, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { spring, variants } from "@/lib/animation";
import { getSegmentConfig, type CustomerSegment } from "@/lib/crm";
import type { WinBackCandidate } from "@/lib/win-back";

interface WinBackCardProps {
  candidates: WinBackCandidate[];
  tier: string;
  breweryId: string;
}

function SegmentBadge({ segment }: { segment: CustomerSegment }) {
  const config = getSegmentConfig(segment === "vip" ? 10 : segment === "power" ? 5 : segment === "regular" ? 2 : 1);
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
      style={{ color: config.color, backgroundColor: config.bgColor }}
    >
      {config.emoji} {config.label}
    </span>
  );
}

export function WinBackCard({ candidates, tier, breweryId }: WinBackCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [composing, setComposing] = useState<WinBackCandidate | null>(null);
  const [message, setMessage] = useState("");

  const isCaskPlus = tier === "cask" || tier === "barrel";

  if (candidates.length === 0) return null;

  const visible = expanded ? candidates : candidates.slice(0, 5);

  async function handleSend(candidate: WinBackCandidate) {
    setSending(candidate.userId);
    try {
      const res = await fetch(`/api/brewery/${breweryId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "We miss you!",
          body: message || candidate.messageTemplate,
          userId: candidate.userId,
        }),
      });
      if (res.ok) {
        setSent(prev => new Set(prev).add(candidate.userId));
        setComposing(null);
        setMessage("");
      }
    } finally {
      setSending(null);
    }
  }

  if (!isCaskPlus) {
    return (
      <Card padding="spacious" className="relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-[#f59e0b]/10 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
          </div>
          <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">Win-Back Opportunities</h3>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] font-medium">
            {candidates.length}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          {candidates.length} regular{candidates.length !== 1 ? "s" : ""} haven't visited in 2+ weeks.
        </p>
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
          <span className="text-xs text-[var(--text-secondary)]">
            Upgrade to Cask to send win-back messages
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="spacious">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-[#f59e0b]/10 flex items-center justify-center">
          <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
        </div>
        <h3 className="font-display font-bold text-sm text-[var(--text-primary)]">Win-Back Opportunities</h3>
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] font-medium">
          {candidates.length}
        </span>
      </div>

      <div className="space-y-2">
        {visible.map((c) => (
          <div key={c.userId} className="flex items-center gap-3 p-2 rounded-xl bg-[var(--surface-2)]">
            <UserAvatar
              profile={{ display_name: c.displayName, avatar_url: c.avatarUrl }}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {c.displayName}
                </span>
                <SegmentBadge segment={c.segment} />
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                Last seen {c.daysSinceVisit} days ago · {c.visits} visits
              </span>
            </div>
            {sent.has(c.userId) ? (
              <span className="text-xs text-[#4ade80] font-medium px-2">Sent</span>
            ) : (
              <button
                onClick={() => { setComposing(c); setMessage(c.messageTemplate); }}
                disabled={sending === c.userId}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/20 transition-colors disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                Message
              </button>
            )}
          </div>
        ))}
      </div>

      {candidates.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-2 text-xs text-[var(--accent-gold)] hover:opacity-80"
        >
          {expanded ? "Show less" : `Show ${candidates.length - 5} more`}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={spring.snappy}>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.div>
        </button>
      )}

      {/* Compose modal */}
      <AnimatePresence>
        {composing && (
          <motion.div
            {...variants.slideUp}
            transition={spring.default}
            className="mt-3 p-3 rounded-xl border border-[var(--accent-gold)]/30 bg-[var(--surface-2)]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[var(--text-primary)]">
                Message to {composing.displayName}
              </span>
              <button onClick={() => { setComposing(null); setMessage(""); }}>
                <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-20 p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--accent-gold)]/50"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleSend(composing)}
                disabled={!message.trim() || sending === composing.userId}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[var(--accent-gold)] text-[#0F0E0C] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                {sending === composing.userId ? "Sending..." : "Send Message"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
