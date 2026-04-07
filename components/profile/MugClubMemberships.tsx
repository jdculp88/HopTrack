"use client";

import { motion } from "motion/react";
import { Crown, MapPin } from "lucide-react";
import Link from "next/link";

interface MugClubMembership {
  id: string;
  status: string;
  joined_at: string;
  expires_at: string | null;
  mug_club: {
    id: string;
    name: string;
    brewery_id: string;
    annual_fee: number;
    perks: string[];
  } | null;
  brewery?: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
  } | null;
}

interface MugClubMembershipsProps {
  memberships: MugClubMembership[];
}

export function MugClubMemberships({ memberships }: MugClubMembershipsProps) {
  const active = memberships.filter((m) => m.status === "active");
  if (active.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
        <Crown size={18} style={{ color: "var(--accent-gold)" }} />
        Mug Club Member
      </h2>
      <div className="space-y-2">
        {active.map((membership, i) => (
          <motion.div
            key={membership.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
          >
            <Link href={`/brewery/${membership.mug_club?.brewery_id}`}>
              <div
                className="rounded-2xl px-4 py-3 border transition-colors hover:border-[var(--accent-gold)]/30"
                style={{
                  background: "var(--card-bg)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                    }}
                  >
                    <Crown size={18} style={{ color: "var(--accent-gold)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm text-[var(--text-primary)] truncate">
                      {membership.mug_club?.name ?? "Mug Club"}
                    </p>
                    {membership.brewery && (
                      <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                        <MapPin size={10} />
                        {membership.brewery.name}
                        {membership.brewery.city && ` · ${membership.brewery.city}, ${membership.brewery.state}`}
                      </p>
                    )}
                  </div>
                  <div
                    className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold"
                    style={{
                      background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                      color: "var(--accent-gold)",
                      border: "1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)",
                    }}
                  >
                    Active
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
