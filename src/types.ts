export type EmploymentType = 'salaried' | 'self-employed' | 'informal';

export type CreditStatus = 'known' | 'unknown';

export type Verdict = 'borrow' | 'borrow_less' | 'dont_borrow' | 'consolidate_first';

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
  loanTenureMonths: number;
  // self-employed
  itrAmount: number;
  hasCollateral: boolean;
  collateralValue: number;
  // optional (confidence)
  dependents: number;
  hasInsurance: boolean;
  jobTenureMonths: number;
  otherIncome: number;
}

export interface RateBand {
  low: number;
  high: number;
  apr: number;
}

export interface StressTest {
  scenario: string;
  reducedIncome: number;
  newEMIBurden: number;
  newFOIR: number;
  verdict: string;
}

export interface LoanResult {
  verdict: Verdict;
  verdictLabel: string;
  rationale: string;
  lenderSanctionLimit: number;
  safeCarryLimit: number;
  rateBand: RateBand;
  emiCeiling: number;
  stressTest: StressTest;
  negotiationCard: NegotiationCard;
}

export interface NegotiationCard {
  profileSummary: string;
  targetRate: number;
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
