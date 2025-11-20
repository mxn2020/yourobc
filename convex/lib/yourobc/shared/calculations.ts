// convex/lib/yourobc/shared/calculations.ts
// convex/yourobc/shared/calculations.ts

/**
 * Common calculation utilities shared across YourOBC modules
 */

export function calculateChargeableWeight(dimensions: {
  length: number;
  width: number;
  height: number;
  weight: number;
  unit: 'cm' | 'inch';
  weightUnit: 'kg' | 'lb';
}): number {
  // Convert to standard units (cm and kg)
  const lengthCm = dimensions.unit === 'inch' ? dimensions.length * 2.54 : dimensions.length;
  const widthCm = dimensions.unit === 'inch' ? dimensions.width * 2.54 : dimensions.width;
  const heightCm = dimensions.unit === 'inch' ? dimensions.height * 2.54 : dimensions.height;
  const actualWeightKg = dimensions.weightUnit === 'lb' ? dimensions.weight * 0.453592 : dimensions.weight;

  // Calculate volumetric weight (industry standard: length × width × height / 5000)
  const volumetricWeightKg = (lengthCm * widthCm * heightCm) / 5000;

  // Return the higher of actual weight or volumetric weight
  return Math.max(actualWeightKg, volumetricWeightKg);
}

export function calculateWorkingHours(timeEntries: Array<{
  type: 'login' | 'logout';
  timestamp: number;
}>): number {
  let totalHours = 0;
  let loginTime: number | null = null;

  const sortedEntries = [...timeEntries].sort((a, b) => a.timestamp - b.timestamp);

  for (const entry of sortedEntries) {
    if (entry.type === 'login') {
      loginTime = entry.timestamp;
    } else if (entry.type === 'logout' && loginTime) {
      totalHours += (entry.timestamp - loginTime) / (1000 * 60 * 60);
      loginTime = null;
    }
  }

  return Math.round(totalHours * 100) / 100;
}

export function calculateVacationDays(
  startDate: number,
  endDate: number,
  excludeWeekends = true
): number {
  let days = 0;
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    if (!excludeWeekends || (currentDate.getDay() !== 0 && currentDate.getDay() !== 6)) {
      days++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

export function convertCurrency(
  amount: number,
  rate: number,
  fromCurrency: 'EUR' | 'USD',
  toCurrency: 'EUR' | 'USD',
  source?: string
): {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: 'EUR' | 'USD';
  toCurrency: 'EUR' | 'USD';
  rate: number;
  source?: string;
} {
  const convertedAmount = Math.round(amount * rate * 100) / 100;
  
  return {
    originalAmount: amount,
    convertedAmount,
    fromCurrency,
    toCurrency,
    rate,
    source,
  };
}

export function getInverseRate(rate: number): number {
  return Math.round((1 / rate) * 10000) / 10000;
}

export function calculateKPI(
  current: number,
  target: number
): { percentage: number; status: 'good' | 'warning' | 'critical' } {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const status = percentage >= 90 ? 'good' : percentage >= 70 ? 'warning' : 'critical';
  return { percentage: Math.round(percentage), status };
}

export function getPriorityWeight(priority: string): number {
  const weights: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4,
    critical: 5,
    standard: 2,
  };
  return weights[priority] || 2;
}

export function calculateCommission(
  baseAmount: number,
  rate: number,
  type: 'percentage' | 'fixed'
): number {
  if (type === 'percentage') {
    return Math.round((baseAmount * rate / 100) * 100) / 100;
  } else {
    return rate;
  }
}

export function calculateSearchRelevance(
  searchTerm: string,
  content: string,
  title: string
): number {
  const termLower = searchTerm.toLowerCase();
  const contentLower = content.toLowerCase();
  const titleLower = title.toLowerCase();
  
  let score = 0;
  
  // Exact title match (highest score)
  if (titleLower === termLower) score += 100;
  else if (titleLower.includes(termLower)) score += 50;
  
  // Content match
  const contentMatches = (contentLower.match(new RegExp(termLower, 'g')) || []).length;
  score += contentMatches * 5;
  
  // Word boundary matches (higher score for whole word matches)
  const wordBoundaryRegex = new RegExp(`\\b${termLower}\\b`, 'gi');
  const wordMatches = (content.match(wordBoundaryRegex) || []).length;
  score += wordMatches * 10;
  
  return score;
}