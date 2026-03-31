/**
 * HopTrack — Barback Crawl Script (Charlotte NC Pilot)
 *
 * Crawls unclaimed brewery websites for beer/tap list data using AI extraction.
 * Reads from `crawl_sources` table, fetches website HTML, sends cleaned text
 * to Claude Haiku for structured extraction, inserts results into `crawled_beers`.
 *
 * Usage:  node scripts/barback-crawl.mjs
 *         npm run barback
 *
 * Drew 🍻: "If their tap list is on the website, we should know about it."
 * Quinn ⚙️: "Respects robots.txt, 2-second delay, SHA-256 dedup. Clean pipeline."
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "crypto";

// ── Config ────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!ANTHROPIC_API_KEY) {
  console.error("❌ Missing ANTHROPIC_API_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const MODEL = "claude-haiku-4-5-20251001";
const USER_AGENT = "HopTrack-Barback/1.0 (craft beer discovery; contact@hoptrack.beer)";
const BATCH_SIZE = 50;
const DELAY_MS = 2000;
const FETCH_TIMEOUT_MS = 10000;
const MAX_CLEANED_CHARS = 8000;

// Charlotte metro pilot cities (belt + suspenders)
const PILOT_CITIES = [
  "charlotte",
  "huntersville",
  "cornelius",
  "matthews",
  "mint hill",
  "pineville",
  "concord",
  "mooresville",
  "gastonia",
  "fort mill",
  "rock hill",
  "indian trail",
  "kannapolis",
  "mount holly",
];

// Cost per token (Claude Haiku 3.5)
const COST_PER_INPUT_TOKEN = 0.25 / 1_000_000;
const COST_PER_OUTPUT_TOKEN = 1.25 / 1_000_000;

// ── Robots.txt Cache ──────────────────────────────────────────────

const robotsCache = new Map();

async function checkRobotsTxt(url) {
  try {
    const { origin } = new URL(url);
    if (robotsCache.has(origin)) return robotsCache.get(origin);

    const robotsUrl = `${origin}/robots.txt`;
    const res = await fetch(robotsUrl, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      // No robots.txt = allowed
      robotsCache.set(origin, true);
      return true;
    }

    const text = await res.text();
    // Simple check: look for Disallow: / targeting our user agent or *
    const lines = text.split("\n").map((l) => l.trim().toLowerCase());
    let inOurBlock = false;
    let inWildcard = false;

    for (const line of lines) {
      if (line.startsWith("user-agent:")) {
        const agent = line.split(":")[1]?.trim();
        inOurBlock = agent === "hoptrack-barback" || agent === "hoptrack";
        inWildcard = agent === "*";
      }
      if ((inOurBlock || inWildcard) && line === "disallow: /") {
        robotsCache.set(origin, false);
        return false;
      }
    }

    robotsCache.set(origin, true);
    return true;
  } catch {
    // Network error checking robots.txt — allow crawl
    robotsCache.set(new URL(url).origin, true);
    return true;
  }
}

// ── HTML Cleaning ─────────────────────────────────────────────────

function cleanHtml(html) {
  let text = html;

  // Strip tags we don't want
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, "");
  text = text.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  text = text.replace(/<header[\s\S]*?<\/header>/gi, "");
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, "");

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();

  // If too long, find the beer-related section
  if (text.length > MAX_CLEANED_CHARS) {
    const beerKeywords =
      /\b(tap list|on tap|our beers|beer menu|draft|ipa|stout|lager|ale|porter|abv|ibu|hops|brew)\b/gi;
    const matches = [...text.matchAll(beerKeywords)];

    if (matches.length > 0) {
      // Center around the densest cluster of beer keywords
      const firstMatch = matches[0].index;
      const start = Math.max(0, firstMatch - 500);
      const end = Math.min(text.length, start + MAX_CLEANED_CHARS);
      text = text.slice(start, end);
    } else {
      // No beer keywords found — just take the first chunk
      text = text.slice(0, MAX_CLEANED_CHARS);
    }
  }

  return text;
}

// ── SHA-256 Hash ──────────────────────────────────────────────────

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

// ── AI Extraction ─────────────────────────────────────────────────

const EXTRACTION_PROMPT = `You are extracting a beer/tap list from a brewery's website. You will receive cleaned text content from the page.

Extract ONLY beers that are clearly listed as currently available (on tap, on the menu, "our beers", etc). Do NOT invent beers. Do NOT guess. If you're unsure whether something is a beer name or a heading/description, skip it.

For each beer, extract:
- name (required): the beer name exactly as written
- style: beer style if mentioned (e.g. IPA, Stout, Lager)
- abv: ABV percentage if listed (number only, e.g. 6.5)
- ibu: IBU if listed (number only)
- description: tasting notes or description if provided (1-2 sentences max)
- confidence: your confidence this is a real beer on their current menu (0.0-1.0)

Rules:
- If the page has no beer list, return an empty array.
- Do NOT include merchandise, food items, or non-beer drinks.
- Confidence: 0.9+ for clearly formatted tap lists, 0.7-0.9 for names without details, below 0.5 do not include.

Return JSON array only. No markdown. No explanation.`;

async function extractBeers(cleanedText) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `${EXTRACTION_PROMPT}\n\n--- WEBSITE CONTENT ---\n${cleanedText}`,
      },
    ],
  });

  let text = response.content[0]?.text || "[]";
  const inputTokens = response.usage?.input_tokens || 0;
  const outputTokens = response.usage?.output_tokens || 0;

  // Strip markdown code fences if Haiku wraps the response
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let beers;
  try {
    beers = JSON.parse(text);
    if (!Array.isArray(beers)) beers = [];
  } catch {
    throw new Error(`AI returned invalid JSON: ${text.slice(0, 200)}`);
  }

  // Filter out low-confidence and validate required fields
  beers = beers.filter(
    (b) => b && typeof b.name === "string" && b.name.trim() && (b.confidence ?? 0) >= 0.5
  );

  return { beers, inputTokens, outputTokens };
}

// ── Fetch with timeout ────────────────────────────────────────────

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ── Sleep helper ──────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main Crawl Pipeline ───────────────────────────────────────────

async function main() {
  console.log("🍺 HopTrack Barback — Charlotte NC Pilot Crawl\n");
  console.log(`   Model: ${MODEL}`);
  console.log(`   Batch size: ${BATCH_SIZE}`);
  console.log(`   Delay: ${DELAY_MS}ms between breweries\n`);

  // ── 1. Query crawl sources ──

  const { data: sources, error: queryError } = await supabase
    .from("crawl_sources")
    .select("*, brewery:breweries!inner(id, name, city, state, verified, website_url, brewery_type)")
    .eq("crawl_enabled", true)
    .eq("crawl_mode", "unclaimed")
    .eq("breweries.verified", false)
    .neq("breweries.brewery_type", "closed")
    .neq("breweries.brewery_type", "planning")
    .lte("next_crawl_at", new Date().toISOString())
    .limit(BATCH_SIZE);

  if (queryError) {
    console.error("❌ Query error:", queryError.message);
    process.exit(1);
  }

  if (!sources || sources.length === 0) {
    console.log("✅ No breweries due for crawl. All caught up.\n");
    return;
  }

  // Charlotte metro pilot filter (belt + suspenders)
  const filtered = sources.filter((s) => {
    const city = (s.brewery?.city || "").toLowerCase().trim();
    return PILOT_CITIES.includes(city);
  });

  if (filtered.length === 0) {
    console.log("✅ No Charlotte-area breweries due for crawl.\n");
    return;
  }

  console.log(`📋 Found ${filtered.length} breweries to crawl\n`);

  // ── 2. Crawl each brewery ──

  const stats = {
    queried: filtered.length,
    crawled: 0,
    skipped: 0,
    failed: 0,
    beersFound: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
  };

  let consecutiveFailures = 0;

  for (const source of filtered) {
    const brewery = source.brewery;
    const breweryName = brewery?.name || "Unknown";
    const crawlUrl = source.crawl_url || brewery?.website_url;

    console.log(`── ${breweryName} ──`);

    if (!crawlUrl) {
      console.log("   ⚠️  No URL — skipping");
      stats.failed++;
      continue;
    }

    try {
      // a. Check robots.txt
      const allowed = await checkRobotsTxt(crawlUrl);
      if (!allowed) {
        console.log("   🚫 Blocked by robots.txt — skipping");
        stats.skipped++;

        await supabase
          .from("crawl_sources")
          .update({
            next_crawl_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq("id", source.id);

        continue;
      }

      // b. Fetch page — try beer subpages first, fall back to homepage
      const baseUrl = crawlUrl.replace(/\/+$/, "");
      const BEER_PATHS = ["/beer", "/beers", "/menu", "/on-tap", "/tap-list", "/our-beers", "/taproom", "/tap-room", "/what-s-on-tap", "/beer/untappd", "/untappd", "/on-draft", "/draft-list", "/whats-on-tap", "/beer-menu", "/drink-menu", "/drinks"];

      let html = "";
      let fetchedUrl = "";

      // First: scan homepage for links to beer/menu pages
      console.log(`   🌐 Fetching ${crawlUrl}`);
      const homeRes = await fetchWithTimeout(crawlUrl);
      if (!homeRes.ok) {
        throw new Error(`HTTP ${homeRes.status} ${homeRes.statusText}`);
      }
      const homeHtml = await homeRes.text();

      // Look for beer page links in the homepage HTML
      const beerLinkPattern = /href=["']([^"']*(?:beer|menu|tap|on-tap|our-beer|taproom)[^"']*)["']/gi;
      const foundLinks = new Set();
      let match;
      while ((match = beerLinkPattern.exec(homeHtml)) !== null) {
        let href = match[1];
        // Resolve relative URLs
        if (href.startsWith("/")) href = baseUrl + href;
        else if (!href.startsWith("http")) href = baseUrl + "/" + href;
        // Only same domain
        try {
          const linkHost = new URL(href).hostname;
          const baseHost = new URL(baseUrl).hostname;
          if (linkHost === baseHost) foundLinks.add(href);
        } catch {}
      }

      // Try found beer page links first, then fallback paths, then homepage
      const urlsToTry = [...foundLinks, ...BEER_PATHS.map((p) => baseUrl + p)];
      let bestHtml = homeHtml;
      let bestUrl = crawlUrl;
      let bestBeerScore = 0;

      // Score the homepage for beer content
      const beerKeywords = /\b(abv|ibu|ipa|stout|lager|ale|porter|pilsner|wheat|sour|hazy|on tap|draft|tap list|our beers?)\b/gi;
      bestBeerScore = (homeHtml.match(beerKeywords) || []).length;

      for (const tryUrl of urlsToTry) {
        try {
          await sleep(500); // Polite sub-request delay
          const subRes = await fetchWithTimeout(tryUrl);
          if (subRes.ok) {
            const subHtml = await subRes.text();
            const score = (subHtml.match(beerKeywords) || []).length;
            if (score > bestBeerScore) {
              bestHtml = subHtml;
              bestUrl = tryUrl;
              bestBeerScore = score;
              console.log(`   🎯 Found beer page: ${tryUrl} (score: ${score})`);
            }
          }
        } catch {
          // Subpage doesn't exist — that's fine
        }
      }

      html = bestHtml;
      fetchedUrl = bestUrl;
      if (bestUrl !== crawlUrl) {
        console.log(`   📍 Using: ${bestUrl}`);
      }

      // c. SHA-256 hash check
      const hash = sha256(html);
      if (hash === source.last_html_hash) {
        console.log("   ♻️  Content unchanged — skipping");
        stats.skipped++;

        await supabase
          .from("crawl_sources")
          .update({
            next_crawl_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq("id", source.id);

        await supabase.from("crawl_jobs").insert({
          source_url: fetchedUrl || crawlUrl,
          brewery_id: brewery.id,
          status: "skipped",
          html_hash: hash,
          beers_found: 0,
        });

        continue;
      }

      // d. Clean HTML
      const cleaned = cleanHtml(html);
      console.log(`   📄 Cleaned: ${cleaned.length} chars`);

      if (cleaned.length < 50) {
        console.log("   ⚠️  Too little content — skipping");
        stats.skipped++;
        continue;
      }

      // e. AI extraction
      console.log(`   🤖 Extracting with ${MODEL}...`);
      const { beers, inputTokens, outputTokens } = await extractBeers(cleaned);

      stats.totalInputTokens += inputTokens;
      stats.totalOutputTokens += outputTokens;

      console.log(
        `   🍺 Found ${beers.length} beers (${inputTokens}+${outputTokens} tokens)`
      );

      // f. Insert crawl job FIRST (need the ID for crawled_beers FK)
      const { data: jobData, error: jobError } = await supabase
        .from("crawl_jobs")
        .insert({
          source_url: fetchedUrl || crawlUrl,
          brewery_id: brewery.id,
          status: "completed",
          raw_html_hash: hash,
          raw_html_size: html.length,
          tokens_used: inputTokens + outputTokens,
          cost_usd: (inputTokens * 0.25 + outputTokens * 1.25) / 1_000_000,
          beers_found: beers.length,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (jobError) {
        console.warn(`   ⚠️  Crawl job insert error: ${jobError.message}`);
      }

      const crawlJobId = jobData?.id;

      // g. Insert crawled beers (staging)
      if (beers.length > 0 && crawlJobId) {
        const beerRows = beers.map((b) => ({
          crawl_job_id: crawlJobId,
          brewery_id: brewery.id,
          name: b.name.trim(),
          style: b.style || null,
          abv: b.abv != null ? parseFloat(b.abv) : null,
          ibu: b.ibu != null ? parseInt(b.ibu, 10) : null,
          description: b.description || null,
          confidence: b.confidence ?? 0.7,
          source_text: b.name.trim(), // raw extracted text for audit
        }));

        const { error: insertError } = await supabase
          .from("crawled_beers")
          .insert(beerRows);

        if (insertError) {
          console.warn(`   ⚠️  Beer insert error: ${insertError.message}`);
        } else {
          stats.beersFound += beers.length;

          // Auto-promote high-confidence beers (>= 0.85) directly to production
          const highConfBeers = beers.filter((b) => (b.confidence ?? 0) >= 0.85);
          const lowConfBeers = beers.filter((b) => (b.confidence ?? 0) < 0.85);

          if (highConfBeers.length > 0) {
            // Mark as approved in staging
            await supabase
              .from("crawled_beers")
              .update({ status: "approved", promoted_at: new Date().toISOString() })
              .eq("crawl_job_id", crawlJobId)
              .gte("confidence", 0.85);

            // Insert into production beers table
            let promoted = 0;
            for (const b of highConfBeers) {
              const beerName = b.name.trim();
              // Check for existing beer at this brewery
              const { data: existing } = await supabase
                .from("beers")
                .select("id")
                .eq("brewery_id", brewery.id)
                .ilike("name", beerName)
                .single();

              if (existing) {
                // Update existing — refresh verified timestamp
                await supabase
                  .from("beers")
                  .update({ last_verified_at: new Date().toISOString(), is_on_tap: true })
                  .eq("id", existing.id);
              } else {
                // Insert new beer
                await supabase.from("beers").insert({
                  brewery_id: brewery.id,
                  name: beerName,
                  style: b.style || null,
                  abv: b.abv != null ? parseFloat(b.abv) : null,
                  ibu: b.ibu != null ? parseInt(b.ibu, 10) : null,
                  description: b.description || null,
                  source: "crawled",
                  is_on_tap: true,
                  last_verified_at: new Date().toISOString(),
                });
              }
              promoted++;
            }

            // Update staging status to promoted
            await supabase
              .from("crawled_beers")
              .update({ status: "promoted", promoted_at: new Date().toISOString() })
              .eq("crawl_job_id", crawlJobId)
              .gte("confidence", 0.85);

            console.log(`   ✅ Auto-promoted ${promoted} high-confidence beers`);
            if (lowConfBeers.length > 0) {
              console.log(`   📋 ${lowConfBeers.length} beers pending manual review`);
            }
          } else {
            console.log(`   📋 Staged ${beers.length} beers for manual review`);
          }
        }
      } else if (beers.length > 0) {
        console.warn(`   ⚠️  Skipping beer insert — no crawl_job_id`);
      }

      // h. Update crawl source
      await supabase
        .from("crawl_sources")
        .update({
          last_crawled_at: new Date().toISOString(),
          last_html_hash: hash,
          next_crawl_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          consecutive_failures: 0,
        })
        .eq("id", source.id);

      stats.crawled++;
      consecutiveFailures = 0;
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
      stats.failed++;
      consecutiveFailures++;

      // Record failed job
      const { error: jobErr } = await supabase.from("crawl_jobs").insert({
        brewery_id: brewery.id,
        status: "failed",
        error_message: err.message?.slice(0, 500),
      });
      if (jobErr) console.warn(`   ⚠️ Failed to log crawl_job: ${jobErr.message}`);

      // Circuit breaker: 3 consecutive failures → disable source
      if (consecutiveFailures >= 3) {
        console.warn(
          `   🔌 Circuit breaker: ${consecutiveFailures} consecutive failures — disabling crawl`
        );
        await supabase
          .from("crawl_sources")
          .update({ crawl_enabled: false })
          .eq("id", source.id);
      }
    }

    // i. Delay between breweries
    if (filtered.indexOf(source) < filtered.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // ── 3. Summary ──

  const estimatedCost =
    stats.totalInputTokens * COST_PER_INPUT_TOKEN +
    stats.totalOutputTokens * COST_PER_OUTPUT_TOKEN;

  console.log("\n── Summary ─────────────────────────────────");
  console.log(`   Queried:    ${stats.queried} breweries`);
  console.log(`   Crawled:    ${stats.crawled}`);
  console.log(`   Skipped:    ${stats.skipped}`);
  console.log(`   Failed:     ${stats.failed}`);
  console.log(`   Beers found: ${stats.beersFound}`);
  console.log(
    `   Tokens:     ${stats.totalInputTokens.toLocaleString()} in / ${stats.totalOutputTokens.toLocaleString()} out`
  );
  console.log(`   Est. cost:  $${estimatedCost.toFixed(4)}`);
  console.log("─────────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("💀 Fatal error:", err);
  process.exit(1);
});
