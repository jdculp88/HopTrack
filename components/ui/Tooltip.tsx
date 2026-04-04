"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { transition } from "@/lib/animation";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

const positionStyles = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
} as const;

export function Tooltip({ text, children, position = "top" }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onPointerDown={(e) => {
        // Tap-to-toggle on mobile
        if (e.pointerType === "touch") {
          e.preventDefault();
          setOpen((v) => !v);
        }
      }}
    >
      <div aria-describedby={open ? id : undefined}>{children}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={transition.fast}
            className={`absolute z-50 max-w-[280px] px-3 py-2 rounded-xl text-xs leading-relaxed pointer-events-none ${positionStyles[position]}`}
            style={{
              background: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
