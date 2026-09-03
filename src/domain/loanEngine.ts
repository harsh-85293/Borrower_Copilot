import type {
  BorrowerInput,
  LoanResult,
  Verdict,
  RateBand,
  StressTest,
  NegotiationCard,
  LoanProduct,
  TenureOption,
} from '@/types';

// Affordability (FOIR) ceilings by income type. Informal cash income is the
// least predictable, so it gets the most conservative ceiling.
export const FOIR_LIMITS: Record<string, number> = {
  salaried: 0.5,
  'self-employed': 0.45,
  informal: 0.35,
};

// Base APRs by product. Secured products are materially cheaper than unsecured
// ones — that difference is the whole reason to route a borrower to collateral.
export const PRODUCT_BASE_RATE: Record<LoanProduct, number> = {
  home: 0.086,
  lap: 0.105,
  gold: 0.11,
  two_wheeler: 0.115,
  business: 0.145,
  personal: 0.135,
};

export const PRODUCT_LABEL: Record<LoanProduct, string> = {
  home: 'Home Loan',
  lap: 'Loan Against Property (LAP)',
  gold: 'Gold Loan',
  two_wheeler: 'Two-Wheeler Loan',
  business: 'Business Loan',
  personal: 'Personal Loan',
};

// Employment-based nudge applied on top of the product base rate.
export const EMPLOYMENT_PREMIUM: Record<string, number> = {
  salaried: 0,
  'self-employed': 0.005,
  informal: 0.02,
};

export const RISK_PREMIUM_UNKNOWN_CREDIT = 0.025; // +2.5% when no CIBIL exists
export const PROCESSING_FEE_RATE = 0.012; // 1.2% of loan
export const PROCESSING_FEE_GST = 0.18; // 18% GST on the fee
export const BASE_SAFE_CARRY_FACTOR = 0.8; // borrow up to 80% of the sanction
export const STRESS_INCOME_DROP = 0.2; // 20% income shock
export const LAP_LTV = 0.6; // conservative loan-to-value for property
export const GOLD_LTV = 0.75;

const CREDIT_SCORE_BANDS: { min: number; max: number; adjustment: number }[] = [
  { min: 800, max: 900, adjustment: -0.005 },
  { min: 750, max: 799, adjustment: 0 },
  { min: 700, max: 749, adjustment: 0.005 },
  { min: 650, max: 699, adjustment: 0.015 },
  { min: 600, max: 649, adjustment: 0.03 },
  { min: 300, max: 599, adjustment: 0.045 },
];

// Formatting

export function formatINR(amount: number): string {
  return '₹' + Math.round(amount).toLocaleString('en-IN');
}

export function formatINRShort(amount: number): string {
  if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
  if (amount >= 100000) return '₹' + (amount / 100000).toFixed(2) + ' L';
  if (amount >= 1000) return '₹' + Math.round(amount / 1000) + 'K';
  return formatINR(amount);
}

function pct(rate: number): string {
  return (rate * 100).toFixed(2) + '%';
}

// Core math

function computeEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (tenureMonths <= 0 || principal <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / tenureMonths;
  const f = Math.pow(1 + r, tenureMonths);
  return (principal * r * f) / (f - 1);
}

function maxLoanFromEMI(emi: number, annualRate: number, tenureMonths: number): number {
  if (tenureMonths <= 0 || emi <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return emi * tenureMonths;
  const f = Math.pow(1 + r, tenureMonths);
  return (emi * (f - 1)) / (r * f);
}

// Real all-in APR: solve for the monthly rate at which the disbursed amount
// (principal minus the processing fee the borrower effectively funds) equals the
// present value of the EMI stream. This is the RBI-style "what it actually costs"
// number, not a cosmetic rate + fee add-on.
function computeAllInAPR(
  principal: number,
  nominalRate: number,
  tenureMonths: number,
): number {
  const fee = principal * PROCESSING_FEE_RATE * (1 + PROCESSING_FEE_GST);
  const netDisbursed = principal - fee;
  const emi = computeEMI(principal, nominalRate, tenureMonths);
  if (netDisbursed <= 0 || emi <= 0) return nominalRate;

  // Bisection on the monthly rate.
  let lo = 0;
  let hi = 1; // 100%/month upper bound, far beyond any real loan
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const pv =
      mid === 0
        ? emi * tenureMonths
        : (emi * (1 - Math.pow(1 + mid, -tenureMonths))) / mid;
    if (pv > netDisbursed) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 12;
}

function creditAdjustment(input: BorrowerInput): number {
  if (input.creditStatus === 'unknown') return RISK_PREMIUM_UNKNOWN_CREDIT;
  const band = CREDIT_SCORE_BANDS.find(
    (b) => input.creditScore >= b.min && input.creditScore <= b.max,
  );
  return band ? band.adjustment : 0.045;
}

// Product routing — the honest recommendation given purpose, collateral, amount.
function routeProduct(input: BorrowerInput): { product: LoanProduct; why: string } {
  const p = input.loanPurpose.toLowerCase();
  const wants = input.loanAmountWanted;

  if (/scooter|two.?wheeler|bike|motorcycle|ev\b|electric scooter/.test(p)) {
    return {
      product: 'two_wheeler',
      why: 'The vehicle itself is the collateral, so a two-wheeler loan is cheaper than an unsecured personal loan.',
    };
  }
  if (/home|house|flat|apartment/.test(p) && wants >= 2000000) {
    return { product: 'home', why: 'A property purchase qualifies for a secured home loan at the lowest rates.' };
  }
  if (/gold|jewel/.test(p)) {
    return { product: 'gold', why: 'Gold as collateral unlocks a low-rate secured loan with quick disbursal.' };
  }

  // Collateral available and a sizeable ask → route to secured LAP/business,
  // not an expensive personal loan. This is the Ravi case.
  if (input.hasCollateral && input.collateralValue > 0) {
    if (/business|shop|stock|expansion|working capital|inventory/.test(p)) {
      return {
        product: 'lap',
        why: 'You own unencumbered property, so a Loan Against Property funds the business far cheaper than an unsecured business loan.',
      };
    }
    if (wants >= 500000) {
      return {
        product: 'lap',
        why: 'With property to pledge, a secured LAP beats an unsecured loan on both rate and eligible amount.',
      };
    }
  }

  if (/business|shop|stock|expansion|working capital|inventory/.test(p)) {
    return { product: 'business', why: 'Routed to a business loan for the stated commercial purpose.' };
  }
  return {
    product: 'personal',
    why: 'No collateral was offered, so this is priced as an unsecured personal loan.',
  };
}

// A monthly income figure we are willing to lend against. For self-employed we
// corroborate cash income against ITR and take the more conservative of the two
// unless documented, so we never lend against income we cannot see.
function assessableIncome(input: BorrowerInput): { income: number; note: string } {
  let income = input.netMonthlyIncome;
  let note = 'net monthly income as stated';

  if (input.employmentType === 'self-employed' && input.itrAmount > 0) {
    const itrMonthly = input.itrAmount / 12;
    if (itrMonthly < income) {
      income = itrMonthly;
      note = 'ITR-documented income (lower than stated cash income, used to stay conservative)';
    } else {
      note = 'stated income, corroborated by ITR';
    }
  }
  if (input.hasCoApplicant && input.coApplicantIncome > 0) {
    income += input.coApplicantIncome;
    note += ' + co-applicant income';
  }
  return { income, note };
}

// Confidence: how much of what actually moves a number did the borrower tell us?
// Silence widens the band and shaves the safe-carry number — we never narrow a
// range we have no basis to narrow.
function computeConfidenceInternal(input: BorrowerInput): number {
  let score = 0;
  let max = 0;

  const add = (weight: number, answered: boolean) => {
    max += weight;
    if (answered) score += weight;
  };

  add(25, input.creditStatus === 'known'); // biggest single signal
  add(15, input.monthsOfSavings >= 0);
  add(15, input.incomeIsStable !== null);
  add(15, input.highCostDebtOutstanding >= 0);
  add(10, input.monthlyExpenses > 0);
  add(10, input.employmentType !== 'informal' || input.itrAmount > 0 || input.hasCollateral);
  add(10, input.hasCoApplicant ? input.coApplicantIncome > 0 : true);

  return Math.round((score / max) * 100);
}

export function computeConfidence(input: BorrowerInput): number {
  return computeConfidenceInternal(input);
}

export function calculateLoan(input: BorrowerInput): LoanResult {
  const foirLimit = FOIR_LIMITS[input.employmentType] ?? 0.4;
  const { product, why: productWhy } = routeProduct(input);
  const { income: usableIncome, note: incomeNote } = assessableIncome(input);

  // Rate build-up: product base + employment premium + credit adjustment.
  const nominalRate =
    PRODUCT_BASE_RATE[product] +
    (EMPLOYMENT_PREMIUM[input.employmentType] ?? 0) +
    creditAdjustment(input);

  const confidence = computeConfidenceInternal(input);

  // Confidence-driven band. Full confidence → a tight ±0.5% around the point.
  // Low confidence → the band fans out to as much as ±2.5%, and we say so.
  const bandHalfWidth = 0.005 + (1 - confidence / 100) * 0.02;
  const rateLow = Math.max(0.05, nominalRate - bandHalfWidth);
  const rateHigh = nominalRate + bandHalfWidth;

  // EMI capacity from affordability, honouring existing obligations.
  const grossCapacity = usableIncome * foirLimit;
  const emiCeiling = Math.max(0, grossCapacity - input.existingEMIs);

  // Lender sanction — the affordability-driven maximum, lifted by collateral for
  // secured products (this is the number a bank would put on the sanction letter).
  let sanction = maxLoanFromEMI(emiCeiling, nominalRate, input.loanTenureMonths);
  let sanctionWhy = `A lender caps EMI at ${Math.round(foirLimit * 100)}% of ${formatINR(usableIncome)} (${incomeNote}), less your ${formatINR(input.existingEMIs)} existing EMIs.`;

  if ((product === 'lap' || product === 'home') && input.collateralValue > 0) {
    const secured = input.collateralValue * LAP_LTV;
    if (secured > sanction) {
      sanction = secured;
      sanctionWhy = `A secured lender will advance up to ${Math.round(LAP_LTV * 100)}% of your ${formatINRShort(input.collateralValue)} property, which exceeds your income-based limit.`;
    }
  }
  if (product === 'gold' && input.collateralValue > 0) {
    sanction = input.collateralValue * GOLD_LTV;
    sanctionWhy = `Gold loans advance up to ${Math.round(GOLD_LTV * 100)}% of pledged value.`;
  }

  const lenderSanctionLimit = Math.round(sanction);

  // Safe carry — what the borrower should actually take. Start from a buffer
  // below sanction, then dock for missing emergency savings and for the
  // uncertainty implied by low confidence.
  let safeFactor = BASE_SAFE_CARRY_FACTOR;
  if (input.monthsOfSavings >= 0 && input.monthsOfSavings < 3) safeFactor -= 0.1;
  if (input.monthsOfSavings >= 6) safeFactor += 0.05;
  safeFactor -= (1 - confidence / 100) * 0.15; // silence → more caution
  safeFactor = Math.max(0.4, Math.min(0.9, safeFactor));

  const safeCarryLimit = Math.round(lenderSanctionLimit * safeFactor);
  const safeCarryWhy = `Capped at ${Math.round(safeFactor * 100)}% of the sanction: a buffer for emergencies, ${input.monthsOfSavings >= 0 && input.monthsOfSavings < 3 ? 'tightened because you hold under 3 months of savings, ' : ''}${confidence < 70 ? 'and widened for caution because several questions were left blank.' : 'reflecting the profile you provided.'}`;

  // The amount the borrower will actually take: never more than what's safe, and
  // never more than they asked for. Everything downstream (EMI, stress, tenure
  // trade-off) is evaluated against THIS, not the theoretical maximum.
  const recommendedAmount =
    input.loanAmountWanted > 0 ? Math.min(input.loanAmountWanted, safeCarryLimit) : safeCarryLimit;

  // O4 tenure trade-off, on the amount they'll actually borrow.
  const tenureCandidates = [24, 36, 60, 84, 120].filter(
    (t) => t <= Math.max(input.loanTenureMonths, 120),
  );
  if (!tenureCandidates.includes(input.loanTenureMonths)) tenureCandidates.push(input.loanTenureMonths);
  const tenureOptions: TenureOption[] = Array.from(new Set(tenureCandidates))
    .sort((a, b) => a - b)
    .map((months) => {
      const emi = computeEMI(recommendedAmount, nominalRate, months);
      return { months, emi: Math.round(emi), totalInterest: Math.round(emi * months - recommendedAmount) };
    });

  // Stress test — 20% income drop against the recommended EMI plus existing EMIs.
  const chosenEMI = computeEMI(recommendedAmount, nominalRate, input.loanTenureMonths);
  const reducedIncome = usableIncome * (1 - STRESS_INCOME_DROP);
  const stressBurden = chosenEMI + input.existingEMIs;
  const newFOIR = reducedIncome > 0 ? stressBurden / reducedIncome : 1;
  const stressPasses = newFOIR <= 0.5;
  const stressTest: StressTest = {
    scenario: `Income falls ${STRESS_INCOME_DROP * 100}% to ${formatINR(reducedIncome)}/mo`,
    reducedIncome,
    newEMIBurden: Math.round(stressBurden),
    newFOIR,
    passes: stressPasses,
    verdict: stressPasses
      ? 'Manageable — EMI stays within 50% of the reduced income.'
      : 'Fragile — EMI would exceed 50% of the reduced income. Borrow less or lengthen tenure.',
  };

  const emiWhy = `${Math.round(foirLimit * 100)}% of ${formatINR(usableIncome)} is ${formatINR(grossCapacity)}; after your existing ${formatINR(input.existingEMIs)} EMIs, ${formatINR(emiCeiling)} is left for a new one.`;

  // Verdict — "Don't borrow" and "Borrow less" are both genuinely reachable.
  const existingBurden = usableIncome > 0 ? input.existingEMIs / usableIncome : 1;
  const hasHighCostDebt = input.highCostDebtOutstanding > 0;
  const disposableAfterExpenses =
    input.monthlyExpenses > 0 ? usableIncome - input.monthlyExpenses - input.existingEMIs : Infinity;

  let verdict: Verdict = 'borrow';
  let verdictLabel = 'Borrow';
  let rationale = '';

  const dangerSignals =
    (input.bouncedRecently ? 1 : 0) +
    (hasHighCostDebt ? 1 : 0) +
    (existingBurden > 0.4 ? 1 : 0) +
    (disposableAfterExpenses < grossCapacity * 0.3 ? 1 : 0);

  if (emiCeiling <= 0 || (input.bouncedRecently && dangerSignals >= 2)) {
    verdict = 'dont_borrow';
    verdictLabel = "Don't Borrow Yet";
    rationale = input.bouncedRecently
      ? 'A recent missed payment plus existing pressure means new EMI debt is likely to push you into a trap. Stabilise cash flow and clear the high-cost app loans first.'
      : 'Your income cannot safely support any additional EMI right now within a prudent affordability ceiling.';
  } else if (existingBurden > 0.4 || (hasHighCostDebt && input.highCostDebtOutstanding > usableIncome)) {
    verdict = 'consolidate_first';
    verdictLabel = 'Consolidate First';
    rationale = hasHighCostDebt
      ? `You carry ${formatINR(input.highCostDebtOutstanding)} of high-cost debt. Refinance or clear that before adding a new loan — a cheaper consolidation loan is the better move.`
      : `Existing EMIs already take ${Math.round(existingBurden * 100)}% of income. Consolidate or clear them before new debt.`;
  } else if (!stressPasses) {
    verdict = 'borrow_less';
    verdictLabel = 'Borrow Less';
    rationale = `Even at ${formatINR(recommendedAmount)} a 20% income dip pushes your EMIs past half your income. Borrow less or stretch the tenure so the stress case survives.`;
  } else if (input.loanAmountWanted > safeCarryLimit) {
    verdict = 'borrow_less';
    verdictLabel = 'Borrow Less';
    rationale = `You asked for ${formatINR(input.loanAmountWanted)}, but ${formatINR(safeCarryLimit)} is the most you can carry without stretching. Borrow the smaller figure.`;
  } else {
    verdict = 'borrow';
    verdictLabel = 'Borrow';
    rationale = `Your ${formatINR(usableIncome)} income comfortably carries ${formatINR(recommendedAmount)} within a ${Math.round(foirLimit * 100)}% affordability ceiling, and it survives a 20% income shock.`;
  }

  const useThisNumber: 'safe' | 'sanction' = 'safe';

  const apr = computeAllInAPR(recommendedAmount || lenderSanctionLimit, nominalRate, input.loanTenureMonths);
  const rateBand: RateBand = { low: rateLow, high: rateHigh, apr };
  const rateWhy = `${PRODUCT_LABEL[product]} base ${pct(PRODUCT_BASE_RATE[product])}${EMPLOYMENT_PREMIUM[input.employmentType] ? ` + ${pct(EMPLOYMENT_PREMIUM[input.employmentType])} ${input.employmentType} premium` : ''} + ${input.creditStatus === 'unknown' ? '2.50% no-CIBIL premium' : 'credit adjustment'}. Band ${confidence < 70 ? 'is wide because answers were sparse' : 'is tight'}.`;

  // Confidence labelling.
  const confidenceLabel = confidence >= 75 ? 'High' : confidence >= 45 ? 'Medium' : 'Low';
  const confidenceNote =
    confidence >= 75
      ? 'You answered enough that these ranges are tight.'
      : confidence >= 45
        ? 'Some questions were skipped, so the ranges are wider than they need to be.'
        : 'Many questions were left blank. Treat every range as wide and provisional until you fill them in.';

  // Negotiation card.
  const targetEMI = Math.round(computeEMI(recommendedAmount, rateLow, input.loanTenureMonths));
  const talkingPoints: string[] = [
    `Route me to a ${PRODUCT_LABEL[product]}, not the first product offered — ${productWhy.toLowerCase()}`,
    `A fair rate for my profile is ${pct(rateLow)}–${pct(rateHigh)}. I will not sign above ${pct(rateHigh)}.`,
    `Quote me the all-in APR with processing fees and GST, not just the headline rate. My benchmark is ${pct(apr)}.`,
    `My EMI ceiling is ${formatINR(emiCeiling)}/month and I am borrowing ${formatINR(recommendedAmount)}, not the full sanction.`,
  ];
  if (input.creditStatus === 'unknown') {
    talkingPoints.push(
      `I have no CIBIL score, but ${formatINR(usableIncome)}/mo income backs this loan — the 2.5% no-score premium is negotiable once I show proof.`,
    );
  } else if (input.creditScore >= 750) {
    talkingPoints.push(`My CIBIL is ${input.creditScore}. Put me in your best rate tier, not the standard quote.`);
  }
  if (input.hasCollateral && (product === 'lap' || product === 'gold' || product === 'home')) {
    talkingPoints.push(
      `I am pledging collateral worth ${formatINRShort(input.collateralValue)} — that should lower my rate, not just raise my limit.`,
    );
  }
  if (input.bouncedRecently) {
    talkingPoints.push('I will revisit this in 3 months with a clean repayment record rather than borrow under pressure now.');
  }

  const profileSummary = `${input.name}, ${input.age} — ${input.employmentType.replace('-', ' ')} in ${input.city}. Income ${formatINR(input.netMonthlyIncome)}/mo. ${input.creditStatus === 'unknown' ? 'No CIBIL score.' : `CIBIL ${input.creditScore}.`}`;

  const negotiationCard: NegotiationCard = {
    profileSummary,
    productLabel: PRODUCT_LABEL[product],
    targetRateLow: rateLow,
    targetRateHigh: rateHigh,
    walkAwayRate: rateHigh,
    targetEMI,
    targetLoanAmount: recommendedAmount,
    talkingPoints,
  };

  return {
    verdict,
    verdictLabel,
    rationale,
    product,
    productLabel: PRODUCT_LABEL[product],
    productWhy,
    lenderSanctionLimit,
    lenderSanctionWhy: sanctionWhy,
    safeCarryLimit,
    safeCarryWhy,
    amountWanted: input.loanAmountWanted,
    recommendedAmount,
    useThisNumber,
    rateBand,
    rateWhy,
    emiCeiling: Math.round(emiCeiling),
    emiWhy,
    tenureOptions,
    stressTest,
    confidence,
    confidenceLabel,
    confidenceNote,
    negotiationCard,
  };
}
