import type {
  BorrowerInput,
  LoanResult,
  Verdict,
  RateBand,
  StressTest,
  NegotiationCard,
} from '@/types';

// ── Domain constants ──────────────────────────────────────────────────────

export const FOIR_LIMITS: Record<string, number> = {
  salaried: 0.5,
  'self-employed': 0.45,
  informal: 0.35,
};

export const RISK_PREMIUM_UNKNOWN_CREDIT = 0.025; // +2.5%
export const BASE_RATE_SALARIED = 0.095; // 9.5%
export const BASE_RATE_SELF_EMPLOYED = 0.105; // 10.5%
export const BASE_RATE_INFORMAL = 0.14; // 14%
export const PROCESSING_FEE_RATE = 0.012; // 1.2% of loan amount
export const PROCESSING_FEE_GST = 0.18; // 18% GST on fee
export const SAFE_CARRY_FACTOR = 0.7; // 70% of sanction limit
export const STRESS_INCOME_DROP = 0.2; // 20% income drop
export const COLLATERAL_LTV = 0.7; // 70% of collateral value

const CREDIT_SCORE_BANDS: { min: number; max: number; adjustment: number }[] = [
  { min: 800, max: 900, adjustment: -0.005 },
  { min: 750, max: 799, adjustment: 0 },
  { min: 700, max: 749, adjustment: 0.005 },
  { min: 650, max: 699, adjustment: 0.01 },
  { min: 600, max: 649, adjustment: 0.02 },
  { min: 300, max: 599, adjustment: 0.035 },
];

// ── Helpers ───────────────────────────────────────────────────────────────

export function formatINR(amount: number): string {
  const rounded = Math.round(amount);
  return '₹' + rounded.toLocaleString('en-IN');
}

export function formatINRShort(amount: number): string {
  if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
  if (amount >= 100000) return '₹' + (amount / 100000).toFixed(2) + ' L';
  if (amount >= 1000) return '₹' + (amount / 1000).toFixed(0) + 'K';
  return formatINR(amount);
}

function getBaseRate(employmentType: string): number {
  switch (employmentType) {
    case 'salaried':
      return BASE_RATE_SALARIED;
    case 'self-employed':
      return BASE_RATE_SELF_EMPLOYED;
    case 'informal':
      return BASE_RATE_INFORMAL;
    default:
      return BASE_RATE_INFORMAL;
  }
}

function getCreditAdjustment(creditStatus: string, creditScore: number): number {
  if (creditStatus === 'unknown') return RISK_PREMIUM_UNKNOWN_CREDIT;
  const band = CREDIT_SCORE_BANDS.find(
    (b) => creditScore >= b.min && creditScore <= b.max,
  );
  return band ? band.adjustment : 0.035;
}

function computeFOIR(income: number, emi: number): number {
  if (income <= 0) return 0;
  return emi / income;
}

function computeEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (tenureMonths <= 0) return 0;
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return principal / tenureMonths;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function computeMaxLoanFromEMI(
  maxEMI: number,
  annualRate: number,
  tenureMonths: number,
): number {
  if (tenureMonths <= 0) return 0;
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return maxEMI * tenureMonths;
  return (maxEMI * (Math.pow(1 + monthlyRate, tenureMonths) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths));
}

// ── Core engine ────────────────────────────────────────────────────────────

export function calculateLoan(input: BorrowerInput): LoanResult {
  const foirLimit = FOIR_LIMITS[input.employmentType] ?? 0.4;
  const baseRate = getBaseRate(input.employmentType);
  const creditAdjustment = getCreditAdjustment(input.creditStatus, input.creditScore);
  const finalRate = baseRate + creditAdjustment;

  const rateBandLow = finalRate;
  const rateBandHigh = finalRate + 0.01;

  // EMI ceiling = max FOIR * income - existing EMIs
  const grossEMICapacity = input.netMonthlyIncome * foirLimit;
  const emiCeiling = Math.max(0, grossEMICapacity - input.existingEMIs);

  // Lender sanction limit based on EMI capacity
  let sanctionBase = computeMaxLoanFromEMI(emiCeiling, finalRate, input.loanTenureMonths);

  // Self-employed: boost with collateral
  if (input.employmentType === 'self-employed' && input.hasCollateral) {
    const collateralLoan = input.collateralValue * COLLATERAL_LTV;
    sanctionBase = Math.max(sanctionBase, collateralLoan);
  }

  // ITR-based income corroboration for self-employed
  if (input.employmentType === 'self-employed' && input.itrAmount > 0) {
    const itrMonthlyIncome = input.itrAmount / 12;
    const itrEMICapacity = itrMonthlyIncome * foirLimit - input.existingEMIs;
    const itrLoan = computeMaxLoanFromEMI(
      Math.max(0, itrEMICapacity),
      finalRate,
      input.loanTenureMonths,
    );
    sanctionBase = Math.max(sanctionBase, itrLoan);
  }

  const lenderSanctionLimit = Math.round(sanctionBase);
  const safeCarryLimit = Math.round(lenderSanctionLimit * SAFE_CARRY_FACTOR);

  // APR including processing fee
  const processingFee = lenderSanctionLimit * PROCESSING_FEE_RATE * (1 + PROCESSING_FEE_GST);
  const totalInterest = computeEMI(lenderSanctionLimit, finalRate, input.loanTenureMonths) * input.loanTenureMonths - lenderSanctionLimit;
  const totalCost = lenderSanctionLimit + totalInterest + processingFee;
  const apr = (totalCost / lenderSanctionLimit - 1) * (12 / input.loanTenureMonths) + finalRate;

  const rateBand: RateBand = {
    low: rateBandLow,
    high: rateBandHigh,
    apr: apr,
  };

  // Stress test: 20% income drop
  const reducedIncome = input.netMonthlyIncome * (1 - STRESS_INCOME_DROP);
  const newFOIR = computeFOIR(reducedIncome, emiCeiling + input.existingEMIs);
  const stressVerdict = newFOIR > 0.5 ? 'Dangerous — EMI burden exceeds 50% of reduced income' : 'Manageable under stress';

  const stressTest: StressTest = {
    scenario: `Income drops by ${STRESS_INCOME_DROP * 100}% to ${formatINR(reducedIncome)}/mo`,
    reducedIncome: reducedIncome,
    newEMIBurden: emiCeiling + input.existingEMIs,
    newFOIR: newFOIR,
    verdict: stressVerdict,
  };

  // Verdict logic
  const currentFOIR = computeFOIR(input.netMonthlyIncome, input.existingEMIs + emiCeiling);
  let verdict: Verdict = 'borrow';
  let verdictLabel = 'Borrow';
  let rationale = '';

  if (input.existingEMIs > 0 && computeFOIR(input.netMonthlyIncome, input.existingEMIs) > 0.4) {
    verdict = 'consolidate_first';
    verdictLabel = 'Consolidate First';
    rationale = 'Your existing EMIs already consume over 40% of income — consolidate or clear them before taking new debt.';
  } else if (emiCeiling <= 0) {
    verdict = 'dont_borrow';
    verdictLabel = "Don't Borrow";
    rationale = 'Your income cannot support additional EMI burden within safe FOIR limits right now.';
  } else if (currentFOIR > 0.45) {
    verdict = 'borrow_less';
    verdictLabel = 'Borrow Less';
    rationale = 'At your maximum EMI capacity, total debt burden exceeds 45% of income — borrow less than the sanction limit.';
  } else {
    verdict = 'borrow';
    verdictLabel = 'Borrow';
    rationale = `Your income comfortably supports the safe carry limit of ${formatINR(safeCarryLimit)} within a ${Math.round(foirLimit * 100)}% FOIR ceiling.`;
  }

  // Negotiation card
  const targetRate = finalRate;
  const targetEMI = Math.round(emiCeiling * SAFE_CARRY_FACTOR);
  const targetLoanAmount = safeCarryLimit;

  const talkingPoints: string[] = [
    `My fair rate band is ${(rateBandLow * 100).toFixed(2)}%–${(rateBandHigh * 100).toFixed(2)}% — I won't accept above ${(rateBandHigh * 100).toFixed(2)}%.`,
    `My safe EMI ceiling is ${formatINR(emiCeiling)}/month — I cannot commit beyond this.`,
    input.creditStatus === 'unknown'
      ? `I don't have a CIBIL score yet, but my income of ${formatINR(input.netMonthlyIncome)}/mo supports this loan — the +2.5% risk premium is negotiable.`
      : `My CIBIL score is ${input.creditScore} — I qualify for your best rate tier, not the standard quote.`,
  ];

  if (input.employmentType === 'self-employed' && input.itrAmount > 0) {
    talkingPoints.push(`I have ITR showing ${formatINRShort(input.itrAmount)} annual income — treat me as a documented borrower, not informal.`);
  }
  if (input.employmentType === 'self-employed' && input.hasCollateral) {
    talkingPoints.push(`I'm offering collateral worth ${formatINRShort(input.collateralValue)} — this should reduce my rate, not just increase my loan size.`);
  }

  const profileSummary = `${input.name}, ${input.age} — ${input.employmentType.replace('-', ' ')} in ${input.city}. Income: ${formatINR(input.netMonthlyIncome)}/mo. ${input.creditStatus === 'unknown' ? 'No CIBIL score' : `CIBIL: ${input.creditScore}`}.`;

  const negotiationCard: NegotiationCard = {
    profileSummary,
    targetRate,
    targetEMI,
    targetLoanAmount,
    talkingPoints,
  };

  return {
    verdict,
    verdictLabel,
    rationale,
    lenderSanctionLimit,
    safeCarryLimit,
    rateBand,
    emiCeiling,
    stressTest,
    negotiationCard,
  };
}

// ── Confidence meter ───────────────────────────────────────────────────────

export function computeConfidence(input: BorrowerInput): number {
  const optionalFields: (keyof BorrowerInput)[] = [
    'dependents',
    'hasInsurance',
    'jobTenureMonths',
    'otherIncome',
  ];
  let answered = 0;
  let total = optionalFields.length;

  if (input.dependents > 0) answered++;
  if (input.hasInsurance) answered++;
  if (input.jobTenureMonths > 0) answered++;
  if (input.otherIncome > 0) answered++;

  // Credit score known adds confidence
  if (input.creditStatus === 'known') {
    answered++;
    total++;
  }

  return total > 0 ? Math.round((answered / total) * 100) : 0;
}
