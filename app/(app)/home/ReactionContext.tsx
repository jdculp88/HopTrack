"use client";

import { createContext, useContext } from "react";

interface ReactionContextValue {
  reactionCounts: Record<string, Record<string, number>>;
  userReactions: Record<string, string[]>;
  commentCounts: Record<string, number>;
}

const ReactionContext = createContext<ReactionContextValue>({
  reactionCounts: {},
  userReactions: {},
  commentCounts: {},
});

export function ReactionProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ReactionContextValue;
}) {
  return (
    <ReactionContext.Provider value={value}>
      {children}
    </ReactionContext.Provider>
  );
}

export function useReactions() {
  return useContext(ReactionContext);
}
