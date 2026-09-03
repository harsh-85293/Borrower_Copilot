import type { Persona, BorrowerInput } from '@/types';

export const emptyInput: BorrowerInput = {
  name: '',
  age: 0,
  city: '',
  employmentType: 'salaried',
  netMonthlyIncome: 0,
  existingEMIs: 0,
  monthlyExpenses: 0,
  creditStatus: 'unknown',
  creditScore: 0,
  loanPurpose: '',
  loanAmountWanted: 0,
  loanTenureMonths: 60,
  itrAmount: 0,
  hasCollateral: false,
  collateralValue: 0,
  monthsOfSavings: -1,
  bouncedRecently: false,
  highCostDebtOutstanding: -1,
  hasCoApplicant: false,
  coApplicantIncome: 0,
  incomeIsStable: null,
};

// The three borrowers from the brief, transcribed as closely as the input model
// allows. Ranges (e.g. Ravi's cash income) are entered as the midpoint and noted
// in run-throughs.md.
export const personas: Persona[] = [
  {
    id: 'priya',
    label: 'Priya',
    description: '29 · Salaried · Bengaluru',
    input: {
      name: 'Priya',
      age: 29,
      city: 'Bengaluru',
      employmentType: 'salaried',
      netMonthlyIncome: 110000,
      existingEMIs: 14000, // car loan, 2 years left
      monthlyExpenses: 28000, // rent
      creditStatus: 'known',
      creditScore: 780,
      loanPurpose: 'Wedding',
      loanAmountWanted: 800000,
      loanTenureMonths: 60,
      itrAmount: 0,
      hasCollateral: false,
      collateralValue: 0,
      monthsOfSavings: 4,
      bouncedRecently: false,
      highCostDebtOutstanding: 0,
      hasCoApplicant: false,
      coApplicantIncome: 0,
      incomeIsStable: true, // 5 years at a large MNC
    },
  },
  {
    id: 'ravi',
    label: 'Ravi',
    description: '42 · Self-employed · Mysuru',
    input: {
      name: 'Ravi',
      age: 42,
      city: 'Mysuru',
      employmentType: 'self-employed',
      netMonthlyIncome: 60000, // cash 40k–80k, midpoint
      existingEMIs: 0, // never taken a formal loan
      monthlyExpenses: 30000,
      creditStatus: 'unknown', // no credit score
      creditScore: 0,
      loanPurpose: 'Second stock line and delivery vehicle',
      loanAmountWanted: 1500000,
      loanTenureMonths: 84,
      itrAmount: 420000, // ITR shows ₹4.2L/year
      hasCollateral: true,
      collateralValue: 4500000, // shop premises, unencumbered
      monthsOfSavings: 3,
      bouncedRecently: false,
      highCostDebtOutstanding: 0,
      hasCoApplicant: true,
      coApplicantIncome: 18000, // wife, teaching
      incomeIsStable: true, // 14 years in business
    },
  },
  {
    id: 'anita',
    label: 'Anita',
    description: '35 · Informal · Hubballi',
    input: {
      name: 'Anita',
      age: 35,
      city: 'Hubballi',
      employmentType: 'informal',
      netMonthlyIncome: 28000, // 26k–30k, midpoint
      existingEMIs: 4500, // three app loans servicing
      monthlyExpenses: 20000,
      creditStatus: 'unknown',
      creditScore: 0,
      loanPurpose: 'Electric scooter to double delivery runs',
      loanAmountWanted: 150000,
      loanTenureMonths: 36,
      itrAmount: 0,
      hasCollateral: false,
      collateralValue: 0,
      monthsOfSavings: 0,
      bouncedRecently: true, // one EMI bounced last month
      highCostDebtOutstanding: 35000, // app loans at 30%+
      hasCoApplicant: false, // husband unemployed 8 months
      coApplicantIncome: 0,
      incomeIsStable: false,
    },
  },
];

export function getPersonaById(id: string): Persona | undefined {
  return personas.find((p) => p.id === id);
}
