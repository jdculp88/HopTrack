"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Gift, Clock, Check, XCircle, Ticket, Star, Percent, Tag } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pill } from "@/components/ui/Pill";
import { spring } from "@/lib/animation";
import { PILL_ACTIVE, PILL_INACTIVE } from "@/lib/constants/ui";

// ─── Types ──────────────────────────────────────────────────────────────────

interface RedemptionCode {
  id: string;
  code: string;
  type: string;
  status: string;
  brewery_id: string;
  promo_description: string | null;
  pos_reference: string | null;
  created_at: string;
  expires_at: string;
  confirmed_at: string | null;
  brewery?: { id: string; name: string } | null;
}

interface LoyaltyCard {
  id: string;
  stamps: number;
  brewery_id: string;
  program?: {
    id: string;
    stamps_required: number;
    reward_description: string;
    is_active: boolean;
  } | null;
  brewery?: { id: string; name: string } | null;
}

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  ends_at: string;
  brewery?: { id: string; name: string } | null;
}

interface RewardsClientProps {
  activeCodes: RedemptionCode[];
  history: RedemptionCode[];
  loyaltyCards: LoyaltyCard[];
  promotions: Promotion[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const TABS = ["Active", "History", "Loyalty"] as const;
type Tab = (typeof TABS)[number];

const TYPE_LABELS: Record<string, string> = {
  loyalty_reward: "Loyalty Reward",
  brand_loyalty_reward: "Brand Loyalty",
  mug_club_perk: "Mug Club Perk",
  promotion: "Promotion",
};

const STATUS_CONFIG: Record<string, { label: string; variant: "gold" | "success" | "danger" | "muted" }> = {
  pending: { label: "Active", variant: "gold" },
  confirmed: { label: "Redeemed", variant: "success" },
  expired: { label: "Expired", variant: "muted" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

function formatDiscount(type: string, value: number) {
  if (type === "fixed") return `$${value} off`;
  if (type === "percent") return `${value}% off`;
  if (type === "bogo") return "Buy one get one";
  return "Free item";
}

function formatRelative(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  if (diffMs <= 0) return "Expired";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m left`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m left`;
  const days = Math.floor(hours / 24);
  return `${days}d left`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Countdown Hook ─────────────────────────────────────────────────────────

function useCountdown(expiresAt: string) {
  const [timeLeft, setTimeLeft] = useState(() => formatRelative(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatRelative(expiresAt));
    }, 10000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeLeft;
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ActiveCodeCard({ code }: { code: RedemptionCode }) {
  const timeLeft = useCountdown(code.expires_at);
  const isExpired = new Date(code.expires_at) <= new Date();

  return (
    <Card padding="default" className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Pill variant="gold" size="xs">{TYPE_LABELS[code.type] || code.type}</Pill>
            {code.brewery?.name && (
              <span className="text-xs text-[var(--text-muted)] truncate">{code.brewery.name}</span>
            )}
          </div>
          <p className="font-mono text-2xl font-bold tracking-[0.2em] text-[var(--accent-gold)]">
            {code.code}
          </p>
          {code.promo_description && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">{code.promo_description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Clock size={13} style={{ color: isExpired ? "var(--danger)" : "var(--accent-amber)" }} />
          <span
            className="text-xs font-mono font-medium"
            style={{ color: isExpired ? "var(--danger)" : "var(--accent-amber)" }}
          >
            {timeLeft}
          </span>
        </div>
      </div>
    </Card>
  );
}

function HistoryCodeCard({ code }: { code: RedemptionCode }) {
  const status = STATUS_CONFIG[code.status] ?? STATUS_CONFIG.expired;
  return (
    <Card padding="compact">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "color-mix(in srgb, var(--surface-2) 80%, transparent)" }}
        >
          {code.status === "confirmed" ? (
            <Check size={16} style={{ color: "#22c55e" }} />
          ) : code.status === "expired" ? (
            <Clock size={16} style={{ color: "var(--text-muted)" }} />
          ) : (
            <XCircle size={16} style={{ color: "var(--danger)" }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)] truncate">
              {TYPE_LABELS[code.type] || code.type}
            </span>
            <Pill variant={status.variant} size="xs">{status.label}</Pill>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {code.brewery?.name && (
              <span className="text-xs text-[var(--text-muted)] truncate">{code.brewery.name}</span>
            )}
            <span className="text-xs text-[var(--text-muted)]">
              {formatDate(code.confirmed_at || code.created_at)}
            </span>
          </div>
        </div>
        <span className="font-mono text-xs text-[var(--text-muted)] flex-shrink-0">{code.code}</span>
      </div>
    </Card>
  );
}

function LoyaltyCardRow({ card }: { card: LoyaltyCard }) {
  const stamps = card.stamps ?? 0;
  const required = card.program?.stamps_required ?? 10;
  const progress = Math.min((stamps / required) * 100, 100);
  const isFull = stamps >= required;

  return (
    <Link href={`/brewery/${card.brewery_id}`}>
      <Card padding="default" hoverable>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isFull
                ? "linear-gradient(135deg, var(--accent-gold), var(--accent-amber))"
                : "var(--surface-2)",
            }}
          >
            <Star size={18} style={{ color: isFull ? "var(--bg)" : "var(--accent-gold)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {card.brewery?.name ?? "Brewery"}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {isFull ? "Ready to redeem!" : `${stamps} of ${required} stamps`}
            </p>
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-2)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: isFull ? "var(--accent-gold)" : "var(--accent-amber)" }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ...spring.default, delay: 0.1 }}
              />
            </div>
          </div>
          {isFull && (
            <Pill variant="gold" size="xs" icon={<Gift size={10} />}>Reward</Pill>
          )}
        </div>
        {card.program?.reward_description && (
          <p className="text-xs text-[var(--text-secondary)] mt-2 pl-[52px]">
            {isFull ? "🎉 " : ""}{card.program.reward_description}
          </p>
        )}
      </Card>
    </Link>
  );
}

function PromotionCard({ promo }: { promo: Promotion }) {
  const timeLeft = useCountdown(promo.ends_at);

  return (
    <Link href={`/brewery/${promo.brewery?.id}`}>
      <Card padding="compact" hoverable>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
          >
            {promo.discount_type === "percent" ? (
              <Percent size={16} style={{ color: "var(--accent-gold)" }} />
            ) : (
              <Tag size={16} style={{ color: "var(--accent-gold)" }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{promo.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono font-bold text-[var(--accent-gold)]">
                {formatDiscount(promo.discount_type, promo.discount_value)}
              </span>
              {promo.brewery?.name && (
                <span className="text-xs text-[var(--text-muted)] truncate">{promo.brewery.name}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Clock size={11} style={{ color: "var(--accent-amber)" }} />
            <span className="text-[10px] font-mono text-[var(--accent-amber)]">{timeLeft}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function RewardsClient({ activeCodes, history, loyaltyCards, promotions }: RewardsClientProps) {
  const [tab, setTab] = useState<Tab>("Active");

  // Auto-select best tab based on data
  const defaultTab = activeCodes.length > 0 ? "Active" : loyaltyCards.length > 0 ? "Loyalty" : "Active";
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized) {
      setTab(defaultTab);
      setInitialized(true);
    }
  }, [defaultTab, initialized]);

  const renderTabContent = useCallback(() => {
    switch (tab) {
      case "Active":
        return activeCodes.length > 0 ? (
          <div className="space-y-3">
            {activeCodes.map((code, i) => (
              <motion.div key={code.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.default, delay: i * 0.05 }}>
                <ActiveCodeCard code={code} />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="🎟️"
            title="No active codes"
            description="When you redeem a loyalty reward or promotion, your active code will appear here"
            size="md"
          />
        );

      case "History":
        return history.length > 0 ? (
          <div className="space-y-2">
            {history.map((code, i) => (
              <motion.div key={code.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.default, delay: i * 0.04 }}>
                <HistoryCodeCard code={code} />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="📜"
            title="No redemption history"
            description="Your past rewards and redeemed codes will appear here"
            size="md"
          />
        );

      case "Loyalty":
        return loyaltyCards.length > 0 ? (
          <div className="space-y-3">
            {loyaltyCards.map((card, i) => (
              <motion.div key={card.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring.default, delay: i * 0.05 }}>
                <LoyaltyCardRow card={card} />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="⭐"
            title="No loyalty cards"
            description="Visit a brewery with a loyalty program and your stamp card will appear here"
            size="md"
          />
        );
    }
  }, [tab, activeCodes, history, loyaltyCards]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <PageHeader
        title="My Rewards"
        icon={Gift}
      />

      {/* Pill tabs */}
      <div className="flex gap-2">
        {TABS.map((t) => {
          const isActive = tab === t;
          const count = t === "Active" ? activeCodes.length : t === "History" ? history.length : loyaltyCards.length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors"
              style={isActive ? PILL_ACTIVE : PILL_INACTIVE}
            >
              {t}
              {count > 0 && (
                <span className="ml-1.5 font-mono text-xs opacity-70">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={spring.default}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      {/* Available promotions (shown below all tabs) */}
      {promotions.length > 0 && (
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Ticket size={16} style={{ color: "var(--accent-gold)" }} />
            <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Available Promotions</h2>
          </div>
          <div className="space-y-2">
            {promotions.map((promo) => (
              <PromotionCard key={promo.id} promo={promo} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
