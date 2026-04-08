import Link from "next/link";

interface FeedCardMetaProps {
  username: string;
  displayName: string;
  timestamp: string;
  contextText?: string | null;
  profileLinkable?: boolean;
}

/**
 * Reusable header meta block for feed cards.
 * Design spec: username 14px/600/text-primary on line 1,
 * combined meta line (JetBrains Mono, 10.5px, text-muted) on line 2.
 * Format: "2h ago · Context text"
 */
export function FeedCardMeta({
  username,
  displayName,
  timestamp,
  contextText,
  profileLinkable = true,
}: FeedCardMetaProps) {
  const nameEl = (
    <span
      className="font-sans font-semibold hover:underline underline-offset-2 transition-colors"
      style={{ fontSize: "14px", color: "var(--text-primary)" }}
    >
      {displayName}
    </span>
  );

  const metaParts = [timestamp, contextText].filter(Boolean).join(" · ");

  return (
    <div className="flex-1 min-w-0">
      <div>
        {profileLinkable ? (
          <Link href={`/profile/${username}`}>{nameEl}</Link>
        ) : (
          nameEl
        )}
      </div>
      {metaParts && (
        <p
          className="font-mono mt-0.5"
          style={{ fontSize: "10.5px", color: "var(--text-muted)" }}
        >
          {metaParts}
        </p>
      )}
    </div>
  );
}
