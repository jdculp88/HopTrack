"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Loader2, Copy, AlertCircle, ScanLine, Clock, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface CodeEntryProps {
  breweryId: string;
}

interface RedemptionResult {
  customer: string;
  type: string;
  description: string;
  pos_reference: string;
}

const ERROR_ICONS: Record<string, React.ReactNode> = {
  EXPIRED: <Clock className="h-4 w-4 flex-shrink-0" style={{ color: "var(--accent-amber)" }} />,
  ALREADY_REDEEMED: <XCircle className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />,
  CANCELLED: <XCircle className="h-4 w-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />,
};

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

const TYPE_LABELS: Record<string, string> = {
  loyalty_reward: "Loyalty Reward",
  mug_club_perk: "Mug Club Perk",
  promotion: "Promotion",
};

export function CodeEntry({ breweryId }: CodeEntryProps) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [result, setResult] = useState<RedemptionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = code.trim();
      if (!trimmed) return;

      setStatus("loading");
      setError("");
      setErrorCode("");

      try {
        const res = await fetch(
          `/api/brewery/${breweryId}/redemptions/confirm`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: trimmed }),
          }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          setStatus("error");
          setError(data.error || "Invalid code. Please try again.");
          setErrorCode(data.code || "");
          return;
        }

        setResult({
          customer: data.customer,
          type: data.type,
          description: data.description,
          pos_reference: data.pos_reference,
        });
        setStatus("success");
        toastSuccess("Redemption confirmed");
      } catch {
        setStatus("error");
        setError("Something went wrong. Please try again.");
      }
    },
    [code, breweryId, toastSuccess]
  );

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.pos_reference);
      setCopied(true);
      toastSuccess("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toastError("Failed to copy");
    }
  }, [result, toastSuccess, toastError]);

  const handleReset = useCallback(() => {
    setCode("");
    setStatus("idle");
    setError("");
    setErrorCode("");
    setResult(null);
    setCopied(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <AnimatePresence mode="wait">
        {status === "success" && result ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={spring}
            className="flex flex-col items-center gap-5 text-center"
          >
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...spring, delay: 0.1 }}
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--accent-gold)" }}
            >
              <Check className="h-7 w-7" style={{ color: "var(--bg)" }} />
            </motion.div>

            {/* Customer & reward */}
            <div className="space-y-2">
              <p
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {result.customer}
              </p>
              <span
                className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
                style={{ backgroundColor: "var(--surface-2)", color: "var(--text-muted)" }}
              >
                {TYPE_LABELS[result.type] || result.type}
              </span>
              <p
                className="text-xl font-display font-bold"
                style={{ color: "var(--accent-gold)" }}
              >
                {result.description}
              </p>
            </div>

            {/* POS reference */}
            <div className="w-full space-y-1.5">
              <p
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                POS Reference
              </p>
              <button
                type="button"
                onClick={handleCopy}
                className="group flex w-full items-center justify-between rounded-xl px-4 py-3 transition-colors"
                style={{
                  backgroundColor: "var(--surface-2)",
                  border: "1px solid var(--border)",
                }}
              >
                <span
                  className="font-mono text-lg font-bold tracking-widest"
                  style={{ color: "var(--text-primary)" }}
                >
                  Use code {result.pos_reference} on your POS
                </span>
                <span
                  className="ml-3 flex-shrink-0 transition-colors"
                  style={{
                    color: copied ? "var(--accent-gold)" : "var(--text-muted)",
                  }}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </span>
              </button>
            </div>

            {/* Done */}
            <motion.button
              type="button"
              onClick={handleReset}
              whileTap={{ scale: 0.97 }}
              className="mt-1 w-full rounded-xl px-5 py-3 text-sm font-semibold transition-colors"
              style={{
                backgroundColor: "var(--accent-gold)",
                color: "var(--bg)",
              }}
            >
              Done
            </motion.button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={spring}
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-5"
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
              >
                <ScanLine className="h-6 w-6" style={{ color: "var(--accent-gold)" }} />
              </div>
              <div className="text-center space-y-1">
                <h2
                  className="text-xl font-display font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Enter Customer Code
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Type the 5-character code shown on their phone
                </p>
              </div>
            </div>

            {/* Code input */}
            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoFocus
              maxLength={5}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (status === "error") setError("");
              }}
              placeholder="XXXXX"
              className="w-full rounded-xl px-4 py-4 text-center font-mono text-3xl font-bold tracking-[0.3em] uppercase outline-none transition-colors placeholder:tracking-[0.3em]"
              style={{
                backgroundColor: "var(--surface-2)",
                border: `1px solid ${
                  status === "error" ? "var(--danger)" : "var(--border)"
                }`,
                color: "var(--text-primary)",
              }}
              aria-label="Redemption code"
              aria-invalid={status === "error"}
            />

            {/* Error */}
            <AnimatePresence>
              {status === "error" && error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex w-full items-center gap-2 overflow-hidden"
                >
                  {ERROR_ICONS[errorCode] || (
                    <AlertCircle
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: "var(--danger)" }}
                    />
                  )}
                  <p className="text-sm" style={{ color: errorCode === "EXPIRED" ? "var(--accent-amber)" : "var(--danger)" }}>
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={code.trim().length < 5 || status === "loading"}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-40"
              style={{
                backgroundColor: "var(--accent-gold)",
                color: "var(--bg)",
              }}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm Code"
              )}
            </motion.button>

            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Press <kbd className="px-1.5 py-0.5 rounded font-mono text-[10px] border" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>Enter</kbd> to submit
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
