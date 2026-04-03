"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

interface HelpIconProps {
  /** Inline tooltip text */
  tooltip?: string;
  /** Link to help section (e.g. "/brewery-admin/.../resources#guides") */
  href?: string;
  size?: number;
}

export function HelpIcon({ tooltip, href, size = 14 }: HelpIconProps) {
  const icon = (
    <div
      className="inline-flex items-center justify-center rounded-full cursor-help transition-colors hover:opacity-80"
      style={{
        width: size + 8,
        height: size + 8,
        border: "1px solid color-mix(in srgb, var(--accent-gold) 40%, transparent)",
        color: "var(--accent-gold)",
      }}
    >
      <HelpCircle size={size} />
    </div>
  );

  // Tooltip + link: show tooltip with "Learn more" hint
  if (tooltip && href) {
    return (
      <Tooltip text={tooltip} position="bottom">
        <Link href={href} aria-label="Help">
          {icon}
        </Link>
      </Tooltip>
    );
  }

  // Tooltip only
  if (tooltip) {
    return <Tooltip text={tooltip} position="bottom">{icon}</Tooltip>;
  }

  // Link only
  if (href) {
    return (
      <Link href={href} aria-label="Help">
        {icon}
      </Link>
    );
  }

  return icon;
}
