"use client";

import { useState } from "react";
import { Users, Plus, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

interface BrandOnboardingStepTeamProps {
  brandId: string;
  onComplete: () => void;
}

interface AddedMember {
  id: string;
  emailOrUsername: string;
  role: string;
}

const ROLE_OPTIONS = [
  { value: "brand_manager", label: "Brand Manager" },
  { value: "regional_manager", label: "Regional Manager" },
] as const;

export function BrandOnboardingStepTeam({ brandId, onComplete }: BrandOnboardingStepTeamProps) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [role, setRole] = useState<string>("brand_manager");
  const [adding, setAdding] = useState(false);
  const [addedMembers, setAddedMembers] = useState<AddedMember[]>([]);
  const { success, error: showError } = useToast();

  async function handleAdd() {
    if (!emailOrUsername.trim()) return;

    setAdding(true);
    try {
      const res = await fetch(`/api/brand/${brandId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_or_username: emailOrUsername.trim(),
          role,
        }),
      });

      if (res.ok) {
        const member: AddedMember = {
          id: crypto.randomUUID(),
          emailOrUsername: emailOrUsername.trim(),
          role,
        };
        setAddedMembers((prev) => [...prev, member]);
        setEmailOrUsername("");
        success(`Invited ${member.emailOrUsername}!`);
        onComplete();
      } else {
        const data = await res.json();
        showError(data.error || "Failed to invite member");
      }
    } catch {
      showError("Failed to invite member");
    }
    setAdding(false);
  }

  function removeMember(id: string) {
    setAddedMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center mb-2">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
          style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
        >
          <Users size={20} style={{ color: "var(--accent-gold)" }} />
        </div>
        <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Invite your team
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Brand managers and regional managers can help manage your locations.
        </p>
      </div>

      {/* Add member form */}
      <div className="rounded-xl border p-3 space-y-3" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Email or username
          </label>
          <input
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder="colleague@brewery.com or username"
            className="w-full px-3 py-2 rounded-xl text-sm outline-none border"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Role
          </label>
          <div className="flex gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRole(opt.value)}
                className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
                style={{
                  borderColor: role === opt.value ? "var(--accent-gold)" : "var(--border)",
                  color: role === opt.value ? "var(--accent-gold)" : "var(--text-secondary)",
                  background: role === opt.value ? "color-mix(in srgb, var(--accent-gold) 10%, transparent)" : "transparent",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={!emailOrUsername.trim() || adding}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }}
        >
          {adding ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Invite Member
        </button>
      </div>

      {/* Added members */}
      {addedMembers.length > 0 && (
        <div className="space-y-1.5">
          <AnimatePresence>
            {addedMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
              >
                <Users size={14} style={{ color: "var(--accent-gold)" }} />
                <span className="text-sm flex-1 truncate" style={{ color: "var(--text-primary)" }}>
                  {member.emailOrUsername}
                </span>
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {member.role === "brand_manager" ? "Manager" : "Regional"}
                </span>
                <button onClick={() => removeMember(member.id)} className="p-0.5" style={{ color: "var(--text-muted)" }}>
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Skip hint */}
      <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
        This step is optional — you can invite team members anytime from Brand Team.
      </p>
    </div>
  );
}
