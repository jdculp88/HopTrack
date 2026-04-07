"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoyaltyProgram {
  id?: string;
  name: string;
  stamps_required: number;
  reward_description: string;
}

interface LoyaltyCard {
  stamps: number;
  lifetime_stamps: number;
}

interface LoyaltyStampCardProps {
  program: LoyaltyProgram;
  card: LoyaltyCard | null;
  breweryName: string;
  breweryId?: string;
}

// SVG hop cone icon used for filled stamps
function HopIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Stylised hop cone: oval body with two leaf lobes */}
      <ellipse cx="12" cy="14" rx="4" ry="5.5" />
      <path d="M12 8.5 C9 6 6 7 6 9.5 C6 11 7.5 11.5 9 11 C9.5 10.8 10.5 10 12 8.5Z" />
      <path d="M12 8.5 C15 6 18 7 18 9.5 C18 11 16.5 11.5 15 11 C14.5 10.8 13.5 10 12 8.5Z" />
      <line x1="12" y1="8.5" x2="12" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// Perforated hole decoration at card edges
function Perforation({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={cn(
        "absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full z-10",
        side === "left" ? "-left-2.5" : "-right-2.5"
      )}
      style={{
        background: "var(--bg)",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
        border: "1px solid var(--border)",
      }}
    />
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const stampVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 500,
      damping: 22,
    },
  },
};

const rewardBannerVariants = {
  hidden: { scaleX: 0.85, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
      delay: 0.2,
    },
  },
};

export function LoyaltyStampCard({ program, card, breweryName, breweryId }: LoyaltyStampCardProps) {
  const stamps = card?.stamps ?? 0;
  const lifetimeStamps = card?.lifetime_stamps ?? 0;
  const { stamps_required, name, reward_description } = program;
  const isRewardReady = card !== null && stamps >= stamps_required;
  const remaining = Math.max(0, stamps_required - stamps);

  // Layout: single row up to 8, two rows above 8
  const useGrid = stamps_required > 8;
  const cols = useGrid ? Math.ceil(stamps_required / 2) : stamps_required;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="relative mx-auto w-full max-w-md select-none"
      style={{ isolation: "isolate" }}
    >
      {/* Card body */}
      <div
        className="relative overflow-visible rounded-2xl px-6 py-5"
        style={{
          background: "var(--surface-2)",
          border: "1.5px solid var(--accent-gold)",
          boxShadow:
            "0 2px 0 0 color-mix(in srgb, var(--accent-gold) 60%, transparent), 0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 color-mix(in srgb, var(--text-primary) 6%, transparent)",
        }}
      >
        {/* Subtle paper grain texture */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px 200px",
          }}
        />

        {/* Side perforations for physical card feel */}
        <Perforation side="left" />
        <Perforation side="right" />

        {/* Dashed perforation line across the bottom third */}
        <div
          className="absolute left-6 right-6 bottom-[3.5rem]"
          style={{
            borderTop: "1px dashed color-mix(in srgb, var(--accent-gold) 30%, transparent)",
          }}
        />

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-4">
          <p
            className="text-xs font-mono uppercase tracking-widest mb-0.5"
            style={{ color: "var(--accent-gold)" }}
          >
            {breweryName}
          </p>
          <h3
            className="font-display text-xl font-bold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {name}
          </h3>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Reward: {reward_description}
          </p>
        </div>

        {/* ── Stamp grid ─────────────────────────────────────── */}
        {card === null ? (
          <div
            className="rounded-xl px-4 py-5 text-center border"
            style={{
              background:
                "color-mix(in srgb, var(--surface) 60%, transparent)",
              borderColor:
                "color-mix(in srgb, var(--border) 70%, transparent)",
            }}
          >
            <p className="text-2xl mb-2">🍺</p>
            <p
              className="font-display text-base font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Start earning stamps
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Visit to get your first stamp!
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "grid gap-2.5",
              useGrid ? "" : "justify-items-center"
            )}
            style={{
              gridTemplateColumns: `repeat(${Math.min(cols, stamps_required)}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: stamps_required }).map((_, i) => {
              const filled = i < stamps;
              return (
                <motion.div
                  key={i}
                  variants={stampVariants}
                  className="relative flex items-center justify-center"
                  style={{ aspectRatio: "1" }}
                >
                  {/* Outer ring */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: filled
                        ? "1.5px solid var(--accent-gold)"
                        : "1.5px solid color-mix(in srgb, var(--border) 80%, transparent)",
                      background: filled
                        ? "color-mix(in srgb, var(--accent-gold) 15%, transparent)"
                        : "color-mix(in srgb, var(--surface) 50%, transparent)",
                      boxShadow: filled
                        ? "0 0 8px color-mix(in srgb, var(--accent-gold) 35%, transparent), inset 0 1px 0 color-mix(in srgb, var(--text-primary) 10%, transparent)"
                        : "none",
                    }}
                  />
                  {filled ? (
                    <HopIcon
                      className="relative z-10 w-[55%] h-[55%]"
                      // color applied inline so it picks up CSS var correctly
                    />
                  ) : (
                    <span
                      className="relative z-10 font-mono text-[0.6rem] font-bold"
                      style={{
                        color: "color-mix(in srgb, var(--text-muted) 60%, transparent)",
                      }}
                    >
                      {i + 1}
                    </span>
                  )}
                  {/* Gold color for HopIcon is applied via currentColor through parent */}
                  {filled && (
                    <style>{`.hop-filled-${i} { color: var(--accent-gold); }`}</style>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Fix: pass color as style to HopIcons via CSS custom property cascade */}
        <style>{`
          [data-hop-filled] svg { color: var(--accent-gold); }
          [data-hop-empty] svg  { color: color-mix(in srgb, var(--text-muted) 40%, transparent); }
        `}</style>

        {/* ── Progress text / Redemption ────────────────────── */}
        {card !== null && (
          <div className="mt-4">
            {isRewardReady ? (
              <RedemptionCodeSection
                breweryId={breweryId}
                programId={program.id}
                rewardDescription={reward_description}
              />
            ) : (
              <p
                className="text-xs text-center"
                style={{ color: "var(--text-secondary)" }}
              >
                <span
                  className="font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {stamps} of {stamps_required} stamps
                </span>
                {" — "}
                {remaining} more until{" "}
                <span style={{ color: "var(--accent-gold)" }}>
                  {reward_description}
                </span>
              </p>
            )}
          </div>
        )}

        {/* ── Lifetime footer ─────────────────────────────────── */}
        {card !== null && (
          <p
            className="text-[0.65rem] text-center mt-3 font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            {lifetimeStamps} lifetime visit{lifetimeStamps !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Redemption Code Section ────────────────────────────────────────────────

function RedemptionCodeSection({
  breweryId,
  programId,
  rewardDescription,
}: {
  breweryId?: string;
  programId?: string;
  rewardDescription: string;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const generateCode = useCallback(async () => {
    if (!breweryId || !programId) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/redemptions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "loyalty_reward",
          brewery_id: breweryId,
          program_id: programId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate code");
        return;
      }
      setCode(data.code);
      setExpiresAt(data.expires_at);
    } catch {
      setError("Network error");
    } finally {
      setGenerating(false);
    }
  }, [breweryId, programId]);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return;
    function tick() {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt!).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setCode(null);
        setExpiresAt(null);
      }
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (code) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl px-4 py-4 text-center"
        style={{
          background: "color-mix(in srgb, var(--accent-gold) 12%, transparent)",
          border: "1px solid color-mix(in srgb, var(--accent-gold) 50%, transparent)",
        }}
      >
        <p className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: "var(--text-muted)" }}>
          Show this code to your bartender
        </p>
        <div className="flex items-center justify-center gap-1.5 mb-2">
          {code.split("").map((char, i) => (
            <div
              key={i}
              className="w-10 h-12 rounded-lg flex items-center justify-center font-mono text-2xl font-bold"
              style={{
                background: "var(--card-bg)",
                border: "1.5px solid var(--accent-gold)",
                color: "var(--accent-gold)",
              }}
            >
              {char}
            </div>
          ))}
        </div>
        <p className="text-xs font-mono" style={{ color: timeLeft <= 60 ? "var(--danger)" : "var(--text-muted)" }}>
          Expires in {minutes}:{seconds.toString().padStart(2, "0")}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          {rewardDescription}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={rewardBannerVariants}
      initial="hidden"
      animate="visible"
      className="rounded-xl px-4 py-3 text-center"
      style={{
        background: "color-mix(in srgb, var(--accent-gold) 12%, transparent)",
        border: "1px solid color-mix(in srgb, var(--accent-gold) 50%, transparent)",
      }}
    >
      <p className="font-display font-bold text-base" style={{ color: "var(--accent-gold)" }}>
        Reward Ready!
      </p>
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{error}</p>
      )}
      <button
        onClick={generateCode}
        disabled={generating || !breweryId || !programId}
        className="mt-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 inline-flex items-center gap-1.5"
        style={{
          background: "linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-amber) 100%)",
          color: "var(--bg)",
        }}
      >
        {generating ? (
          <><Loader2 size={14} className="animate-spin" /> Generating...</>
        ) : (
          "Redeem Reward"
        )}
      </button>
    </motion.div>
  );
}
