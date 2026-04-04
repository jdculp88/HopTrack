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

/** Get a unique view-transition-name for a brewery shared element — Sprint 157 */
export function breweryTransitionName(id: string): React.CSSProperties {
  return { viewTransitionName: `brewery-${id}` } as React.CSSProperties;
}

/** Get a unique view-transition-name for a beer shared element — Sprint 157 */
export function beerTransitionName(id: string): React.CSSProperties {
  return { viewTransitionName: `beer-${id}` } as React.CSSProperties;
}
