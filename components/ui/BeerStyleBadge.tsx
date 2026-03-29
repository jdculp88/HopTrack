import { cn } from "@/lib/utils";
import type { BeerStyle } from "@/types/database";

const STYLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "IPA":               { bg: "color-mix(in srgb, var(--accent-amber) 15%, transparent)", text: "var(--accent-amber)", border: "color-mix(in srgb, var(--accent-amber) 30%, transparent)" },
  "Double IPA":        { bg: "color-mix(in srgb, var(--accent-amber) 20%, transparent)",  text: "var(--accent-amber)", border: "color-mix(in srgb, var(--accent-amber) 40%, transparent)" },
  "Hazy IPA":          { bg: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", text: "var(--accent-gold)", border: "color-mix(in srgb, var(--accent-gold) 30%, transparent)" },
  "Session IPA":       { bg: "color-mix(in srgb, var(--accent-amber) 12%, transparent)", text: "var(--accent-amber)", border: "color-mix(in srgb, var(--accent-amber) 25%, transparent)" },
  "Stout":             { bg: "rgba(30,20,10,0.6)",    text: "var(--text-secondary)", border: "rgba(90,70,50,0.5)" },
  "Imperial Stout":    { bg: "rgba(20,10,5,0.7)",     text: "var(--text-secondary)", border: "rgba(80,60,40,0.6)" },
  "Porter":            { bg: "rgba(40,25,15,0.6)",    text: "var(--text-secondary)", border: "rgba(100,75,50,0.5)" },
  "Lager":             { bg: "rgba(240,220,150,0.12)", text: "var(--accent-gold)", border: "rgba(240,220,150,0.25)" },
  "Pilsner":           { bg: "rgba(240,230,160,0.12)", text: "#D4C870", border: "rgba(240,230,160,0.25)" },
  "Sour":              { bg: "rgba(220,60,80,0.15)",  text: "#E06070", border: "rgba(220,60,80,0.3)" },
  "Gose":              { bg: "rgba(220,80,90,0.12)",  text: "#E07080", border: "rgba(220,80,90,0.25)" },
  "Berliner Weisse":   { bg: "rgba(200,60,80,0.12)",  text: "#D06070", border: "rgba(200,60,80,0.25)" },
  "Wheat":             { bg: "rgba(220,200,160,0.15)", text: "#C8B870", border: "rgba(220,200,160,0.3)" },
  "Hefeweizen":        { bg: "rgba(210,190,150,0.15)", text: "#C0A860", border: "rgba(210,190,150,0.3)" },
  "Belgian":           { bg: "rgba(200,170,80,0.15)", text: "var(--accent-gold)", border: "rgba(200,170,80,0.3)" },
  "Saison":            { bg: "rgba(220,180,100,0.12)", text: "#D0A850", border: "rgba(220,180,100,0.25)" },
  "Amber":             { bg: "rgba(180,80,30,0.15)",  text: "#D06030", border: "rgba(180,80,30,0.3)" },
  "Red Ale":           { bg: "rgba(180,50,30,0.15)",  text: "#C04030", border: "rgba(180,50,30,0.3)" },
  "Pale Ale":          { bg: "rgba(200,160,80,0.15)", text: "#C09840", border: "rgba(200,160,80,0.3)" },
  "Blonde Ale":        { bg: "rgba(230,210,150,0.12)", text: "#C8A040", border: "rgba(230,210,150,0.25)" },
  "Cream Ale":         { bg: "rgba(230,220,180,0.12)", text: "#C0A840", border: "rgba(230,220,180,0.25)" },
  "Barleywine":        { bg: "rgba(150,60,20,0.2)",   text: "#C05020", border: "rgba(150,60,20,0.4)" },
  "Kolsch":            { bg: "rgba(220,210,170,0.12)", text: "#C0A840", border: "rgba(220,210,170,0.25)" },
  "Cider":             { bg: "rgba(120,180,80,0.15)", text: "#80B840", border: "rgba(120,180,80,0.3)" },
  "Mead":              { bg: "rgba(200,170,60,0.15)", text: "#D0A030", border: "rgba(200,170,60,0.3)" },
  "Other":             { bg: "rgba(106,100,86,0.2)",  text: "var(--text-secondary)", border: "rgba(106,100,86,0.35)" },
};

const DEFAULT_STYLE = { bg: "rgba(106,100,86,0.2)", text: "var(--text-secondary)", border: "rgba(106,100,86,0.35)" };

interface BeerStyleBadgeProps {
  style: BeerStyle | string | null;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function BeerStyleBadge({ style, size = "sm", className }: BeerStyleBadgeProps) {
  if (!style) return null;
  const colors = STYLE_COLORS[style] ?? DEFAULT_STYLE;

  const sizeClasses = {
    xs: "text-xs px-1.5 py-0.5",
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium font-sans leading-none",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {style}
    </span>
  );
}
