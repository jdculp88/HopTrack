/**
 * View Transitions API utilities.
 * Sprint 156 — The Triple Shot
 */

/** Check if the browser supports the View Transitions API */
export function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

/** Apply a view-transition-name to enable shared element transitions */
export function viewTransitionName(id: string): React.CSSProperties {
  return { viewTransitionName: id } as React.CSSProperties;
}
