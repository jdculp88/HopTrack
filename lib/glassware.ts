// ─── HopTrack Glassware Library ──────────────────────────────────────────────
// 20 craft beer glass types with SVG art, metadata, and style recommendations.
// SVG paths extracted from Josh's beer_glass_guide.html mockup.
//
// Usage:
//   import { GLASS_TYPES, getGlass, getGlassSvgContent } from "@/lib/glassware";
//
//   const glass = getGlass("shaker_pint");
//   const svgHtml = getGlassSvgContent(glass, `beer-${beer.id}`);
//   // dangerouslySetInnerHTML={{ __html: svgHtml }} on a <svg viewBox="0 0 80 120">

export interface GlassType {
  key: string;
  name: string;
  ozLabel: string;
  aka: string;
  bestFor: string[];
  /** Internal gradient number (1–20) used for SVG ID substitution */
  gradientNum: number;
  /** Raw SVG inner HTML with gradient IDs beer{N} and f{N} */
  svgInner: string;
}

export interface PourSize {
  id?: string;
  beer_id?: string;
  label: string;
  oz: number | null;
  price: number;
  display_order: number;
}

// ─── SVG ID Substitution ──────────────────────────────────────────────────────
// Each glass SVG uses gradient IDs like beer{N} and f{N}.
// When multiple SVGs are on screen at once (e.g. picker grid), IDs must be unique.
// Pass a unique instanceId (e.g. beer.id or glass.key) to namespace the IDs.

export function getGlassSvgContent(glass: GlassType, instanceId: string): string {
  const n = glass.gradientNum;
  const bid = `${glass.key}_${instanceId}_b`;
  const fid = `${glass.key}_${instanceId}_f`;
  return glass.svgInner
    .replace(new RegExp(`id="beer${n}"`, "g"), `id="${bid}"`)
    .replace(new RegExp(`url\\(#beer${n}\\)`, "g"), `url(#${bid})`)
    .replace(new RegExp(`id="f${n}"`, "g"), `id="${fid}"`)
    .replace(new RegExp(`url\\(#f${n}\\)`, "g"), `url(#${fid})`);
}

export function getGlass(key: string): GlassType | undefined {
  return GLASS_TYPES.find(g => g.key === key);
}

export function getGlassName(key: string): string {
  return getGlass(key)?.name ?? key;
}

// ─── Quick-add pour size presets ──────────────────────────────────────────────
export const POUR_PRESETS: Array<{ label: string; oz: number | null }> = [
  { label: "Taster", oz: 5 },
  { label: "Half Pint", oz: 8 },
  { label: "Pint", oz: 16 },
  { label: "Pint", oz: 22 },
  { label: "Growler", oz: 32 },
  { label: "Flight", oz: null },
];

// ─── All 20 Glass Types ───────────────────────────────────────────────────────

export const GLASS_TYPES: GlassType[] = [
  {
    key: "shaker_pint",
    name: "Shaker Pint",
    ozLabel: "16 oz",
    aka: "American Pint · The Workhorse",
    bestFor: ["Pale Ale", "Amber Ale", "Lager", "Stout", "Porter", "Brown Ale"],
    gradientNum: 1,
    svgInner: `<defs><linearGradient id="beer1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E8A832" stop-opacity="0.85"/><stop offset="100%" stop-color="#C08020" stop-opacity="0.95"/></linearGradient><linearGradient id="f1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8E7"/><stop offset="100%" stop-color="#F5E6C0"/></linearGradient></defs><path d="M22 24 L18 100 L62 100 L58 24 Z" fill="url(#beer1)" stroke="#b8962e" stroke-width="1" opacity="0.9"/><path d="M22 24 C26 20, 30 19, 34 21 C38 18, 46 18, 50 21 C54 19, 58 22, 58 24 Z" fill="url(#f1)" stroke="#ddd3b8" stroke-width="0.8"/><path d="M22 24 L18 100 L62 100 L58 24" fill="none" stroke="#a08060" stroke-width="1.5"/><rect x="18" y="100" width="44" height="3" rx="1" fill="#a08060" opacity="0.4"/><rect x="24" y="30" width="3" height="62" rx="1.5" fill="white" opacity="0.06"/>`,
  },
  {
    key: "nonic_pint",
    name: "Nonic Pint",
    ozLabel: "20 oz",
    aka: "English Pint · Imperial Pint",
    bestFor: ["ESB", "Bitter", "Mild", "English IPA", "Stout", "Brown Ale"],
    gradientNum: 2,
    svgInner: `<defs><linearGradient id="beer2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D4883E" stop-opacity="0.85"/><stop offset="100%" stop-color="#A8601A" stop-opacity="0.95"/></linearGradient><linearGradient id="f2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF5E0"/><stop offset="100%" stop-color="#F0DDB8"/></linearGradient></defs><path d="M23 24 L20 65 Q19 72, 22 76 Q25 80, 22 84 L20 100 L60 100 L58 84 Q55 80, 58 76 Q61 72, 60 65 L57 24 Z" fill="url(#beer2)" stroke="#a07030" stroke-width="1" opacity="0.9"/><path d="M23 24 C27 20, 31 19, 35 21 C39 18, 47 18, 51 21 C55 19, 57 22, 57 24 Z" fill="url(#f2)" stroke="#d4c4a0" stroke-width="0.8"/><path d="M23 24 L20 65 Q19 72, 22 76 Q25 80, 22 84 L20 100 L60 100 L58 84 Q55 80, 58 76 Q61 72, 60 65 L57 24" fill="none" stroke="#a07030" stroke-width="1.5"/><rect x="20" y="100" width="40" height="3" rx="1" fill="#a07030" opacity="0.4"/><rect x="25" y="30" width="3" height="32" rx="1.5" fill="white" opacity="0.06"/>`,
  },
  {
    key: "tulip",
    name: "Tulip",
    ozLabel: "12 oz",
    aka: "Belgian Tulip",
    bestFor: ["Belgian Strong", "Saison", "Scotch Ale", "Sour Ale", "Double IPA", "Barleywine"],
    gradientNum: 3,
    svgInner: `<defs><linearGradient id="beer3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C87030" stop-opacity="0.85"/><stop offset="100%" stop-color="#8A4818" stop-opacity="0.95"/></linearGradient><linearGradient id="f3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8EE"/><stop offset="100%" stop-color="#F0DDBB"/></linearGradient></defs><path d="M22 26 Q18 50, 22 65 Q26 75, 34 78 L34 90 L26 92 L26 95 L54 95 L54 92 L46 90 L46 78 Q54 75, 58 65 Q62 50, 58 26 Z" fill="url(#beer3)" stroke="#906040" stroke-width="1" opacity="0.9"/><path d="M22 26 C25 22, 30 20, 35 22 C38 19, 44 19, 48 22 C52 20, 56 23, 58 26 Z" fill="url(#f3)" stroke="#d0c0a0" stroke-width="0.8"/><path d="M22 26 Q18 50, 22 65 Q26 75, 34 78 L34 90 L26 92 L26 95 L54 95 L54 92 L46 90 L46 78 Q54 75, 58 65 Q62 50, 58 26" fill="none" stroke="#906040" stroke-width="1.5"/><rect x="24" y="32" width="3" height="30" rx="1.5" fill="white" opacity="0.06"/>`,
  },
  {
    key: "snifter",
    name: "Snifter",
    ozLabel: "8–12 oz",
    aka: "Brandy Snifter · Cognac Glass",
    bestFor: ["Barleywine", "Imperial Stout", "Belgian Dark", "Old Ale", "Barrel-Aged", "Eisbock"],
    gradientNum: 4,
    svgInner: `<defs><linearGradient id="beer4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3D2216" stop-opacity="0.9"/><stop offset="100%" stop-color="#1A0E08" stop-opacity="1"/></linearGradient><linearGradient id="f4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F5ECD8"/><stop offset="100%" stop-color="#E8D5B0"/></linearGradient></defs><path d="M28 30 Q16 50, 18 65 Q20 78, 34 80 L34 92 L24 94 L24 97 L56 97 L56 94 L46 92 L46 80 Q60 78, 62 65 Q64 50, 52 30 Z" fill="url(#beer4)" stroke="#4a3020" stroke-width="1"/><path d="M28 30 C32 27, 36 26, 40 28 C44 26, 48 27, 52 30 Z" fill="url(#f4)" stroke="#c0a080" stroke-width="0.8"/><path d="M28 30 Q16 50, 18 65 Q20 78, 34 80 L34 92 L24 94 L24 97 L56 97 L56 94 L46 92 L46 80 Q60 78, 62 65 Q64 50, 52 30" fill="none" stroke="#4a3020" stroke-width="1.5"/><rect x="22" y="38" width="3" height="28" rx="1.5" fill="white" opacity="0.05"/>`,
  },
  {
    key: "weizen_glass",
    name: "Weizen Glass",
    ozLabel: "16.9 oz",
    aka: "Wheat Beer Glass · Weißbierglas",
    bestFor: ["Hefeweizen", "Dunkelweizen", "Kristallweizen", "Weizenbock", "Witbier"],
    gradientNum: 5,
    svgInner: `<defs><linearGradient id="beer5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F2D06B" stop-opacity="0.75"/><stop offset="100%" stop-color="#D4A835" stop-opacity="0.9"/></linearGradient><linearGradient id="f5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFEF5"/><stop offset="100%" stop-color="#F8EFD5"/></linearGradient></defs><path d="M30 16 Q22 30, 24 55 Q22 75, 20 85 L20 100 L60 100 L60 85 Q58 75, 56 55 Q58 30, 50 16 Z" fill="url(#beer5)" stroke="#c4a040" stroke-width="1" opacity="0.9"/><path d="M30 16 C33 13, 37 12, 40 14 C43 12, 47 13, 50 16 Z" fill="url(#f5)" stroke="#ddd0a8" stroke-width="0.8"/><path d="M30 16 Q22 30, 24 55 Q22 75, 20 85 L20 100 L60 100 L60 85 Q58 75, 56 55 Q58 30, 50 16" fill="none" stroke="#c4a040" stroke-width="1.5"/><rect x="20" y="100" width="40" height="3" rx="1" fill="#c4a040" opacity="0.35"/><circle cx="35" cy="70" r="1.5" fill="white" opacity="0.12"/><circle cx="42" cy="80" r="1" fill="white" opacity="0.1"/><circle cx="38" cy="60" r="1.2" fill="white" opacity="0.08"/><circle cx="45" cy="90" r="1.3" fill="white" opacity="0.1"/><rect x="26" y="24" width="3" height="55" rx="1.5" fill="white" opacity="0.06"/>`,
  },
  {
    key: "pilsner_glass",
    name: "Pilsner Glass",
    ozLabel: "12 oz",
    aka: "Pilsner Flute",
    bestFor: ["Pilsner", "Lager", "Helles", "Japanese Rice Lager", "Blonde Ale"],
    gradientNum: 6,
    svgInner: `<defs><linearGradient id="beer6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F5CE62" stop-opacity="0.8"/><stop offset="100%" stop-color="#E0B030" stop-opacity="0.9"/></linearGradient><linearGradient id="f6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFF0"/><stop offset="100%" stop-color="#F8F0D8"/></linearGradient></defs><path d="M32 18 L22 98 L58 98 L48 18 Z" fill="url(#beer6)" stroke="#c8a840" stroke-width="1" opacity="0.9"/><path d="M32 18 C35 15, 38 14, 40 16 C42 14, 45 15, 48 18 Z" fill="url(#f6)" stroke="#ddd0a8" stroke-width="0.8"/><path d="M32 18 L22 98 L58 98 L48 18" fill="none" stroke="#c8a840" stroke-width="1.5"/><rect x="22" y="98" width="36" height="3" rx="1" fill="#c8a840" opacity="0.35"/><rect x="30" y="24" width="2" height="65" rx="1" fill="white" opacity="0.07"/><circle cx="38" cy="85" r="0.8" fill="white" opacity="0.15"/><circle cx="40" cy="72" r="0.7" fill="white" opacity="0.12"/><circle cx="39" cy="60" r="0.6" fill="white" opacity="0.1"/><circle cx="41" cy="48" r="0.5" fill="white" opacity="0.08"/>`,
  },
  {
    key: "goblet_chalice",
    name: "Goblet",
    ozLabel: "13 oz",
    aka: "Trappist Glass · Abbey Glass",
    bestFor: ["Belgian Dubbel", "Tripel", "Quad", "Belgian Strong", "Trappist Ale"],
    gradientNum: 7,
    svgInner: `<defs><linearGradient id="beer7" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C87838" stop-opacity="0.85"/><stop offset="100%" stop-color="#8A4A18" stop-opacity="0.95"/></linearGradient><linearGradient id="f7" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8EA"/><stop offset="100%" stop-color="#F0DDB0"/></linearGradient></defs><path d="M16 24 Q14 50, 18 62 Q22 72, 34 74 L34 88 L22 90 Q20 92, 20 94 L60 94 Q60 92, 58 90 L46 88 L46 74 Q58 72, 62 62 Q66 50, 64 24 Z" fill="url(#beer7)" stroke="#906840" stroke-width="1" opacity="0.9"/><path d="M16 24 C20 20, 26 18, 32 20 C36 17, 44 17, 48 20 C54 18, 60 20, 64 24 Z" fill="url(#f7)" stroke="#d4c0a0" stroke-width="0.8"/><path d="M16 24 Q14 50, 18 62 Q22 72, 34 74 L34 88 L22 90 Q20 92, 20 94 L60 94 Q60 92, 58 90 L46 88 L46 74 Q58 72, 62 62 Q66 50, 64 24" fill="none" stroke="#906840" stroke-width="1.5"/><rect x="20" y="30" width="3" height="28" rx="1.5" fill="white" opacity="0.06"/>`,
  },
  {
    key: "ipa_glass",
    name: "IPA Glass",
    ozLabel: "19 oz",
    aka: "Spiegelau IPA Glass",
    bestFor: ["IPA", "Double IPA", "Hazy IPA", "Session IPA", "Pale Ale"],
    gradientNum: 8,
    svgInner: `<defs><linearGradient id="beer8" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E8A832" stop-opacity="0.8"/><stop offset="100%" stop-color="#C88020" stop-opacity="0.95"/></linearGradient><linearGradient id="f8" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8E4"/><stop offset="100%" stop-color="#F0E0B8"/></linearGradient></defs><path d="M26 18 Q30 28, 28 42 Q24 55, 22 65 Q20 78, 24 85 L24 95 L56 95 L56 85 Q60 78, 58 65 Q56 55, 52 42 Q50 28, 54 18 Z" fill="url(#beer8)" stroke="#b88830" stroke-width="1" opacity="0.9"/><path d="M26 18 C30 14, 34 13, 40 15 C46 13, 50 14, 54 18 Z" fill="url(#f8)" stroke="#d4c4a0" stroke-width="0.8"/><path d="M26 18 Q30 28, 28 42 Q24 55, 22 65 Q20 78, 24 85 L24 95 L56 95 L56 85 Q60 78, 58 65 Q56 55, 52 42 Q50 28, 54 18" fill="none" stroke="#b88830" stroke-width="1.5"/><rect x="24" y="95" width="32" height="3" rx="1" fill="#b88830" opacity="0.35"/><line x1="28" y1="85" x2="52" y2="85" stroke="#b88830" stroke-width="0.5" opacity="0.3"/><line x1="26" y1="91" x2="54" y2="91" stroke="#b88830" stroke-width="0.5" opacity="0.2"/><rect x="28" y="24" width="3" height="35" rx="1.5" fill="white" opacity="0.06"/>`,
  },
  {
    key: "stange",
    name: "Stange",
    ozLabel: "6.5 oz",
    aka: "Stick Glass · Kölsch Glass",
    bestFor: ["Kölsch", "Altbier", "Gose", "Delicate Lager"],
    gradientNum: 9,
    svgInner: `<defs><linearGradient id="beer9" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F0C55A" stop-opacity="0.82"/><stop offset="100%" stop-color="#D4A830" stop-opacity="0.92"/></linearGradient><linearGradient id="f9" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFF2"/><stop offset="100%" stop-color="#F8F0D0"/></linearGradient></defs><rect x="28" y="22" width="24" height="78" rx="2" fill="url(#beer9)" stroke="#c0a030" stroke-width="1" opacity="0.9"/><path d="M28 22 C32 19, 36 18, 40 20 C44 18, 48 19, 52 22 Z" fill="url(#f9)" stroke="#ddd0a8" stroke-width="0.8"/><rect x="28" y="22" width="24" height="78" rx="2" fill="none" stroke="#c0a030" stroke-width="1.5"/><rect x="28" y="100" width="24" height="3" rx="1" fill="#c0a030" opacity="0.35"/><rect x="30" y="28" width="2" height="65" rx="1" fill="white" opacity="0.06"/><circle cx="40" cy="88" r="0.6" fill="white" opacity="0.12"/><circle cx="39" cy="76" r="0.5" fill="white" opacity="0.1"/>`,
  },
  {
    key: "mug_stein",
    name: "Mug",
    ozLabel: "12–34 oz",
    aka: "Beer Mug · Maßkrug · Seidel",
    bestFor: ["Märzen", "Oktoberfest", "Dunkel", "Amber Lager", "English Bitter", "Bock"],
    gradientNum: 10,
    svgInner: `<defs><linearGradient id="beer10" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E8B838" stop-opacity="0.85"/><stop offset="100%" stop-color="#C89828" stop-opacity="0.95"/></linearGradient><linearGradient id="f10" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8E0"/><stop offset="100%" stop-color="#F0E0B8"/></linearGradient></defs><rect x="14" y="24" width="36" height="76" rx="3" fill="url(#beer10)" stroke="#a88830" stroke-width="1.5" opacity="0.9"/><path d="M14 24 C18 20, 24 19, 30 21 C36 19, 42 20, 50 24 Z" fill="url(#f10)" stroke="#d4c4a0" stroke-width="0.8"/><rect x="14" y="24" width="36" height="76" rx="3" fill="none" stroke="#a88830" stroke-width="1.8"/><rect x="14" y="100" width="36" height="3" rx="1" fill="#a88830" opacity="0.4"/><path d="M50 36 Q64 38, 66 55 Q66 72, 50 76" fill="none" stroke="#a88830" stroke-width="3.5" stroke-linecap="round"/><path d="M50 36 Q62 37, 64 55 Q64 71, 50 76" fill="none" stroke="#c8a840" stroke-width="1.5" stroke-linecap="round"/><rect x="18" y="30" width="3" height="62" rx="1.5" fill="white" opacity="0.06"/>`,
  },
  {
    key: "flute",
    name: "Flute",
    ozLabel: "6–10 oz",
    aka: "Beer Flute · Champagne-Style",
    bestFor: ["Lambic", "Fruit Lambic", "Gueuze", "Bière de Champagne", "Vienna Lager"],
    gradientNum: 11,
    svgInner: `<defs><linearGradient id="beer11" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F0D878" stop-opacity="0.7"/><stop offset="100%" stop-color="#E0C048" stop-opacity="0.85"/></linearGradient><linearGradient id="f11" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFF5"/><stop offset="100%" stop-color="#F8F0D8"/></linearGradient></defs><path d="M32 14 L30 65 Q30 72, 36 74 L36 88 L28 90 L28 93 L52 93 L52 90 L44 88 L44 74 Q50 72, 50 65 L48 14 Z" fill="url(#beer11)" stroke="#c8b040" stroke-width="1" opacity="0.9"/><path d="M32 14 C35 12, 38 11, 40 13 C42 11, 45 12, 48 14 Z" fill="url(#f11)" stroke="#ddd5b0" stroke-width="0.8"/><path d="M32 14 L30 65 Q30 72, 36 74 L36 88 L28 90 L28 93 L52 93 L52 90 L44 88 L44 74 Q50 72, 50 65 L48 14" fill="none" stroke="#c8b040" stroke-width="1.5"/><circle cx="39" cy="62" r="0.6" fill="white" opacity="0.15"/><circle cx="41" cy="52" r="0.5" fill="white" opacity="0.12"/><circle cx="40" cy="42" r="0.5" fill="white" opacity="0.1"/><circle cx="38" cy="32" r="0.4" fill="white" opacity="0.08"/><rect x="33" y="20" width="2" height="42" rx="1" fill="white" opacity="0.06"/>`,
  },
  {
    key: "teku",
    name: "Teku",
    ozLabel: "11.2 oz",
    aka: "Universal Craft Glass",
    bestFor: ["Any Craft Beer", "IPA", "Sour", "Belgian", "Stout", "Saison"],
    gradientNum: 12,
    svgInner: `<defs><linearGradient id="beer12" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E0A030" stop-opacity="0.82"/><stop offset="100%" stop-color="#B87828" stop-opacity="0.94"/></linearGradient><linearGradient id="f12" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8E8"/><stop offset="100%" stop-color="#F0E0C0"/></linearGradient></defs><path d="M28 20 Q20 40, 22 52 Q24 60, 30 64 Q34 66, 36 70 L36 84 L26 86 L26 89 L54 89 L54 86 L44 84 L44 70 Q46 66, 50 64 Q56 60, 58 52 Q60 40, 52 20 Z" fill="url(#beer12)" stroke="#a87828" stroke-width="1" opacity="0.9"/><path d="M28 20 C32 16, 36 15, 40 17 C44 15, 48 16, 52 20 Z" fill="url(#f12)" stroke="#d0bfa0" stroke-width="0.8"/><path d="M28 20 Q20 40, 22 52 Q24 60, 30 64 Q34 66, 36 70 L36 84 L26 86 L26 89 L54 89 L54 86 L44 84 L44 70 Q46 66, 50 64 Q56 60, 58 52 Q60 40, 52 20" fill="none" stroke="#a87828" stroke-width="1.5"/><rect x="24" y="28" width="2.5" height="24" rx="1.2" fill="white" opacity="0.06"/>`,
  },
  {
    key: "thistle",
    name: "Thistle",
    ozLabel: "10–15 oz",
    aka: "Scottish Ale Glass",
    bestFor: ["Scotch Ale", "Wee Heavy", "Scottish Export", "Strong Ale"],
    gradientNum: 13,
    svgInner: `<defs><linearGradient id="beer13" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#A06030" stop-opacity="0.88"/><stop offset="100%" stop-color="#6A3818" stop-opacity="0.96"/></linearGradient><linearGradient id="f13" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF5E5"/><stop offset="100%" stop-color="#E8D5B0"/></linearGradient></defs><path d="M24 18 Q20 35, 24 50 Q28 60, 32 65 Q36 70, 36 76 L36 88 L28 90 L28 93 L52 93 L52 90 L44 88 L44 76 Q44 70, 48 65 Q52 60, 56 50 Q60 35, 56 18 Z" fill="url(#beer13)" stroke="#785030" stroke-width="1" opacity="0.9"/><path d="M24 18 C28 14, 33 13, 38 15 C43 13, 48 14, 52 16 C55 15, 56 17, 56 18 Z" fill="url(#f13)" stroke="#c8b090" stroke-width="0.8"/><path d="M24 18 Q20 35, 24 50 Q28 60, 32 65 Q36 70, 36 76 L36 88 L28 90 L28 93 L52 93 L52 90 L44 88 L44 76 Q44 70, 48 65 Q52 60, 56 50 Q60 35, 56 18" fill="none" stroke="#785030" stroke-width="1.5"/><rect x="26" y="24" width="2.5" height="26" rx="1.2" fill="white" opacity="0.05"/>`,
  },
  {
    key: "wine_glass",
    name: "Wine Glass",
    ozLabel: "12–22 oz",
    aka: "Red Wine Glass · Balloon",
    bestFor: ["Wild Ale", "Flanders Red", "Oud Bruin", "Barrel-Aged Sour", "Saison"],
    gradientNum: 14,
    svgInner: `<defs><linearGradient id="beer14" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C86030" stop-opacity="0.6"/><stop offset="100%" stop-color="#A04020" stop-opacity="0.85"/></linearGradient><linearGradient id="f14" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8F0"/><stop offset="100%" stop-color="#F0DCC0"/></linearGradient></defs><path d="M24 28 Q18 45, 22 58 Q26 68, 36 70 L36 90 L26 92 L26 95 L54 95 L54 92 L44 90 L44 70 Q54 68, 58 58 Q62 45, 56 28 Z" fill="url(#beer14)" stroke="#905838" stroke-width="1" opacity="0.9"/><path d="M24 28 C28 24, 33 23, 38 25 C43 23, 48 24, 52 26 C55 25, 56 27, 56 28 Z" fill="url(#f14)" stroke="#d0b8a0" stroke-width="0.8"/><path d="M24 28 Q18 45, 22 58 Q26 68, 36 70 L36 90 L26 92 L26 95 L54 95 L54 92 L44 90 L44 70 Q54 68, 58 58 Q62 45, 56 28" fill="none" stroke="#905838" stroke-width="1.5"/><rect x="22" y="35" width="2.5" height="22" rx="1.2" fill="white" opacity="0.06"/>`,
  },
  {
    key: "willi_becher",
    name: "Willi Becher",
    ozLabel: "16.9 oz",
    aka: "Standard German Glass",
    bestFor: ["German Pilsner", "Helles", "Märzen", "Dortmunder", "Schwarzbier"],
    gradientNum: 15,
    svgInner: `<defs><linearGradient id="beer15" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E8B838" stop-opacity="0.82"/><stop offset="100%" stop-color="#C89828" stop-opacity="0.94"/></linearGradient><linearGradient id="f15" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFAE8"/><stop offset="100%" stop-color="#F0E0C0"/></linearGradient></defs><path d="M24 24 L20 80 Q20 90, 22 95 L22 100 L58 100 L58 95 Q60 90, 60 80 L56 24 Z" fill="url(#beer15)" stroke="#b09030" stroke-width="1" opacity="0.9"/><path d="M24 24 C28 21, 33 20, 38 22 C43 20, 48 21, 52 22 C55 21, 56 23, 56 24 Z" fill="url(#f15)" stroke="#d4c8a8" stroke-width="0.8"/><path d="M24 24 L20 80 Q20 90, 22 95 L22 100 L58 100 L58 95 Q60 90, 60 80 L56 24" fill="none" stroke="#b09030" stroke-width="1.5"/><rect x="22" y="100" width="36" height="3" rx="1" fill="#b09030" opacity="0.35"/><rect x="24" y="30" width="3" height="56" rx="1.5" fill="white" opacity="0.06"/>`,
  },
  {
    key: "dimple_mug",
    name: "Dimple Mug",
    ozLabel: "20 oz",
    aka: "Jug · Dimpled Pint Mug",
    bestFor: ["Bitter", "Mild", "English Ale", "Cask Ale", "Porter"],
    gradientNum: 16,
    svgInner: `<defs><linearGradient id="beer16" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D4A038" stop-opacity="0.82"/><stop offset="100%" stop-color="#B88828" stop-opacity="0.94"/></linearGradient><linearGradient id="f16" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8E0"/><stop offset="100%" stop-color="#F0E0B8"/></linearGradient></defs><rect x="14" y="24" width="36" height="76" rx="3" fill="url(#beer16)" stroke="#a88830" stroke-width="1.5" opacity="0.9"/><path d="M14 24 C18 20, 24 19, 30 21 C36 19, 42 20, 50 24 Z" fill="url(#f16)" stroke="#d4c4a0" stroke-width="0.8"/><rect x="14" y="24" width="36" height="76" rx="3" fill="none" stroke="#a88830" stroke-width="1.8"/><rect x="14" y="100" width="36" height="3" rx="1" fill="#a88830" opacity="0.4"/><path d="M50 36 Q64 38, 66 55 Q66 72, 50 76" fill="none" stroke="#a88830" stroke-width="3.5" stroke-linecap="round"/><path d="M50 36 Q62 37, 64 55 Q64 71, 50 76" fill="none" stroke="#c8a840" stroke-width="1.5" stroke-linecap="round"/><circle cx="24" cy="42" r="5" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/><circle cx="36" cy="42" r="5" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/><circle cx="24" cy="56" r="5" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/><circle cx="36" cy="56" r="5" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/><circle cx="24" cy="70" r="5" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/><circle cx="36" cy="70" r="5" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/>`,
  },
  {
    key: "pokal",
    name: "Pokal",
    ozLabel: "12 oz",
    aka: "European Lager Glass",
    bestFor: ["Pilsner", "Bock", "Doppelbock", "Vienna Lager", "Maibock"],
    gradientNum: 17,
    svgInner: `<defs><linearGradient id="beer17" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F0C858" stop-opacity="0.8"/><stop offset="100%" stop-color="#D4A830" stop-opacity="0.92"/></linearGradient><linearGradient id="f17" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFF2"/><stop offset="100%" stop-color="#F8F0D5"/></linearGradient></defs><path d="M28 20 L24 62 Q24 68, 34 70 L34 84 L26 86 L26 89 L54 89 L54 86 L46 84 L46 70 Q56 68, 56 62 L52 20 Z" fill="url(#beer17)" stroke="#c0a040" stroke-width="1" opacity="0.9"/><path d="M28 20 C32 17, 36 16, 40 18 C44 16, 48 17, 52 20 Z" fill="url(#f17)" stroke="#ddd0a8" stroke-width="0.8"/><path d="M28 20 L24 62 Q24 68, 34 70 L34 84 L26 86 L26 89 L54 89 L54 86 L46 84 L46 70 Q56 68, 56 62 L52 20" fill="none" stroke="#c0a040" stroke-width="1.5"/><rect x="30" y="26" width="2" height="36" rx="1" fill="white" opacity="0.06"/>`,
  },
  {
    key: "yard_glass",
    name: "Yard Glass",
    ozLabel: "~48 oz",
    aka: "Yard of Ale · Half Yard",
    bestFor: ["English Ale", "Mild", "Lager", "Pub Challenge"],
    gradientNum: 18,
    svgInner: `<defs><linearGradient id="beer18" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E8B030" stop-opacity="0.8"/><stop offset="100%" stop-color="#C89020" stop-opacity="0.92"/></linearGradient><linearGradient id="f18" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFAE0"/><stop offset="100%" stop-color="#F0E0C0"/></linearGradient></defs><path d="M34 10 L36 70 Q36 76, 34 80 Q28 90, 28 96 Q28 104, 40 106 Q52 104, 52 96 Q52 90, 46 80 Q44 76, 44 70 L46 10 Z" fill="url(#beer18)" stroke="#b89030" stroke-width="1" opacity="0.9"/><path d="M34 10 C36 8, 38 7, 40 9 C42 7, 44 8, 46 10 Z" fill="url(#f18)" stroke="#d4c4a0" stroke-width="0.8"/><path d="M34 10 L36 70 Q36 76, 34 80 Q28 90, 28 96 Q28 104, 40 106 Q52 104, 52 96 Q52 90, 46 80 Q44 76, 44 70 L46 10" fill="none" stroke="#b89030" stroke-width="1.5"/><rect x="36" y="16" width="2" height="50" rx="1" fill="white" opacity="0.06"/>`,
  },
  {
    key: "boot_glass",
    name: "Boot Glass",
    ozLabel: "34–68 oz",
    aka: "Das Boot · Bierstiefel",
    bestFor: ["German Lager", "Helles", "Pilsner", "Wheat Beer", "Party Beer"],
    gradientNum: 19,
    svgInner: `<defs><linearGradient id="beer19" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E0B030" stop-opacity="0.82"/><stop offset="100%" stop-color="#C09020" stop-opacity="0.94"/></linearGradient><linearGradient id="f19" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFAE8"/><stop offset="100%" stop-color="#F0E0C0"/></linearGradient></defs><path d="M26 14 L24 75 Q24 82, 22 86 L16 90 Q12 92, 12 98 Q12 104, 20 106 L56 106 Q62 104, 62 98 L62 92 Q58 86, 54 84 L50 82 L50 14 Z" fill="url(#beer19)" stroke="#a88830" stroke-width="1" opacity="0.9"/><path d="M26 14 C30 11, 34 10, 38 12 C42 10, 46 11, 50 14 Z" fill="url(#f19)" stroke="#d4c4a0" stroke-width="0.8"/><path d="M26 14 L24 75 Q24 82, 22 86 L16 90 Q12 92, 12 98 Q12 104, 20 106 L56 106 Q62 104, 62 98 L62 92 Q58 86, 54 84 L50 82 L50 14" fill="none" stroke="#a88830" stroke-width="1.5"/><rect x="28" y="20" width="3" height="55" rx="1.5" fill="white" opacity="0.05"/>`,
  },
  {
    key: "sam_adams_pint",
    name: "SA Perfect Pint",
    ozLabel: "16 oz",
    aka: "Boston Lager Glass",
    bestFor: ["Boston Lager", "Amber Lager", "Pale Ale", "Vienna Lager", "Amber Ale"],
    gradientNum: 20,
    svgInner: `<defs><linearGradient id="beer20" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D4903A" stop-opacity="0.85"/><stop offset="100%" stop-color="#A86820" stop-opacity="0.95"/></linearGradient><linearGradient id="f20" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8EA"/><stop offset="100%" stop-color="#F0DDB8"/></linearGradient></defs><path d="M24 22 Q22 45, 20 65 Q18 80, 20 90 L20 100 L60 100 L60 90 Q62 80, 60 65 Q58 45, 56 22 Z" fill="url(#beer20)" stroke="#a07030" stroke-width="1" opacity="0.9"/><path d="M24 22 C27 19, 31 18, 36 20 C40 17, 46 17, 50 20 C54 18, 56 20, 56 22 Z" fill="url(#f20)" stroke="#d4c0a0" stroke-width="0.8"/><path d="M24 22 Q22 45, 20 65 Q18 80, 20 90 L20 100 L60 100 L60 90 Q62 80, 60 65 Q58 45, 56 22" fill="none" stroke="#a07030" stroke-width="1.5"/><rect x="20" y="100" width="40" height="3" rx="1" fill="#a07030" opacity="0.35"/><circle cx="40" cy="94" r="3" fill="none" stroke="white" stroke-width="0.5" opacity="0.12"/><rect x="24" y="28" width="3" height="55" rx="1.5" fill="white" opacity="0.06"/>`,
  },
];
