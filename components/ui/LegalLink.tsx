import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

type LegalPath = "/terms" | "/privacy" | "/dmca";

interface LegalLinkProps {
  href: LegalPath;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Link to a legal page (Terms, Privacy, DMCA). Always opens in a new tab so
 * users don't lose their place inside a signup form, consent modal, or other
 * mid-flow UX. Centralized so every call site stays aligned.
 *
 * Why this exists: same-tab navigation to a legal page from inside a form or
 * modal is a sad-path bug — users hit back, lose state, and either rage-quit
 * or refill the form. The new-tab pattern is the standard fix and we want it
 * applied consistently across every footer and consent surface.
 *
 * If you ever need to render a legal link inline in body copy where new-tab
 * is overkill (e.g. a static marketing page that's not in a flow), use a
 * plain `<Link>` directly — that's a deliberate choice.
 */
export function LegalLink({ href, children, className, style }: LegalLinkProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
    >
      {children}
    </Link>
  );
}
