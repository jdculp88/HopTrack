"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn, formatCount } from "@/lib/utils";

interface StatBlockProps {
  value: number | string;
  label: string;
  suffix?: string;
  prefix?: string;
  animate?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "gold" | "white" | "amber";
  className?: string;
}

const SIZES = {
  sm:  { value: "text-3xl",  label: "text-sm" },
  md:  { value: "text-5xl",  label: "text-base" },
  lg:  { value: "text-7xl",  label: "text-lg" },
  xl:  { value: "text-8xl",  label: "text-xl" },
};

const COLORS = {
  gold:  "text-[#D4A843]",
  white: "text-[var(--text-primary)]",
  amber: "text-[#E8841A]",
};

function useCountUp(target: number, duration = 1200, trigger: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const startTime = performance.now();

    function update(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setCount(current);
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }, [target, duration, trigger]);

  return count;
}

export function StatBlock({
  value,
  label,
  suffix = "",
  prefix = "",
  animate = true,
  size = "md",
  color = "gold",
  className,
}: StatBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const isNumeric = typeof value === "number";
  const count = useCountUp(isNumeric ? (value as number) : 0, 1200, animate && inView && isNumeric);
  const displayValue = animate && isNumeric && inView ? count : value;

  return (
    <motion.div
      ref={ref}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex flex-col gap-1", className)}
    >
      <div
        className={cn(
          "font-display font-bold leading-none tracking-tight",
          SIZES[size].value,
          COLORS[color]
        )}
      >
        {prefix}
        {isNumeric ? formatCount(displayValue as number) : displayValue}
        {suffix}
      </div>
      <div className={cn("text-[var(--text-secondary)] font-sans", SIZES[size].label)}>{label}</div>
    </motion.div>
  );
}
