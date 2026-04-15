#!/usr/bin/env node
/**
 * Wiki dead-link checker.
 *
 * Walks every .md file under docs/ (plus the repo-root README.md and
 * CLAUDE.md/AGENTS.md/CONTRIBUTING.md), parses every [text](path) markdown link,
 * and asserts the target exists on disk.
 *
 * External links (http://, https://, mailto:, #anchor-only) are skipped.
 *
 * Owned by Reese. Runs in CI intent: `node scripts/check-wiki-links.mjs`.
 * Exits 0 if clean, 1 if any dead link found.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { join, dirname, resolve, relative } from "node:path";
import { existsSync } from "node:fs";

const ROOT = resolve(process.cwd());
const DOCS = join(ROOT, "docs");

const TARGETS = [
  join(ROOT, "README.md"),
  join(ROOT, "CLAUDE.md"),
  join(ROOT, "AGENTS.md"),
  join(ROOT, "CONTRIBUTING.md"),
];

// Regex for Markdown links: [text](path). Captures the path portion.
const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

async function walkDocs(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walkDocs(full)));
    } else if (e.isFile() && e.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

function stripFragment(p) {
  const i = p.indexOf("#");
  return i === -1 ? p : p.slice(0, i);
}

function isExternal(p) {
  return /^(https?:|mailto:|tel:)/i.test(p);
}

function stripFencedCode(src) {
  // Remove ```...``` blocks (fenced code) before link scanning.
  return src.replace(/```[\s\S]*?```/g, "");
}

async function checkFile(file) {
  const rawSrc = await readFile(file, "utf8");
  const src = stripFencedCode(rawSrc);
  const base = dirname(file);
  const issues = [];

  let m;
  // Reset regex state per file.
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(src)) !== null) {
    const raw = m[2];
    if (!raw || isExternal(raw)) continue;
    if (raw.startsWith("#")) continue; // in-page anchor only
    const path = stripFragment(raw);
    if (!path) continue;
    // URL-decode things like %20 for spaces.
    let decoded;
    try {
      decoded = decodeURIComponent(path);
    } catch {
      decoded = path;
    }
    const abs = resolve(base, decoded);
    if (!existsSync(abs)) {
      issues.push({ file: relative(ROOT, file), link: raw, resolved: relative(ROOT, abs) });
    }
  }
  return issues;
}

async function main() {
  const files = [...TARGETS.filter((f) => existsSync(f))];
  if (existsSync(DOCS)) {
    files.push(...(await walkDocs(DOCS)));
  }

  let total = 0;
  let dead = 0;
  const allIssues = [];

  for (const f of files) {
    const issues = await checkFile(f);
    // Count links by re-scanning (excluding code blocks).
    const src = stripFencedCode(await readFile(f, "utf8"));
    const matches = src.match(LINK_RE) || [];
    total += matches.length;
    dead += issues.length;
    allIssues.push(...issues);
  }

  if (allIssues.length === 0) {
    console.log(`✅ Wiki link check: ${total} links across ${files.length} files, all valid.`);
    process.exit(0);
  }

  console.error(`❌ Wiki link check: ${dead} dead link(s) out of ${total} across ${files.length} files.`);
  for (const i of allIssues) {
    console.error(`  ${i.file}  →  ${i.link}  (resolved: ${i.resolved})`);
  }
  process.exit(1);
}

main().catch((e) => {
  console.error("link checker crashed:", e);
  process.exit(2);
});
