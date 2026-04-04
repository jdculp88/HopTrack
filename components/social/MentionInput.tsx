"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface MentionUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function MentionInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Add a comment...",
  disabled = false,
  style,
}: MentionInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [mentionStart, setMentionStart] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect @ trigger
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onChange(val);

      // Find the last @ that's either at the start or preceded by a space
      const cursorPos = e.target.selectionStart ?? val.length;
      const textBefore = val.slice(0, cursorPos);
      const lastAt = textBefore.lastIndexOf("@");

      if (lastAt >= 0 && (lastAt === 0 || textBefore[lastAt - 1] === " ")) {
        const query = textBefore.slice(lastAt + 1);
        // Only show picker if the query doesn't contain spaces
        if (!query.includes(" ") && query.length <= 20) {
          setMentionStart(lastAt);
          setMentionQuery(query);
          setShowPicker(true);
          return;
        }
      }

      setShowPicker(false);
    },
    [onChange],
  );

  // Fetch friend suggestions
  useEffect(() => {
    if (!showPicker || mentionQuery.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/users/search?q=${encodeURIComponent(mentionQuery)}&limit=5`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data: any) => {
          setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []);
        })
        .catch(() => setSuggestions([]));
    }, 200);

    return () => clearTimeout(timer);
  }, [showPicker, mentionQuery]);

  const handleSelect = useCallback(
    (user: MentionUser) => {
      const before = value.slice(0, mentionStart);
      const after = value.slice(mentionStart + mentionQuery.length + 1); // +1 for @
      onChange(`${before}@${user.username} ${after}`);
      setShowPicker(false);
      inputRef.current?.focus();
    },
    [value, mentionStart, mentionQuery, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !showPicker) {
        e.preventDefault();
        onSubmit();
      }
      if (e.key === "Escape") {
        setShowPicker(false);
      }
    },
    [showPicker, onSubmit],
  );

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
        style={{
          background: "var(--surface-2)",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
          ...style,
        }}
      />

      <AnimatePresence>
        {showPicker && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute left-0 right-0 bottom-full mb-1 rounded-xl border shadow-lg overflow-hidden z-50"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {suggestions.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                <UserAvatar
                  profile={{
                    display_name: user.display_name ?? user.username,
                    avatar_url: user.avatar_url,
                    username: user.username,
                  }}
                  size="xs"
                />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{user.display_name ?? user.username}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>@{user.username}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Extract @username mentions from comment text.
 */
export function extractMentions(text: string): string[] {
  const matches = text.match(/@([a-zA-Z0-9_]+)/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1)))];
}
