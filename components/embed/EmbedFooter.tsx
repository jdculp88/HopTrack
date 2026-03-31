import type { CreamColors } from "@/lib/board-helpers";

interface EmbedFooterProps {
  breweryId: string;
  colors: CreamColors;
}

export function EmbedFooter({ breweryId, colors }: EmbedFooterProps) {
  return (
    <div style={{
      borderTop: `1px solid ${colors.border}`,
      padding: "12px 0 4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    }}>
      <a
        href={`/brewery-welcome/${breweryId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hoptrack-footer-link"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          textDecoration: "none",
          opacity: 0.6,
        }}
      >
        {/* Inline HopTrack mark — tiny, no component dependency */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke={colors.gold} strokeWidth="2" />
          <circle cx="12" cy="12" r="4" fill={colors.gold} />
        </svg>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: colors.textSubtle,
        }}>
          Powered by HopTrack
        </span>
      </a>
    </div>
  );
}
