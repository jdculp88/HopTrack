import Image from "next/image";
import { cn, getInitials, generateGradientFromString } from "@/lib/utils";
import { getLevelFromXP } from "@/lib/xp";

interface UserAvatarProps {
  profile: {
    display_name: string;
    avatar_url?: string | null;
    level?: number;
    xp?: number;
    username?: string;
  };
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showLevel?: boolean;
  className?: string;
}

const SIZES = {
  xs:  { container: "w-6 h-6",   text: "text-xs",  badge: "text-[8px] min-w-[14px] h-[14px] -bottom-0.5 -right-0.5" },
  sm:  { container: "w-8 h-8",   text: "text-sm",  badge: "text-[9px] min-w-[16px] h-[16px] -bottom-0.5 -right-0.5" },
  md:  { container: "w-10 h-10", text: "text-base", badge: "text-[10px] min-w-[18px] h-[18px] -bottom-1 -right-1" },
  lg:  { container: "w-14 h-14", text: "text-xl",  badge: "text-xs min-w-[22px] h-[22px] -bottom-1 -right-1" },
  xl:  { container: "w-20 h-20", text: "text-2xl", badge: "text-sm min-w-[28px] h-[28px] -bottom-1 -right-1" },
};

export function UserAvatar({ profile, size = "md", showLevel = false, className }: UserAvatarProps) {
  const s = SIZES[size];
  const level = profile.level ?? (profile.xp !== undefined ? getLevelFromXP(profile.xp).level : 1);
  const gradient = generateGradientFromString(profile.display_name + (profile.username ?? ""));

  return (
    <div className={cn("relative inline-flex flex-shrink-0", className)}>
      <div
        className={cn(
          s.container,
          "rounded-full overflow-hidden flex items-center justify-center",
          "border-2 border-[var(--border)]"
        )}
        style={!profile.avatar_url ? { background: gradient } : undefined}
      >
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.display_name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <span className={cn("font-display font-bold text-white/90", s.text)}>
            {getInitials(profile.display_name)}
          </span>
        )}
      </div>

      {showLevel && (
        <div
          className={cn(
            "absolute flex items-center justify-center rounded-full",
            "bg-[#D4A843] text-[#0F0E0C] font-mono font-bold",
            "border border-[#0F0E0C] leading-none px-1",
            s.badge
          )}
        >
          {level}
        </div>
      )}
    </div>
  );
}

// Stacked avatar group
export function AvatarStack({
  profiles,
  max = 4,
  size = "sm",
  className,
}: {
  profiles: UserAvatarProps["profile"][];
  max?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const visible = profiles.slice(0, max);
  const overflow = profiles.length - max;

  const OVERLAP = { xs: "-ml-2", sm: "-ml-2.5", md: "-ml-3" };

  return (
    <div className={cn("flex", className)}>
      {visible.map((p, i) => (
        <div key={i} className={cn("border-2 border-[#0F0E0C] rounded-full", i > 0 && OVERLAP[size])}>
          <UserAvatar profile={p} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            SIZES[size].container,
            "border-2 border-[#0F0E0C] rounded-full flex items-center justify-center",
            "bg-[var(--surface-2)] text-[var(--text-secondary)] font-mono font-bold",
            OVERLAP[size],
            SIZES[size].text
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
