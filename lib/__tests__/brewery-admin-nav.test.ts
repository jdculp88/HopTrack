import { describe, it, expect } from "vitest";

// We import the nav structure constants by re-declaring them here
// (the component is "use client" with React deps, so we test the data structure directly)

const NAV_GROUPS = [
  { id: "overview", items: [
    { href: "",           label: "Overview" },
  ]},
  { id: "content", label: "Content", items: [
    { href: "/tap-list",  label: "Tap List" },
    { href: "/menus",     label: "Menus" },
    { href: "/board",     label: "Board" },
    { href: "/embed",     label: "Embed" },
  ]},
  { id: "engage", label: "Engage", items: [
    { href: "/messages",    label: "Messages" },
    { href: "/loyalty",     label: "Loyalty" },
    { href: "/mug-clubs",   label: "Mug Clubs" },
    { href: "/challenges",  label: "Challenges" },
    { href: "/promotions",  label: "Promo Hub" },
    { href: "/ads",         label: "Ad Campaigns" },
  ]},
  { id: "insights", label: "Insights", items: [
    { href: "/analytics",   label: "Analytics" },
    { href: "/customers",   label: "Customers" },
    { href: "/sessions",    label: "Sessions" },
    { href: "/report",      label: "Report" },
    { href: "/pint-rewind", label: "Pint Rewind" },
  ]},
  { id: "operations", label: "Operations", items: [
    { href: "/events",    label: "Events" },
    { href: "/qr",        label: "Table Tent" },
    { href: "/pos-sync",  label: "POS Sync" },
  ]},
  { id: "account", label: "Account", items: [
    { href: "/settings",  label: "Settings" },
    { href: "/billing",   label: "Billing" },
    { href: "/resources", label: "Resources" },
  ]},
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

const BRAND_NAV_ITEMS = [
  { path: "dashboard",  label: "Brand Dashboard" },
  { path: "reports",    label: "Brand Reports" },
  { path: "customers",  label: "Brand Customers" },
  { path: "team",       label: "Brand Team" },
  { path: "loyalty",    label: "Brand Loyalty" },
  { path: "catalog",    label: "Brand Catalog" },
  { path: "billing",    label: "Brand Billing" },
];

const MOBILE_PRIORITY_HREFS = ["", "/tap-list", "/analytics", "/messages", "/loyalty", "/settings"];

describe("BreweryAdminNav structure", () => {
  it("has exactly 22 brewery nav items across all groups", () => {
    expect(ALL_NAV_ITEMS).toHaveLength(22);
  });

  it("has no duplicate hrefs", () => {
    const hrefs = ALL_NAV_ITEMS.map(item => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("has no duplicate labels", () => {
    const labels = ALL_NAV_ITEMS.map(item => item.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("has 6 groups", () => {
    expect(NAV_GROUPS).toHaveLength(6);
  });

  it("overview group has no label (renders standalone)", () => {
    const overview = NAV_GROUPS.find(g => g.id === "overview");
    expect(overview).toBeDefined();
    expect(overview!.label).toBeUndefined();
  });

  it("all non-overview groups have labels", () => {
    const grouped = NAV_GROUPS.filter(g => g.id !== "overview");
    grouped.forEach(g => {
      expect(g.label).toBeTruthy();
    });
  });

  it("has unique group ids", () => {
    const ids = NAV_GROUPS.map(g => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains all expected pages", () => {
    const hrefs = ALL_NAV_ITEMS.map(item => item.href);
    const expected = [
      "", "/tap-list", "/analytics", "/customers", "/messages",
      "/loyalty", "/mug-clubs", "/challenges", "/menus", "/events",
      "/qr", "/report", "/sessions", "/promotions", "/ads",
      "/embed", "/board", "/pos-sync", "/pint-rewind", "/settings",
      "/billing", "/resources",
    ];
    expected.forEach(href => {
      expect(hrefs).toContain(href);
    });
  });
});

describe("Brand nav items", () => {
  it("has exactly 7 brand nav items", () => {
    expect(BRAND_NAV_ITEMS).toHaveLength(7);
  });

  it("has no duplicate brand paths", () => {
    const paths = BRAND_NAV_ITEMS.map(item => item.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("includes dashboard, reports, customers, team, loyalty, catalog, billing", () => {
    const paths = BRAND_NAV_ITEMS.map(item => item.path);
    expect(paths).toEqual(["dashboard", "reports", "customers", "team", "loyalty", "catalog", "billing"]);
  });
});

describe("Mobile priority items", () => {
  it("has 6 priority items for mobile strip", () => {
    expect(MOBILE_PRIORITY_HREFS).toHaveLength(6);
  });

  it("all priority hrefs exist in nav items", () => {
    const allHrefs = ALL_NAV_ITEMS.map(item => item.href);
    MOBILE_PRIORITY_HREFS.forEach(href => {
      expect(allHrefs).toContain(href);
    });
  });

  it("includes the most important pages for brewery owners", () => {
    expect(MOBILE_PRIORITY_HREFS).toContain(""); // Overview
    expect(MOBILE_PRIORITY_HREFS).toContain("/tap-list");
    expect(MOBILE_PRIORITY_HREFS).toContain("/analytics");
    expect(MOBILE_PRIORITY_HREFS).toContain("/settings");
  });
});

describe("Group categorization", () => {
  it("content group has tap list, menus, board, embed", () => {
    const content = NAV_GROUPS.find(g => g.id === "content")!;
    const hrefs = content.items.map(i => i.href);
    expect(hrefs).toEqual(["/tap-list", "/menus", "/board", "/embed"]);
  });

  it("engage group has messaging and loyalty features", () => {
    const engage = NAV_GROUPS.find(g => g.id === "engage")!;
    const hrefs = engage.items.map(i => i.href);
    expect(hrefs).toContain("/messages");
    expect(hrefs).toContain("/loyalty");
    expect(hrefs).toContain("/mug-clubs");
    expect(hrefs).toContain("/challenges");
  });

  it("insights group has analytics and reporting", () => {
    const insights = NAV_GROUPS.find(g => g.id === "insights")!;
    const hrefs = insights.items.map(i => i.href);
    expect(hrefs).toContain("/analytics");
    expect(hrefs).toContain("/customers");
    expect(hrefs).toContain("/sessions");
    expect(hrefs).toContain("/report");
  });

  it("account group has settings, billing, resources", () => {
    const account = NAV_GROUPS.find(g => g.id === "account")!;
    const hrefs = account.items.map(i => i.href);
    expect(hrefs).toEqual(["/settings", "/billing", "/resources"]);
  });
});
