"use client";

import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

interface ClaimConfirmStepProps {
  businessEmail: string;
  role: "owner" | "manager";
  notes: string;
  submitting: boolean;
  error: string | null;
  onBusinessEmailChange: (value: string) => void;
  onRoleChange: (role: "owner" | "manager") => void;
  onNotesChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function ClaimConfirmStep({
  businessEmail,
  role,
  notes,
  submitting,
  error,
  onBusinessEmailChange,
  onRoleChange,
  onNotesChange,
  onSubmit,
  onBack,
}: ClaimConfirmStepProps) {
  return (
    <>
      {/* Claim form */}
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border p-6 space-y-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div>
          <p
            className="text-xs font-mono uppercase tracking-wider mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            Confirm Ownership
          </p>
          <div className="space-y-4">
            <Input
              label="Business Email"
              type="email"
              required
              value={businessEmail}
              onChange={(e) => onBusinessEmailChange(e.target.value)}
              placeholder="you@yourbrewery.com"
              hint="Use an email address associated with the brewery."
            />

            {/* Role selector */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-medium font-sans"
                style={{ color: "var(--text-secondary)" }}
              >
                Your Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["owner", "manager"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onRoleChange(r)}
                    className="py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-150 capitalize"
                    style={
                      role === r
                        ? {
                            background: "var(--accent-gold)",
                            color: "var(--bg)",
                            borderColor: "var(--accent-gold)",
                          }
                        : {
                            background: "var(--bg)",
                            color: "var(--text-secondary)",
                            borderColor: "var(--border)",
                          }
                    }
                  >
                    {r === "owner" ? "Owner" : "Manager"}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Notes (optional)"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Tell us about your role at the brewery..."
              rows={3}
              hint="Any additional context that helps us verify your claim faster."
            />
          </div>
        </div>

        {error && (
          <p className="text-sm" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            icon={<ArrowLeft size={14} />}
          >
            Back
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            fullWidth
          >
            Submit Claim
          </Button>
        </div>
      </form>

      {/* Trial info below form */}
      <div
        className="rounded-2xl border p-4 flex items-center gap-3"
        style={{
          background: "color-mix(in srgb, var(--accent-gold) 5%, var(--surface))",
          borderColor: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
        >
          <Sparkles size={16} style={{ color: "var(--accent-gold)" }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--accent-gold)" }}>14-day free trial</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Full Tap tier access. No credit card. Cancel anytime.
          </p>
        </div>
      </div>
    </>
  );
}
