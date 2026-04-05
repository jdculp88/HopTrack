// Copyright 2026 HopTrack. All rights reserved.
// Unit tests for variable XP multiplier (Sprint 161 — The Vibe)
import { describe, it, expect } from 'vitest';
import { rollXpMultiplier, applyXpMultiplier } from '../xp';

describe('rollXpMultiplier', () => {
  it('returns a tier and a multiplier', () => {
    const result = rollXpMultiplier();
    expect(result).toHaveProperty('multiplier');
    expect(result).toHaveProperty('tier');
    expect(['normal', 'lucky', 'golden']).toContain(result.tier);
  });

  it('returns multiplier 2.0 when tier is lucky', () => {
    // Run until we hit lucky — statistically certain within 10k rolls
    for (let i = 0; i < 10000; i++) {
      const { multiplier, tier } = rollXpMultiplier();
      if (tier === 'lucky') {
        expect(multiplier).toBe(2.0);
        return;
      }
    }
  });

  it('returns multiplier 5.0 when tier is golden', () => {
    // Run until we hit golden — statistically certain within 50k rolls (1% chance)
    for (let i = 0; i < 50000; i++) {
      const { multiplier, tier } = rollXpMultiplier();
      if (tier === 'golden') {
        expect(multiplier).toBe(5.0);
        return;
      }
    }
  });

  it('returns multiplier in [0.8, 1.2] when tier is normal', () => {
    for (let i = 0; i < 1000; i++) {
      const { multiplier, tier } = rollXpMultiplier();
      if (tier === 'normal') {
        expect(multiplier).toBeGreaterThanOrEqual(0.8);
        expect(multiplier).toBeLessThanOrEqual(1.2);
      }
    }
  });

  it('distribution: ~94% normal, ~5% lucky, ~1% golden over 100k rolls', () => {
    const counts = { normal: 0, lucky: 0, golden: 0 };
    const N = 100000;
    for (let i = 0; i < N; i++) {
      counts[rollXpMultiplier().tier]++;
    }

    const normalPct = (counts.normal / N) * 100;
    const luckyPct = (counts.lucky / N) * 100;
    const goldenPct = (counts.golden / N) * 100;

    // Tolerances: 100k samples give tight confidence intervals
    expect(normalPct).toBeGreaterThan(93);
    expect(normalPct).toBeLessThan(95);
    expect(luckyPct).toBeGreaterThan(4.5);
    expect(luckyPct).toBeLessThan(5.5);
    expect(goldenPct).toBeGreaterThan(0.7);
    expect(goldenPct).toBeLessThan(1.3);

    // Sanity: total should equal N
    expect(counts.normal + counts.lucky + counts.golden).toBe(N);
  });

  it('normal multiplier distribution is roughly uniform across [0.8, 1.2]', () => {
    const buckets = [0, 0, 0, 0]; // [0.8-0.9, 0.9-1.0, 1.0-1.1, 1.1-1.2]
    const N = 10000;
    let normalCount = 0;

    for (let i = 0; i < N; i++) {
      const { multiplier, tier } = rollXpMultiplier();
      if (tier === 'normal') {
        normalCount++;
        const idx = Math.min(3, Math.floor((multiplier - 0.8) / 0.1));
        buckets[idx]++;
      }
    }

    // Each bucket should be roughly 25% of normal rolls (±5% tolerance)
    for (const count of buckets) {
      const pct = (count / normalCount) * 100;
      expect(pct).toBeGreaterThan(20);
      expect(pct).toBeLessThan(30);
    }
  });
});

describe('applyXpMultiplier', () => {
  it('returns finalXp, tier, and multiplier', () => {
    const result = applyXpMultiplier(100);
    expect(result).toHaveProperty('finalXp');
    expect(result).toHaveProperty('tier');
    expect(result).toHaveProperty('multiplier');
    expect(typeof result.finalXp).toBe('number');
  });

  it('finalXp is integer (rounded)', () => {
    for (let i = 0; i < 100; i++) {
      const { finalXp } = applyXpMultiplier(73);
      expect(Number.isInteger(finalXp)).toBe(true);
    }
  });

  it('finalXp = Math.round(baseXp * multiplier)', () => {
    for (let i = 0; i < 100; i++) {
      const baseXp = 85;
      const { finalXp, multiplier } = applyXpMultiplier(baseXp);
      expect(finalXp).toBe(Math.round(baseXp * multiplier));
    }
  });

  it('golden tier yields 5× the baseXp', () => {
    for (let i = 0; i < 50000; i++) {
      const baseXp = 100;
      const { finalXp, tier } = applyXpMultiplier(baseXp);
      if (tier === 'golden') {
        expect(finalXp).toBe(500);
        return;
      }
    }
  });

  it('lucky tier yields 2× the baseXp', () => {
    for (let i = 0; i < 10000; i++) {
      const baseXp = 73;
      const { finalXp, tier } = applyXpMultiplier(baseXp);
      if (tier === 'lucky') {
        expect(finalXp).toBe(146);
        return;
      }
    }
  });

  it('handles zero baseXp', () => {
    const { finalXp } = applyXpMultiplier(0);
    expect(finalXp).toBe(0);
  });

  it('handles large baseXp values', () => {
    for (let i = 0; i < 100; i++) {
      const { finalXp, multiplier } = applyXpMultiplier(10000);
      expect(finalXp).toBeGreaterThanOrEqual(8000); // min: 10000 * 0.8
      expect(finalXp).toBeLessThanOrEqual(50000); // max: 10000 * 5.0 (golden)
      expect(finalXp).toBe(Math.round(10000 * multiplier));
    }
  });
});
