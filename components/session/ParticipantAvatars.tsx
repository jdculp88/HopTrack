"use client";

import Image from "next/image";
import { cn, getInitials, generateGradientFromString } from "@/lib/utils";
import type { SessionParticipant } from "@/types/database";

interface ParticipantAvatarsProps {
  participants: SessionParticipant[];
  maxShow?: number;
  size?: "xs" | "sm";
  className?: string;
}

const SIZES = {
  xs: { container: "w-6 h-6", text: "text-[9px]", offset: "-ml-1.5" },
  sm: { container: "w-7 h-7", text: "text-[10px]", offset: "-ml-2" },
};

export function ParticipantAvatars({
  participants,
  maxShow = 3,
  size = "sm",
  className,
}: ParticipantAvatarsProps) {
  const accepted = participants.filter((p) => p.status === "accepted");
  if (accepted.length === 0) return null;

  const visible = accepted.slice(0, maxShow);
  const overflow = accepted.length - maxShow;
  const s = SIZES[size];

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((p, i) => {
        const profile = p.profile;
        const displayName = profile?.display_name ?? profile?.username ?? "?";
        const gradient = generateGradientFromString(displayName + (profile?.username ?? ""));

        return (
          <div
            key={p.id}
            className={cn(
              s.container,
              "relative rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center",
              "border-2",
              i > 0 && s.offset
            )}
            style={{
              borderColor: "var(--bg)",
              background: profile?.avatar_url ? undefined : gradient,
              zIndex: visible.length - i,
            }}
            title={displayName}
          >
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={displayName}
                fill
                className="object-cover"
              />
            ) : (
              <span className={cn(s.text, "font-bold text-white select-none")}>
                {getInitials(displayName)}
              </span>
            )}
          </div>
        );
      })}

      {overflow > 0 && (
        <span
          className={cn("ml-1.5 text-xs font-medium tabular-nums")}
          style={{ color: "var(--text-muted)" }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
