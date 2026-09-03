export type EmploymentType = 'salaried' | 'self-employed' | 'informal';

export type CreditStatus = 'known' | 'unknown';

export type Verdict = 'borrow' | 'borrow_less' | 'dont_borrow' | 'consolidate_first';

// The loan product the borrower is routed to. Secured products carry lower
// rates and are the honest recommendation when the borrower has collateral.
export type LoanProduct =
  | 'personal'
  | 'business'
  | 'lap' // loan against property
  | 'gold'
  | 'two_wheeler'
  | 'home';

export interface BorrowerInput {
  name: string;
  age: number;
  city: string;
  employmentType: EmploymentType;
  netMonthlyIncome: number;
  existingEMIs: number;
  monthlyExpenses: number;
  creditStatus: CreditStatus;
  creditScore: number;
  loanPurpose: string;
  loanAmountWanted: number;
  loanTenureMonths: number;

  // Self-employed / secured
  itrAmount: number;
  hasCollateral: boolean;
  collateralValue: number;

  // Additional questions — each of these must move a number or the verdict.
  // A value of -1 means "not answered / unknown" (never treated as zero).
  monthsOfSavings: number; // emergency buffer in months of expenses; -1 = unknown
  bouncedRecently: boolean; // an EMI/payment bounce in the last ~3 months
  highCostDebtOutstanding: number; // balance on app/card loans priced 24%+; -1 = unknown
  hasCoApplicant: boolean;
  coApplicantIncome: number;
  incomeIsStable: boolean | null; // salaried>2y or documented; null = unanswered
}

export interface RateBand {
  low: number;
  high: number;
  apr: number; // all-in APR at the midpoint, RBI-style (includes fees)
}

export interface StressTest {
  scenario: string;
  reducedIncome: number;
  newEMIBurden: number;
  newFOIR: number;
  passes: boolean;
  verdict: string;
}

export interface TenureOption {
  months: number;
  emi: number;
  totalInterest: number;
}

export interface LoanResult {
  verdict: Verdict;
  verdictLabel: string;
  rationale: string;

  product: LoanProduct;
  productLabel: string;
  productWhy: string;

  // O2 — two clearly separated numbers plus which one to use.
  lenderSanctionLimit: number;
  lenderSanctionWhy: string;
  safeCarryLimit: number;
  safeCarryWhy: string;
  amountWanted: number;
  recommendedAmount: number; // min(wanted, safeCarry) — what to actually borrow
  useThisNumber: 'safe' | 'sanction';

  // O3
  rateBand: RateBand;
  rateWhy: string;

  // O4
  emiCeiling: number;
  emiWhy: string;
  tenureOptions: TenureOption[];
  stressTest: StressTest;

  // Confidence — how much the borrower told us, and what it did to the ranges.
  confidence: number;
  confidenceLabel: string;
  confidenceNote: string;

  negotiationCard: NegotiationCard;
}

export interface NegotiationCard {
  profileSummary: string;
  productLabel: string;
  targetRateLow: number;
  targetRateHigh: number;
  walkAwayRate: number;
  targetEMI: number;
  targetLoanAmount: number;
  talkingPoints: string[];
}

export interface Persona {
  id: string;
  label: string;
  description: string;
  input: BorrowerInput;
}

export interface RuleEntry {
  what: string;
  value: string;
  why: string;
  source: string;
}
