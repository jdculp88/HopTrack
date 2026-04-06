// Single source of truth for all Framer Motion animation configs

// Spring presets
export const spring = {
  // Default — cards, buttons, most interactive elements
  default: { type: "spring" as const, stiffness: 400, damping: 30 },
  // Snappy — small UI elements, chips, toggles
  snappy: { type: "spring" as const, stiffness: 500, damping: 35 },
  // Gentle — page transitions, large panels
  gentle: { type: "spring" as const, stiffness: 280, damping: 28 },
  // Bouncy — celebrations, achievements
  bouncy: { type: "spring" as const, stiffness: 600, damping: 20 },
} as const;

// Transition presets (non-spring)
export const transition = {
  fast: { duration: 0.15 },
  normal: { duration: 0.3 },
  slow: { duration: 0.5 },
} as const;

// Page/panel enter animations
export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
} as const;

// Stagger container — for animating lists of children
export const stagger = {
  container: (staggerChildren = 0.06) => ({
    animate: { transition: { staggerChildren } },
  }),
  item: variants.slideUp,
} as const;

// Card hover states
export const cardHover = {
  default: { y: -3, scale: 1.01 },
  featured: { y: -4 },
  compact: { y: -2, scale: 1.01 },
} as const;

// Micro-interaction presets — Sprint 169 (The Details)
export const microInteraction = {
  /** Button press feedback */
  press: { scale: 0.97 },
  /** Icon tap feedback */
  tap: { scale: 0.95 },
  /** Toggle/switch animation */
  toggle: { scale: 0.92 },
  /** Subtle feedback for selection changes */
  select: { scale: 0.98 },
} as const;
