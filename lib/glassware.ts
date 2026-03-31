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
  /** Internal gradient number (1–53) used for SVG ID substitution */
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

// ─── All 53 Glass Types ───────────────────────────────────────────────────────

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

  // ─── Cider Glasses (new) ─────────────────────────────────────────────────────
  {
    key: "white_wine_glass",
    name: "White Wine Glass",
    ozLabel: "12–15 oz",
    aka: "All-Purpose Wine Glass · Chardonnay Glass",
    bestFor: ["Cider", "White Wine", "Sparkling Cider", "Rosé Cider", "Chardonnay"],
    gradientNum: 21,
    svgInner: `<defs><linearGradient id="beer21" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E8C870" stop-opacity="0.55"/><stop offset="100%" stop-color="#C8A840" stop-opacity="0.75"/></linearGradient><linearGradient id="f21" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFF5"/><stop offset="100%" stop-color="#F5F0DC"/></linearGradient></defs><path d="M27 26 Q21 42, 24 56 Q27 66, 36 68 L36 88 L28 90 L28 93 L52 93 L52 90 L44 88 L44 68 Q53 66, 56 56 Q59 42, 53 26 Z" fill="url(#beer21)" stroke="#a09060" stroke-width="1" opacity="0.88"/><path d="M27 26 C31 23, 35 22, 40 24 C45 22, 49 23, 53 26 Z" fill="url(#f21)" stroke="#d5cdb0" stroke-width="0.8"/><path d="M27 26 Q21 42, 24 56 Q27 66, 36 68 L36 88 L28 90 L28 93 L52 93 L52 90 L44 88 L44 68 Q53 66, 56 56 Q59 42, 53 26" fill="none" stroke="#a09060" stroke-width="1.5"/><rect x="25" y="33" width="2.5" height="20" rx="1.2" fill="white" opacity="0.06"/>`,
  },
  {
    key: "sidra_glass",
    name: "Sidra Glass",
    ozLabel: "6 oz",
    aka: "Vaso de Sidra · Basque Tumbler",
    bestFor: ["Spanish Cider", "Basque Cider", "Farmhouse Cider", "Natural Cider"],
    gradientNum: 22,
    svgInner: `<defs><linearGradient id="beer22" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D4C870" stop-opacity="0.6"/><stop offset="100%" stop-color="#B0A840" stop-opacity="0.8"/></linearGradient><linearGradient id="f22" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFF5"/><stop offset="100%" stop-color="#F5F0DC"/></linearGradient></defs><path d="M22 45 L20 100 L60 100 L58 45 Z" fill="url(#beer22)" stroke="#a09838" stroke-width="1" opacity="0.9"/><path d="M22 45 C26 41, 32 40, 40 42 C48 40, 54 41, 58 45 Z" fill="url(#f22)" stroke="#d0c8a8" stroke-width="0.8"/><path d="M22 45 L20 100 L60 100 L58 45" fill="none" stroke="#a09838" stroke-width="1.5"/><rect x="20" y="100" width="40" height="3" rx="1" fill="#a09838" opacity="0.35"/>`,
  },
  {
    key: "copa_balloon",
    name: "Copa / Balloon Glass",
    ozLabel: "16–22 oz",
    aka: "Gin Balloon · Spanish Copa",
    bestFor: ["Sparkling Cider", "Gin & Tonic", "Cider Cocktail", "Craft Cider"],
    gradientNum: 23,
    svgInner: `<defs><linearGradient id="beer23" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D0C078" stop-opacity="0.5"/><stop offset="100%" stop-color="#B0A048" stop-opacity="0.75"/></linearGradient><linearGradient id="f23" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFF8"/><stop offset="100%" stop-color="#F8F2DE"/></linearGradient></defs><path d="M18 28 Q10 52, 16 68 Q22 80, 36 82 L36 94 L28 96 L28 99 L52 99 L52 96 L44 94 L44 82 Q58 80, 64 68 Q70 52, 62 28 Z" fill="url(#beer23)" stroke="#989068" stroke-width="1" opacity="0.88"/><path d="M18 28 C22 24, 29 22, 35 24 C40 21, 47 21, 52 24 C57 22, 62 25, 62 28 Z" fill="url(#f23)" stroke="#d0c8a8" stroke-width="0.8"/><path d="M18 28 Q10 52, 16 68 Q22 80, 36 82 L36 94 L28 96 L28 99 L52 99 L52 96 L44 94 L44 82 Q58 80, 64 68 Q70 52, 62 28" fill="none" stroke="#989068" stroke-width="1.5"/><rect x="16" y="36" width="2.5" height="28" rx="1.2" fill="white" opacity="0.06"/>`,
  },
  {
    key: "bolee",
    name: "Bolée",
    ozLabel: "6 oz",
    aka: "Breton Cider Bowl · Tasse à Cidre",
    bestFor: ["Breton Cider", "French Cider", "Traditional Cider", "Farmhouse Cider"],
    gradientNum: 24,
    svgInner: `<defs><linearGradient id="beer24" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D4C870" stop-opacity="0.6"/><stop offset="100%" stop-color="#B0A840" stop-opacity="0.78"/></linearGradient><linearGradient id="f24" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFF5"/><stop offset="100%" stop-color="#F5F0DC"/></linearGradient></defs><path d="M14 58 Q12 80, 16 92 Q20 100, 40 102 Q60 100, 64 92 Q68 80, 66 58 Z" fill="url(#beer24)" stroke="#908838" stroke-width="1" opacity="0.9"/><path d="M14 58 Q20 53, 40 52 Q60 53, 66 58 Z" fill="url(#f24)" stroke="#c8c0a0" stroke-width="0.8"/><path d="M14 58 Q12 80, 16 92 Q20 100, 40 102 Q60 100, 64 92 Q68 80, 66 58" fill="none" stroke="#908838" stroke-width="1.5"/>`,
  },
  {
    key: "mason_jar",
    name: "Mason Jar",
    ozLabel: "16 oz",
    aka: "Preserving Jar · Ball Jar",
    bestFor: ["Cider", "Cocktail", "Lemonade", "Cold Brew", "Shandy"],
    gradientNum: 25,
    svgInner: `<defs><linearGradient id="beer25" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D4C870" stop-opacity="0.55"/><stop offset="100%" stop-color="#B0A840" stop-opacity="0.75"/></linearGradient><linearGradient id="f25" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFF5"/><stop offset="100%" stop-color="#F5F0DC"/></linearGradient></defs><rect x="20" y="30" width="40" height="70" rx="3" fill="url(#beer25)" stroke="#909838" stroke-width="1.5" opacity="0.9"/><path d="M20 30 C24 27, 32 26, 40 28 C48 26, 56 27, 60 30 Z" fill="url(#f25)" stroke="#c8c4a0" stroke-width="0.8"/><rect x="20" y="30" width="40" height="70" rx="3" fill="none" stroke="#909838" stroke-width="1.8"/><rect x="20" y="100" width="40" height="3" rx="1" fill="#909838" opacity="0.4"/><rect x="18" y="25" width="44" height="8" rx="2" fill="none" stroke="#909838" stroke-width="1.5"/><rect x="22" y="36" width="2" height="58" rx="1" fill="white" opacity="0.06"/>`,
  },

  // ─── Wine Glasses (new) ──────────────────────────────────────────────────────
  {
    key: "bordeaux_glass",
    name: "Bordeaux Glass",
    ozLabel: "18–22 oz",
    aka: "Cabernet Glass · Tall Red Wine",
    bestFor: ["Cabernet Sauvignon", "Merlot", "Bordeaux Blend", "Syrah", "Red Wine"],
    gradientNum: 26,
    svgInner: `<defs><linearGradient id="beer26" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8B2040" stop-opacity="0.6"/><stop offset="100%" stop-color="#6A1030" stop-opacity="0.85"/></linearGradient><linearGradient id="f26" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF5F5"/><stop offset="100%" stop-color="#F0DDD5"/></linearGradient></defs><path d="M26 18 Q20 40, 23 58 Q26 70, 36 72 L36 92 L28 94 L28 97 L52 97 L52 94 L44 92 L44 72 Q54 70, 57 58 Q60 40, 54 18 Z" fill="url(#beer26)" stroke="#7a3048" stroke-width="1" opacity="0.9"/><path d="M26 18 C30 15, 34 14, 40 16 C46 14, 50 15, 54 18 Z" fill="url(#f26)" stroke="#c8b0a8" stroke-width="0.8"/><path d="M26 18 Q20 40, 23 58 Q26 70, 36 72 L36 92 L28 94 L28 97 L52 97 L52 94 L44 92 L44 72 Q54 70, 57 58 Q60 40, 54 18" fill="none" stroke="#7a3048" stroke-width="1.5"/><rect x="24" y="25" width="2.5" height="25" rx="1.2" fill="white" opacity="0.06"/>`,
  },
  {
    key: "burgundy_glass",
    name: "Burgundy Glass",
    ozLabel: "20–28 oz",
    aka: "Pinot Noir Glass · Balloon Red",
    bestFor: ["Pinot Noir", "Burgundy", "Gamay", "Aged Red Wine"],
    gradientNum: 27,
    svgInner: `<defs><linearGradient id="beer27" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7B1840" stop-opacity="0.6"/><stop offset="100%" stop-color="#5A1028" stop-opacity="0.82"/></linearGradient><linearGradient id="f27" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF5F5"/><stop offset="100%" stop-color="#F0DDD8"/></linearGradient></defs><path d="M22 24 Q14 46, 18 64 Q22 76, 36 78 L36 94 L28 96 L28 99 L52 99 L52 96 L44 94 L44 78 Q58 76, 62 64 Q66 46, 58 24 Z" fill="url(#beer27)" stroke="#6a2840" stroke-width="1" opacity="0.9"/><path d="M22 24 C26 20, 31 19, 36 21 C41 18, 48 18, 53 21 C57 19, 58 22, 58 24 Z" fill="url(#f27)" stroke="#c8b0a8" stroke-width="0.8"/><path d="M22 24 Q14 46, 18 64 Q22 76, 36 78 L36 94 L28 96 L28 99 L52 99 L52 96 L44 94 L44 78 Q58 76, 62 64 Q66 46, 58 24" fill="none" stroke="#6a2840" stroke-width="1.5"/><rect x="20" y="32" width="2.5" height="28" rx="1.2" fill="white" opacity="0.06"/>`,
  },
  {
    key: "sauvignon_blanc_glass",
    name: "Sauvignon Blanc Glass",
    ozLabel: "12 oz",
    aka: "Aromatic White Glass · Tall White",
    bestFor: ["Sauvignon Blanc", "Pinot Grigio", "Riesling", "Grüner Veltliner", "Aromatic White"],
    gradientNum: 28,
    svgInner: `<defs><linearGradient id="beer28" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E8E060" stop-opacity="0.45"/><stop offset="100%" stop-color="#C8C040" stop-opacity="0.65"/></linearGradient><linearGradient id="f28" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#F8F5E8"/></linearGradient></defs><path d="M29 20 Q24 38, 26 53 Q28 63, 36 65 L36 87 L29 89 L29 92 L51 92 L51 89 L44 87 L44 65 Q52 63, 54 53 Q56 38, 51 20 Z" fill="url(#beer28)" stroke="#a0a050" stroke-width="1" opacity="0.88"/><path d="M29 20 C33 17, 37 16, 40 18 C43 16, 47 17, 51 20 Z" fill="url(#f28)" stroke="#d0d0b0" stroke-width="0.8"/><path d="M29 20 Q24 38, 26 53 Q28 63, 36 65 L36 87 L29 89 L29 92 L51 92 L51 89 L44 87 L44 65 Q52 63, 54 53 Q56 38, 51 20" fill="none" stroke="#a0a050" stroke-width="1.5"/>`,
  },
  {
    key: "champagne_coupe",
    name: "Champagne Coupe",
    ozLabel: "5–7 oz",
    aka: "Saucer · Marie Antoinette Glass · Cocktail Coupe",
    bestFor: ["Champagne", "Prosecco", "Sparkling Wine", "Classic Cocktail", "Daiquiri", "Sidecar"],
    gradientNum: 29,
    svgInner: `<defs><linearGradient id="beer29" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F0E870" stop-opacity="0.45"/><stop offset="100%" stop-color="#D0C848" stop-opacity="0.65"/></linearGradient><linearGradient id="f29" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#F5F0DC"/></linearGradient></defs><path d="M14 42 Q14 58, 24 64 Q30 68, 36 68 L36 90 L28 92 L28 95 L52 95 L52 92 L44 90 L44 68 Q50 68, 56 64 Q66 58, 66 42 Z" fill="url(#beer29)" stroke="#a0a050" stroke-width="1" opacity="0.88"/><path d="M14 42 C18 38, 26 36, 36 38 C46 36, 58 38, 66 42 Z" fill="url(#f29)" stroke="#d0d0b0" stroke-width="0.8"/><path d="M14 42 Q14 58, 24 64 Q30 68, 36 68 L36 90 L28 92 L28 95 L52 95 L52 92 L44 90 L44 68 Q50 68, 56 64 Q66 58, 66 42" fill="none" stroke="#a0a050" stroke-width="1.5"/>`,
  },
  {
    key: "rose_glass",
    name: "Rosé Glass",
    ozLabel: "14 oz",
    aka: "Flared Lip White · Rosé Flute",
    bestFor: ["Rosé Wine", "Sparkling Rosé", "Provence Rosé", "Pink Champagne"],
    gradientNum: 30,
    svgInner: `<defs><linearGradient id="beer30" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E89090" stop-opacity="0.5"/><stop offset="100%" stop-color="#C86878" stop-opacity="0.72"/></linearGradient><linearGradient id="f30" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8F8"/><stop offset="100%" stop-color="#F5E8E8"/></linearGradient></defs><path d="M26 22 Q20 42, 24 57 Q28 68, 36 70 Q38 72, 36 75 L36 90 L28 92 L28 95 L52 95 L52 92 L44 90 L44 75 Q42 72, 44 70 Q52 68, 56 57 Q60 42, 54 22 Z" fill="url(#beer30)" stroke="#b07080" stroke-width="1" opacity="0.88"/><path d="M26 22 C30 19, 34 18, 40 20 C46 18, 50 19, 54 22 Z" fill="url(#f30)" stroke="#d0b0b0" stroke-width="0.8"/><path d="M26 22 Q20 42, 24 57 Q28 68, 36 70 Q38 72, 36 75 L36 90 L28 92 L28 95 L52 95 L52 92 L44 90 L44 75 Q42 72, 44 70 Q52 68, 56 57 Q60 42, 54 22" fill="none" stroke="#b07080" stroke-width="1.5"/>`,
  },
  {
    key: "port_glass",
    name: "Port Glass",
    ozLabel: "6–8 oz",
    aka: "Dessert Wine Glass · Fortified Glass",
    bestFor: ["Port", "Sherry", "Madeira", "Dessert Wine", "Fortified Wine"],
    gradientNum: 31,
    svgInner: `<defs><linearGradient id="beer31" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7B1828" stop-opacity="0.7"/><stop offset="100%" stop-color="#5A1018" stop-opacity="0.9"/></linearGradient><linearGradient id="f31" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF5F5"/><stop offset="100%" stop-color="#F0DDD8"/></linearGradient></defs><path d="M29 36 Q24 50, 26 60 Q28 68, 36 70 L36 86 L29 88 L29 91 L51 91 L51 88 L44 86 L44 70 Q52 68, 54 60 Q56 50, 51 36 Z" fill="url(#beer31)" stroke="#6a2030" stroke-width="1" opacity="0.9"/><path d="M29 36 C32 33, 36 32, 40 34 C44 32, 48 33, 51 36 Z" fill="url(#f31)" stroke="#c8a0a0" stroke-width="0.8"/><path d="M29 36 Q24 50, 26 60 Q28 68, 36 70 L36 86 L29 88 L29 91 L51 91 L51 88 L44 86 L44 70 Q52 68, 54 60 Q56 50, 51 36" fill="none" stroke="#6a2030" stroke-width="1.5"/>`,
  },
  {
    key: "copita",
    name: "Copita",
    ozLabel: "4–6 oz",
    aka: "Sherry Glass · Catavino",
    bestFor: ["Sherry", "Fino", "Manzanilla", "Amontillado", "Wine Tasting"],
    gradientNum: 32,
    svgInner: `<defs><linearGradient id="beer32" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C8A040" stop-opacity="0.55"/><stop offset="100%" stop-color="#A88030" stop-opacity="0.75"/></linearGradient><linearGradient id="f32" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFF5"/><stop offset="100%" stop-color="#F8F0DC"/></linearGradient></defs><path d="M30 34 Q25 48, 27 57 Q29 64, 36 66 L36 82 L29 84 L29 87 L51 87 L51 84 L44 82 L44 66 Q51 64, 53 57 Q55 48, 50 34 Z" fill="url(#beer32)" stroke="#908030" stroke-width="1" opacity="0.88"/><path d="M30 34 C33 31, 37 30, 40 32 C43 30, 47 31, 50 34 Z" fill="url(#f32)" stroke="#d0c8a0" stroke-width="0.8"/><path d="M30 34 Q25 48, 27 57 Q29 64, 36 66 L36 82 L29 84 L29 87 L51 87 L51 84 L44 82 L44 66 Q51 64, 53 57 Q55 48, 50 34" fill="none" stroke="#908030" stroke-width="1.5"/>`,
  },
  {
    key: "universal_wine_glass",
    name: "Universal Wine Glass",
    ozLabel: "10–15 oz",
    aka: "ISO Tasting Glass · All-Purpose",
    bestFor: ["Any Wine", "Wine Tasting", "Red Wine", "White Wine", "Sparkling Wine"],
    gradientNum: 33,
    svgInner: `<defs><linearGradient id="beer33" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C8A850" stop-opacity="0.5"/><stop offset="100%" stop-color="#A88838" stop-opacity="0.72"/></linearGradient><linearGradient id="f33" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#F8F0DC"/></linearGradient></defs><path d="M27 28 Q22 46, 25 58 Q28 67, 36 69 L36 88 L28 90 L28 93 L52 93 L52 90 L44 88 L44 69 Q52 67, 55 58 Q58 46, 53 28 Z" fill="url(#beer33)" stroke="#988040" stroke-width="1" opacity="0.88"/><path d="M27 28 C31 25, 35 24, 40 26 C45 24, 49 25, 53 28 Z" fill="url(#f33)" stroke="#d0c8a0" stroke-width="0.8"/><path d="M27 28 Q22 46, 25 58 Q28 67, 36 69 L36 88 L28 90 L28 93 L52 93 L52 90 L44 88 L44 69 Q52 67, 55 58 Q58 46, 53 28" fill="none" stroke="#988040" stroke-width="1.5"/>`,
  },
  {
    key: "stemless_wine_glass",
    name: "Stemless Wine Glass",
    ozLabel: "15–21 oz",
    aka: "Tumbler · Modern Wine Glass",
    bestFor: ["Red Wine", "White Wine", "Rosé", "Casual Wine", "Outdoor Wine"],
    gradientNum: 34,
    svgInner: `<defs><linearGradient id="beer34" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#A84040" stop-opacity="0.55"/><stop offset="100%" stop-color="#882028" stop-opacity="0.78"/></linearGradient><linearGradient id="f34" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8F8"/><stop offset="100%" stop-color="#F0DDD8"/></linearGradient></defs><path d="M18 38 Q16 60, 20 76 Q24 88, 40 90 Q56 88, 60 76 Q64 60, 62 38 Z" fill="url(#beer34)" stroke="#883038" stroke-width="1" opacity="0.9"/><path d="M18 38 C22 34, 30 32, 40 34 C50 32, 58 34, 62 38 Z" fill="url(#f34)" stroke="#c8b0a8" stroke-width="0.8"/><path d="M18 38 Q16 60, 20 76 Q24 88, 40 90 Q56 88, 60 76 Q64 60, 62 38" fill="none" stroke="#883038" stroke-width="1.5"/><rect x="20" y="100" width="40" height="3" rx="1" fill="#883038" opacity="0.3"/>`,
  },
  {
    key: "riesling_glass",
    name: "Riesling Glass",
    ozLabel: "10–13 oz",
    aka: "Aromatic Wine Glass · Rhine Glass",
    bestFor: ["Riesling", "Gewürztraminer", "Muscat", "Aromatic White", "Late Harvest"],
    gradientNum: 35,
    svgInner: `<defs><linearGradient id="beer35" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E8E060" stop-opacity="0.42"/><stop offset="100%" stop-color="#C8C040" stop-opacity="0.62"/></linearGradient><linearGradient id="f35" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#F8F5E8"/></linearGradient></defs><path d="M30 26 Q25 42, 27 55 Q30 64, 37 66 L37 86 L30 88 L30 91 L50 91 L50 88 L43 86 L43 66 Q50 64, 53 55 Q55 42, 50 26 Z" fill="url(#beer35)" stroke="#a0a050" stroke-width="1" opacity="0.88"/><path d="M30 26 C33 23, 37 22, 40 24 C43 22, 47 23, 50 26 Z" fill="url(#f35)" stroke="#d0d0b0" stroke-width="0.8"/><path d="M30 26 Q25 42, 27 55 Q30 64, 37 66 L37 86 L30 88 L30 91 L50 91 L50 88 L43 86 L43 66 Q50 64, 53 55 Q55 42, 50 26" fill="none" stroke="#a0a050" stroke-width="1.5"/>`,
  },

  // ─── Cocktail Glasses (new) ──────────────────────────────────────────────────
  {
    key: "martini_glass",
    name: "Martini Glass",
    ozLabel: "5–8 oz",
    aka: "Cocktail Glass · V-Glass",
    bestFor: ["Martini", "Cosmopolitan", "Manhattan", "Classic Cocktail", "Straight-Up Drinks"],
    gradientNum: 36,
    svgInner: `<defs><linearGradient id="beer36" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C8E8E0" stop-opacity="0.45"/><stop offset="100%" stop-color="#A8C8C0" stop-opacity="0.65"/></linearGradient><linearGradient id="f36" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#F5F8F5"/></linearGradient></defs><path d="M12 28 L40 72 L68 28 Z" fill="url(#beer36)" stroke="#809888" stroke-width="1" opacity="0.88"/><path d="M12 28 L20 28 L40 30 L60 28 L68 28 Z" fill="url(#f36)" stroke="#c0d0c8" stroke-width="0.8"/><line x1="40" y1="72" x2="40" y2="92" stroke="#809888" stroke-width="1.5"/><rect x="28" y="92" width="24" height="2.5" rx="1" fill="#809888" opacity="0.6"/><path d="M12 28 L40 72 L68 28" fill="none" stroke="#809888" stroke-width="1.5"/>`,
  },
  {
    key: "rocks_glass",
    name: "Rocks Glass",
    ozLabel: "6–10 oz",
    aka: "Old Fashioned · Lowball · Tumbler",
    bestFor: ["Old Fashioned", "Whisky On the Rocks", "Negroni", "Sazerac", "Spirit Neat"],
    gradientNum: 37,
    svgInner: `<defs><linearGradient id="beer37" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E8C070" stop-opacity="0.55"/><stop offset="100%" stop-color="#C8A040" stop-opacity="0.78"/></linearGradient><linearGradient id="f37" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFF5"/><stop offset="100%" stop-color="#F8F0DC"/></linearGradient></defs><path d="M18 50 L16 100 L64 100 L62 50 Z" fill="url(#beer37)" stroke="#a08038" stroke-width="1.5" opacity="0.9"/><path d="M18 50 C22 46, 30 45, 40 47 C50 45, 58 46, 62 50 Z" fill="url(#f37)" stroke="#d0c8a0" stroke-width="0.8"/><path d="M18 50 L16 100 L64 100 L62 50" fill="none" stroke="#a08038" stroke-width="1.8"/><rect x="16" y="100" width="48" height="3" rx="1" fill="#a08038" opacity="0.4"/><rect x="20" y="56" width="3" height="38" rx="1.5" fill="white" opacity="0.06"/>`,
  },
  {
    key: "highball",
    name: "Highball",
    ozLabel: "10–14 oz",
    aka: "Tall Glass · Collins Glass",
    bestFor: ["Highball", "G&T", "Mojito", "Tom Collins", "Sparkling Soft Drink", "Long Drink"],
    gradientNum: 38,
    svgInner: `<defs><linearGradient id="beer38" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C8E8C0" stop-opacity="0.5"/><stop offset="100%" stop-color="#A8C8A0" stop-opacity="0.72"/></linearGradient><linearGradient id="f38" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#F5F8F5"/></linearGradient></defs><path d="M26 18 L24 100 L56 100 L54 18 Z" fill="url(#beer38)" stroke="#809878" stroke-width="1.5" opacity="0.9"/><path d="M26 18 C30 15, 34 14, 40 16 C46 14, 50 15, 54 18 Z" fill="url(#f38)" stroke="#c0d0c0" stroke-width="0.8"/><path d="M26 18 L24 100 L56 100 L54 18" fill="none" stroke="#809878" stroke-width="1.8"/><rect x="24" y="100" width="32" height="3" rx="1" fill="#809878" opacity="0.4"/><rect x="28" y="24" width="2.5" height="70" rx="1.2" fill="white" opacity="0.06"/>`,
  },
  {
    key: "nick_nora",
    name: "Nick & Nora",
    ozLabel: "5–6 oz",
    aka: "The Thin Man Glass",
    bestFor: ["Martini", "Manhattan", "Classic Cocktail", "Spirit-Forward Drinks"],
    gradientNum: 39,
    svgInner: `<defs><linearGradient id="beer39" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C8E0E8" stop-opacity="0.45"/><stop offset="100%" stop-color="#A8C0C8" stop-opacity="0.65"/></linearGradient><linearGradient id="f39" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#F5F8F8"/></linearGradient></defs><path d="M28 32 Q23 46, 25 56 Q27 64, 36 66 L36 86 L29 88 L29 91 L51 91 L51 88 L44 86 L44 66 Q53 64, 55 56 Q57 46, 52 32 Z" fill="url(#beer39)" stroke="#809098" stroke-width="1" opacity="0.88"/><path d="M28 32 C31 29, 35 28, 40 30 C45 28, 49 29, 52 32 Z" fill="url(#f39)" stroke="#c0ccd0" stroke-width="0.8"/><path d="M28 32 Q23 46, 25 56 Q27 64, 36 66 L36 86 L29 88 L29 91 L51 91 L51 88 L44 86 L44 66 Q53 64, 55 56 Q57 46, 52 32" fill="none" stroke="#809098" stroke-width="1.5"/>`,
  },
  {
    key: "copper_mug",
    name: "Copper Mug",
    ozLabel: "12–16 oz",
    aka: "Moscow Mule Mug · Hammered Mug",
    bestFor: ["Moscow Mule", "Dark & Stormy", "Kentucky Mule", "Ginger Beer Cocktail"],
    gradientNum: 40,
    svgInner: `<defs><linearGradient id="beer40" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C87828" stop-opacity="0.8"/><stop offset="100%" stop-color="#A85818" stop-opacity="0.94"/></linearGradient><linearGradient id="f40" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8E8"/><stop offset="100%" stop-color="#F0E0C0"/></linearGradient></defs><rect x="16" y="28" width="38" height="72" rx="3" fill="url(#beer40)" stroke="#986028" stroke-width="1.5" opacity="0.9"/><path d="M16 28 C20 24, 26 23, 32 25 C38 23, 46 24, 54 28 Z" fill="url(#f40)" stroke="#d0b890" stroke-width="0.8"/><rect x="16" y="28" width="38" height="72" rx="3" fill="none" stroke="#986028" stroke-width="1.8"/><rect x="16" y="100" width="38" height="3" rx="1" fill="#986028" opacity="0.4"/><path d="M54 40 Q66 42, 68 57 Q68 72, 54 76" fill="none" stroke="#986028" stroke-width="3.5" stroke-linecap="round"/><path d="M54 40 Q64 41, 66 57 Q66 71, 54 76" fill="none" stroke="#c88040" stroke-width="1.5" stroke-linecap="round"/><rect x="20" y="34" width="2.5" height="58" rx="1.2" fill="white" opacity="0.06"/>`,
  },
  {
    key: "hurricane",
    name: "Hurricane",
    ozLabel: "15–20 oz",
    aka: "Poco Grande · Tropical Glass",
    bestFor: ["Hurricane", "Piña Colada", "Tropical Cocktail", "Frozen Drink", "Tiki Cocktail"],
    gradientNum: 41,
    svgInner: `<defs><linearGradient id="beer41" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E87838" stop-opacity="0.7"/><stop offset="100%" stop-color="#C85820" stop-opacity="0.88"/></linearGradient><linearGradient id="f41" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8F0"/><stop offset="100%" stop-color="#F0E0C8"/></linearGradient></defs><path d="M22 18 Q18 30, 26 40 Q32 48, 30 58 Q28 70, 22 80 L22 100 L58 100 L58 80 Q52 70, 50 58 Q48 48, 54 40 Q62 30, 58 18 Z" fill="url(#beer41)" stroke="#b06030" stroke-width="1" opacity="0.9"/><path d="M22 18 C26 14, 32 13, 40 15 C48 13, 54 14, 58 18 Z" fill="url(#f41)" stroke="#d0b898" stroke-width="0.8"/><path d="M22 18 Q18 30, 26 40 Q32 48, 30 58 Q28 70, 22 80 L22 100 L58 100 L58 80 Q52 70, 50 58 Q48 48, 54 40 Q62 30, 58 18" fill="none" stroke="#b06030" stroke-width="1.5"/><rect x="22" y="100" width="36" height="3" rx="1" fill="#b06030" opacity="0.35"/>`,
  },
  {
    key: "margarita_glass",
    name: "Margarita Glass",
    ozLabel: "10–14 oz",
    aka: "Welled Coupe · Double-Bowl",
    bestFor: ["Margarita", "Frozen Margarita", "Daiquiri", "Tropical Cocktail"],
    gradientNum: 42,
    svgInner: `<defs><linearGradient id="beer42" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C8E870" stop-opacity="0.55"/><stop offset="100%" stop-color="#A8C840" stop-opacity="0.75"/></linearGradient><linearGradient id="f42" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFF5"/><stop offset="100%" stop-color="#F5F8DC"/></linearGradient></defs><path d="M12 36 Q10 52, 20 60 Q28 66, 36 66 Q44 66, 52 60 Q62 52, 60 36 Z" fill="url(#beer42)" stroke="#90a838" stroke-width="1" opacity="0.88"/><path d="M12 36 C16 32, 26 30, 40 32 C54 30, 64 32, 60 36 Z" fill="url(#f42)" stroke="#c8d0a0" stroke-width="0.8"/><path d="M12 36 Q10 52, 20 60 Q28 66, 36 66 Q44 66, 52 60 Q62 52, 60 36" fill="none" stroke="#90a838" stroke-width="1.5"/><circle cx="40" cy="70" r="4" fill="url(#beer42)" stroke="#90a838" stroke-width="1"/><line x1="40" y1="74" x2="40" y2="92" stroke="#90a838" stroke-width="1.5"/><rect x="28" y="92" width="24" height="2.5" rx="1" fill="#90a838" opacity="0.5"/>`,
  },
  {
    key: "julep_cup",
    name: "Julep Cup",
    ozLabel: "10–12 oz",
    aka: "Mint Julep Cup · Silver Cup",
    bestFor: ["Mint Julep", "Bourbon Smash", "Crushed Ice Cocktail", "Kentucky Derby Drink"],
    gradientNum: 43,
    svgInner: `<defs><linearGradient id="beer43" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D0D8D0" stop-opacity="0.7"/><stop offset="100%" stop-color="#B0B8B0" stop-opacity="0.88"/></linearGradient><linearGradient id="f43" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#F5F8F5"/></linearGradient></defs><path d="M22 30 L20 100 L60 100 L58 30 Z" fill="url(#beer43)" stroke="#909890" stroke-width="1.5" opacity="0.9"/><path d="M22 30 C26 27, 32 26, 40 28 C48 26, 54 27, 58 30 Z" fill="url(#f43)" stroke="#c8d0c8" stroke-width="0.8"/><path d="M22 30 L20 100 L60 100 L58 30" fill="none" stroke="#909890" stroke-width="1.8"/><rect x="20" y="100" width="40" height="3" rx="1" fill="#909890" opacity="0.4"/><rect x="24" y="36" width="2.5" height="58" rx="1.2" fill="white" opacity="0.07"/>`,
  },
  {
    key: "glencairn",
    name: "Glencairn",
    ozLabel: "6 oz",
    aka: "Whisky Glass · Nosing Glass",
    bestFor: ["Scotch Whisky", "Bourbon", "Rye", "Irish Whiskey", "Spirit Tasting"],
    gradientNum: 44,
    svgInner: `<defs><linearGradient id="beer44" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C88038" stop-opacity="0.7"/><stop offset="100%" stop-color="#A86018" stop-opacity="0.9"/></linearGradient><linearGradient id="f44" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8E8"/><stop offset="100%" stop-color="#F0E0C0"/></linearGradient></defs><path d="M26 36 Q18 52, 20 64 Q22 74, 32 78 Q36 80, 36 84 L36 94 L26 96 L26 99 L54 99 L54 96 L44 94 L44 84 Q44 80, 48 78 Q58 74, 60 64 Q62 52, 54 36 Z" fill="url(#beer44)" stroke="#906030" stroke-width="1" opacity="0.9"/><path d="M26 36 C29 33, 33 32, 40 34 C47 32, 51 33, 54 36 Z" fill="url(#f44)" stroke="#d0b890" stroke-width="0.8"/><path d="M26 36 Q18 52, 20 64 Q22 74, 32 78 Q36 80, 36 84 L36 94 L26 96 L26 99 L54 99 L54 96 L44 94 L44 84 Q44 80, 48 78 Q58 74, 60 64 Q62 52, 54 36" fill="none" stroke="#906030" stroke-width="1.5"/>`,
  },
  {
    key: "tiki_mug",
    name: "Tiki Mug",
    ozLabel: "12–24 oz",
    aka: "Ceramic Tiki · Idol Mug",
    bestFor: ["Tiki Cocktail", "Mai Tai", "Zombie", "Rum Punch", "Tropical Drink"],
    gradientNum: 45,
    svgInner: `<defs><linearGradient id="beer45" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D46830" stop-opacity="0.8"/><stop offset="100%" stop-color="#B04818" stop-opacity="0.94"/></linearGradient><linearGradient id="f45" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF0E0"/><stop offset="100%" stop-color="#F0D8B8"/></linearGradient></defs><path d="M22 22 Q18 28, 20 40 L18 100 L62 100 L60 40 Q62 28, 58 22 Z" fill="url(#beer45)" stroke="#986028" stroke-width="1.5" opacity="0.9"/><path d="M22 22 C26 18, 32 17, 40 19 C48 17, 54 18, 58 22 Z" fill="url(#f45)" stroke="#d0a880" stroke-width="0.8"/><path d="M22 22 Q18 28, 20 40 L18 100 L62 100 L60 40 Q62 28, 58 22" fill="none" stroke="#986028" stroke-width="1.8"/><rect x="18" y="100" width="44" height="3" rx="1" fill="#986028" opacity="0.4"/><ellipse cx="40" cy="45" rx="8" ry="4" fill="none" stroke="white" stroke-width="0.5" opacity="0.12"/><ellipse cx="40" cy="62" rx="8" ry="4" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/><ellipse cx="40" cy="79" rx="8" ry="4" fill="none" stroke="white" stroke-width="0.5" opacity="0.08"/>`,
  },
  {
    key: "shot_glass",
    name: "Shot Glass",
    ozLabel: "1–2 oz",
    aka: "Shooter · Jigger",
    bestFor: ["Spirit Shot", "Shooter", "Espresso Shot", "Sake", "Tequila"],
    gradientNum: 46,
    svgInner: `<defs><linearGradient id="beer46" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C88838" stop-opacity="0.7"/><stop offset="100%" stop-color="#A86818" stop-opacity="0.9"/></linearGradient><linearGradient id="f46" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8E8"/><stop offset="100%" stop-color="#F0E0C0"/></linearGradient></defs><path d="M28 58 L26 100 L54 100 L52 58 Z" fill="url(#beer46)" stroke="#906030" stroke-width="1.5" opacity="0.9"/><path d="M28 58 C31 55, 35 54, 40 56 C45 54, 49 55, 52 58 Z" fill="url(#f46)" stroke="#d0b890" stroke-width="0.8"/><path d="M28 58 L26 100 L54 100 L52 58" fill="none" stroke="#906030" stroke-width="1.8"/><rect x="26" y="100" width="28" height="3" rx="1" fill="#906030" opacity="0.4"/>`,
  },

  // ─── Non-Alcoholic / Coffee Vessels (new) ────────────────────────────────────
  {
    key: "coffee_mug",
    name: "Coffee Mug",
    ozLabel: "8–12 oz",
    aka: "Standard Mug · Diner Mug",
    bestFor: ["Coffee", "Tea", "Hot Chocolate", "Mulled Cider", "Hot Toddy"],
    gradientNum: 47,
    svgInner: `<defs><linearGradient id="beer47" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6B3E2C" stop-opacity="0.8"/><stop offset="100%" stop-color="#4A2818" stop-opacity="0.95"/></linearGradient><linearGradient id="f47" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F5ECE0"/><stop offset="100%" stop-color="#E8D8C0"/></linearGradient></defs><rect x="14" y="28" width="38" height="72" rx="3" fill="url(#beer47)" stroke="#6a4030" stroke-width="1.5" opacity="0.9"/><path d="M14 28 C18 24, 24 23, 32 25 C38 23, 44 24, 52 28 Z" fill="url(#f47)" stroke="#c0a888" stroke-width="0.8"/><rect x="14" y="28" width="38" height="72" rx="3" fill="none" stroke="#6a4030" stroke-width="1.8"/><rect x="14" y="100" width="38" height="3" rx="1" fill="#6a4030" opacity="0.4"/><path d="M52 42 Q64 44, 66 57 Q66 70, 52 74" fill="none" stroke="#6a4030" stroke-width="3.5" stroke-linecap="round"/><path d="M52 42 Q62 43, 64 57 Q64 69, 52 74" fill="none" stroke="#8a6050" stroke-width="1.5" stroke-linecap="round"/><rect x="18" y="34" width="2.5" height="58" rx="1.2" fill="white" opacity="0.06"/>`,
  },
  {
    key: "espresso_cup",
    name: "Espresso Cup",
    ozLabel: "2–3 oz",
    aka: "Demitasse · Tazzina",
    bestFor: ["Espresso", "Ristretto", "Lungo", "Macchiato"],
    gradientNum: 48,
    svgInner: `<defs><linearGradient id="beer48" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4A2818" stop-opacity="0.88"/><stop offset="100%" stop-color="#2C1808" stop-opacity="0.98"/></linearGradient><linearGradient id="f48" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D4C0A0"/><stop offset="100%" stop-color="#C0A880"/></linearGradient></defs><path d="M26 60 Q24 78, 26 90 Q28 98, 40 100 Q52 98, 54 90 Q56 78, 54 60 Z" fill="url(#beer48)" stroke="#503020" stroke-width="1.5" opacity="0.9"/><path d="M26 60 C28 57, 34 56, 40 58 C46 56, 52 57, 54 60 Z" fill="url(#f48)" stroke="#b09070" stroke-width="0.8"/><path d="M26 60 Q24 78, 26 90 Q28 98, 40 100 Q52 98, 54 90 Q56 78, 54 60" fill="none" stroke="#503020" stroke-width="1.8"/><path d="M54 65 Q62 67, 63 75 Q63 82, 54 85" fill="none" stroke="#503020" stroke-width="2.5" stroke-linecap="round"/><rect x="20" y="103" width="40" height="3" rx="1" fill="#503020" opacity="0.5"/>`,
  },
  {
    key: "latte_glass",
    name: "Latte Glass",
    ozLabel: "10–16 oz",
    aka: "Café Latte Glass · Irish Coffee Glass",
    bestFor: ["Latte", "Cappuccino", "Irish Coffee", "Hot Beverage", "Cold Brew"],
    gradientNum: 49,
    svgInner: `<defs><linearGradient id="beer49" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C8A070" stop-opacity="0.65"/><stop offset="100%" stop-color="#A07848" stop-opacity="0.85"/></linearGradient><linearGradient id="f49" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF5E8"/><stop offset="100%" stop-color="#F0E0C8"/></linearGradient></defs><path d="M28 16 L26 100 L54 100 L52 16 Z" fill="url(#beer49)" stroke="#806040" stroke-width="1.5" opacity="0.9"/><path d="M28 16 C31 13, 35 12, 40 14 C45 12, 49 13, 52 16 Z" fill="url(#f49)" stroke="#d0b898" stroke-width="0.8"/><path d="M28 16 L26 100 L54 100 L52 16" fill="none" stroke="#806040" stroke-width="1.8"/><rect x="26" y="100" width="28" height="3" rx="1" fill="#806040" opacity="0.4"/><rect x="30" y="22" width="2" height="70" rx="1" fill="white" opacity="0.06"/>`,
  },
  {
    key: "teacup",
    name: "Teacup & Saucer",
    ozLabel: "6–8 oz",
    aka: "Tea Cup · China Cup",
    bestFor: ["Tea", "Herbal Tea", "Chai", "Hot Beverage"],
    gradientNum: 50,
    svgInner: `<defs><linearGradient id="beer50" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E8D8C0" stop-opacity="0.7"/><stop offset="100%" stop-color="#C8B898" stop-opacity="0.88"/></linearGradient><linearGradient id="f50" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#F8F0E0"/></linearGradient></defs><path d="M18 52 Q16 70, 18 82 Q20 92, 40 94 Q60 92, 62 82 Q64 70, 62 52 Z" fill="url(#beer50)" stroke="#a09070" stroke-width="1.5" opacity="0.9"/><path d="M18 52 C22 48, 30 46, 40 48 C50 46, 58 48, 62 52 Z" fill="url(#f50)" stroke="#d0c8b0" stroke-width="0.8"/><path d="M18 52 Q16 70, 18 82 Q20 92, 40 94 Q60 92, 62 82 Q64 70, 62 52" fill="none" stroke="#a09070" stroke-width="1.8"/><path d="M62 58 Q72 60, 73 68 Q73 76, 62 80" fill="none" stroke="#a09070" stroke-width="2.5" stroke-linecap="round"/><rect x="10" y="97" width="60" height="3" rx="1.5" fill="#a09070" opacity="0.5"/>`,
  },
  {
    key: "water_goblet",
    name: "Water Goblet",
    ozLabel: "12–16 oz",
    aka: "Stemmed Water Glass",
    bestFor: ["Water", "Still Water", "Sparkling Water", "Juice", "Mocktail"],
    gradientNum: 51,
    svgInner: `<defs><linearGradient id="beer51" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#A8C8E0" stop-opacity="0.45"/><stop offset="100%" stop-color="#88A8C0" stop-opacity="0.65"/></linearGradient><linearGradient id="f51" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#F5F8FF"/></linearGradient></defs><path d="M20 26 Q14 48, 18 64 Q22 76, 36 78 L36 92 L26 94 L26 97 L54 97 L54 94 L44 92 L44 78 Q58 76, 62 64 Q66 48, 60 26 Z" fill="url(#beer51)" stroke="#7898b0" stroke-width="1" opacity="0.88"/><path d="M20 26 C24 22, 30 21, 36 23 C42 21, 50 21, 56 23 C59 22, 60 24, 60 26 Z" fill="url(#f51)" stroke="#c0d0dc" stroke-width="0.8"/><path d="M20 26 Q14 48, 18 64 Q22 76, 36 78 L36 92 L26 94 L26 97 L54 97 L54 94 L44 92 L44 78 Q58 76, 62 64 Q66 48, 60 26" fill="none" stroke="#7898b0" stroke-width="1.5"/>`,
  },
  {
    key: "juice_glass",
    name: "Juice Glass",
    ozLabel: "4–8 oz",
    aka: "Breakfast Glass · Small Tumbler",
    bestFor: ["Juice", "Orange Juice", "Smoothie", "Small Soft Drink", "Agua Fresca"],
    gradientNum: 52,
    svgInner: `<defs><linearGradient id="beer52" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E8A830" stop-opacity="0.65"/><stop offset="100%" stop-color="#C88010" stop-opacity="0.85"/></linearGradient><linearGradient id="f52" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF8E0"/><stop offset="100%" stop-color="#F8ECC0"/></linearGradient></defs><path d="M22 55 L20 100 L60 100 L58 55 Z" fill="url(#beer52)" stroke="#a07830" stroke-width="1.5" opacity="0.9"/><path d="M22 55 C26 52, 32 51, 40 53 C48 51, 54 52, 58 55 Z" fill="url(#f52)" stroke="#d0c090" stroke-width="0.8"/><path d="M22 55 L20 100 L60 100 L58 55" fill="none" stroke="#a07830" stroke-width="1.8"/><rect x="20" y="100" width="40" height="3" rx="1" fill="#a07830" opacity="0.4"/>`,
  },
  {
    key: "yunomi",
    name: "Yunomi",
    ozLabel: "5–8 oz",
    aka: "Japanese Tea Cup · Handleless Cup",
    bestFor: ["Japanese Tea", "Green Tea", "Matcha", "Sencha", "Hojicha"],
    gradientNum: 53,
    svgInner: `<defs><linearGradient id="beer53" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6B9858" stop-opacity="0.65"/><stop offset="100%" stop-color="#4A7838" stop-opacity="0.85"/></linearGradient><linearGradient id="f53" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#F5FFF5"/><stop offset="100%" stop-color="#E8F5E0"/></linearGradient></defs><path d="M24 34 Q22 42, 22 100 L58 100 Q58 42, 56 34 Z" fill="url(#beer53)" stroke="#508040" stroke-width="1.5" opacity="0.9"/><path d="M24 34 C27 31, 33 30, 40 32 C47 30, 53 31, 56 34 Z" fill="url(#f53)" stroke="#b0c8b0" stroke-width="0.8"/><path d="M24 34 Q22 42, 22 100 L58 100 Q58 42, 56 34" fill="none" stroke="#508040" stroke-width="1.8"/><rect x="22" y="100" width="36" height="3" rx="1" fill="#508040" opacity="0.4"/><rect x="26" y="40" width="2.5" height="55" rx="1.2" fill="white" opacity="0.06"/>`,
  },
];
