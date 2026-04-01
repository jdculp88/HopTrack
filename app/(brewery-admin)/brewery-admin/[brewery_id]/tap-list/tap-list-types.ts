import type { BeerStyle, ItemType } from "@/types/database";

export interface Beer {
  id: string;
  name: string;
  style: string;
  abv: number | null;
  ibu: number | null;
  description: string | null;
  is_on_tap: boolean;
  is_featured: boolean;
  is_86d: boolean;
  display_order: number;
  avg_rating: number | null;
  total_checkins: number;
  price_per_pint: number | null;
  glass_type: string | null;
  item_type: ItemType;
  category: string | null;
}

export interface PourSizeRow {
  id?: string;
  label: string;
  oz: string;
  price: string;
  display_order: number;
}

export interface BeerFormData {
  name: string;
  style: BeerStyle;
  abv: string;
  ibu: string;
  description: string;
  price: string;
  itemType: ItemType;
  category: string;
}

export const STYLES: BeerStyle[] = [
  "IPA","Double IPA","Hazy IPA","Session IPA","Pale Ale","Stout","Imperial Stout",
  "Porter","Lager","Pilsner","Sour","Gose","Berliner Weisse","Wheat","Hefeweizen",
  "Belgian","Saison","Amber","Red Ale","Blonde Ale","Cream Ale","Barleywine",
  "Kolsch","Cider","Mead","Other",
];

// Food items are managed via menu PDF/image upload in Settings -- not as tap list items
export const ITEM_TYPES: { value: ItemType; label: string; emoji: string }[] = [
  { value: "beer", label: "Beer", emoji: "\u{1F37A}" },
  { value: "cider", label: "Cider", emoji: "\u{1F34F}" },
  { value: "wine", label: "Wine", emoji: "\u{1F377}" },
  { value: "cocktail", label: "Cocktail", emoji: "\u{1F379}" },
  { value: "na_beverage", label: "Non-Alcoholic", emoji: "\u{1F964}" },
];

// Which fields are relevant per item type
export function showStyleField(t: ItemType) { return t === "beer"; }
export function showAbvField(t: ItemType) { return t !== "food" && t !== "na_beverage"; }
export function showIbuField(t: ItemType) { return t === "beer"; }

// Default glass type per item type
export const DEFAULT_GLASS: Partial<Record<ItemType, string>> = {
  wine: "wine_glass",
  beer: "shaker_pint",
};

// Glasses appropriate per drink type -- exact one-for-one matches from guide, in guide order
export const GLASSES_BY_TYPE: Record<ItemType, string[]> = {
  beer: [
    "shaker_pint", "nonic_pint", "tulip", "snifter", "weizen_glass", "pilsner_glass",
    "goblet_chalice", "ipa_glass", "stange", "mug_stein", "flute", "teku", "thistle",
    "wine_glass", "willi_becher", "dimple_mug", "pokal", "yard_glass", "boot_glass", "sam_adams_pint",
  ],
  cider: [
    "shaker_pint", "white_wine_glass", "flute", "sidra_glass", "tulip",
    "goblet_chalice", "copa_balloon", "bolee", "snifter", "mason_jar",
  ],
  wine: [
    "bordeaux_glass", "burgundy_glass", "white_wine_glass", "sauvignon_blanc_glass",
    "flute", "champagne_coupe", "rose_glass", "port_glass", "copita",
    "universal_wine_glass", "stemless_wine_glass", "riesling_glass",
  ],
  cocktail: [
    "champagne_coupe", "martini_glass", "rocks_glass", "highball", "nick_nora", "copper_mug",
    "hurricane", "margarita_glass", "julep_cup", "glencairn", "tiki_mug", "shot_glass",
  ],
  na_beverage: [
    "coffee_mug", "espresso_cup", "latte_glass", "teacup", "highball",
    "rocks_glass", "champagne_coupe", "water_goblet", "juice_glass", "yunomi",
  ],
  food: [],
};

export const POUR_QUICK_ADD: Array<{ label: string; oz: string }> = [
  { label: "Taster", oz: "5" },
  { label: "Half Pint", oz: "8" },
  { label: "Pint", oz: "16" },
  { label: "22oz Pint", oz: "22" },
  { label: "Growler", oz: "32" },
  { label: "Flight", oz: "" },
];

export const emptyBeer: BeerFormData = {
  name: "",
  style: "IPA",
  abv: "",
  ibu: "",
  description: "",
  price: "",
  itemType: "beer",
  category: "",
};

export function validateNumericFields(form: BeerFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (form.abv !== "") {
    const v = parseFloat(form.abv);
    if (isNaN(v) || v < 0 || v > 100) errors.abv = "ABV must be 0\u2013100%";
  }
  if (form.ibu !== "") {
    const v = parseInt(form.ibu);
    if (isNaN(v) || v < 0 || v > 200) errors.ibu = "IBU must be 0\u2013200";
  }
  if (form.price !== "") {
    const v = parseFloat(form.price);
    if (isNaN(v) || v < 0 || v > 999) errors.price = "Price must be $0\u2013$999";
  }
  return errors;
}
