/**
 * ROI calculation logic for brewery dashboard
 * Estimates revenue impact of HopTrack loyalty program
 */

// Industry average spend per brewery visit (conservative)
const DEFAULT_AVG_SPEND = 35;

export interface ROIData {
  loyaltyDrivenVisits: number;
  estimatedRevenue: number;
  subscriptionCost: number;
  roiMultiple: number;
  trend: number[]; // last 4 weeks of loyalty-driven visits
  periodLabel: string;
}

export function calculateROI(opts: {
  loyaltyVisitsThisMonth: number;
  loyaltyVisitsByWeek: number[]; // last 4 weeks
  subscriptionTier: 'free' | 'tap' | 'cask' | 'barrel';
  avgSpendPerVisit?: number;
}): ROIData {
  const avgSpend = opts.avgSpendPerVisit ?? DEFAULT_AVG_SPEND;
  const estimatedRevenue = opts.loyaltyVisitsThisMonth * avgSpend;

  const monthlyCost: Record<string, number> = {
    free: 0,
    tap: 49,
    cask: 149,
    barrel: 299, // placeholder for custom
  };

  const cost = monthlyCost[opts.subscriptionTier] || 0;
  const roiMultiple = cost > 0 ? Math.round((estimatedRevenue / cost) * 10) / 10 : 0;

  return {
    loyaltyDrivenVisits: opts.loyaltyVisitsThisMonth,
    estimatedRevenue,
    subscriptionCost: cost,
    roiMultiple,
    trend: opts.loyaltyVisitsByWeek,
    periodLabel: 'This month',
  };
}

export function formatROIMessage(roi: ROIData): string {
  if (roi.subscriptionCost === 0) {
    return `Your loyalty program drove ${roi.loyaltyDrivenVisits} repeat visits, worth an estimated $${roi.estimatedRevenue.toLocaleString()}.`;
  }
  if (roi.roiMultiple >= 1) {
    return `Your HopTrack subscription paid for itself ${roi.roiMultiple}x this month.`;
  }
  if (roi.loyaltyDrivenVisits > 0) {
    return `Your loyalty program drove ${roi.loyaltyDrivenVisits} repeat visits this month.`;
  }
  return 'Not enough data yet — loyalty visits will show here as customers check in.';
}
