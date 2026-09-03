import { useState, useMemo } from 'react';
import {
  User,
  Briefcase,
  CreditCard,
  Target,
  ChevronRight,
  ChevronLeft,
  Calculator,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import type { BorrowerInput, EmploymentType, CreditStatus } from '@/types';

interface WizardProps {
  input: BorrowerInput;
  onUpdate: <K extends keyof BorrowerInput>(field: K, value: BorrowerInput[K]) => void;
  onCompute: () => void;
  confidence: number;
}

const STEPS = [
  { id: 0, label: 'You', icon: User },
  { id: 1, label: 'Income', icon: Briefcase },
  { id: 2, label: 'Credit', icon: CreditCard },
  { id: 3, label: 'Loan', icon: Target },
  { id: 4, label: 'Sharper', icon: SlidersHorizontal },
];

export function Wizard({ input, onUpdate, onCompute, confidence }: WizardProps) {
  const [step, setStep] = useState(0);

  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return input.name.trim() !== '' && input.age > 0 && input.city.trim() !== '';
      case 1:
        return input.netMonthlyIncome > 0;
      case 2:
        return input.creditStatus === 'unknown' || input.creditScore > 0;
      case 3:
        return input.loanPurpose.trim() !== '' && input.loanAmountWanted > 0 && input.loanTenureMonths > 0;
      case 4:
        return true;
      default:
        return false;
    }
  }, [step, input]);

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onCompute();
  };
  const prev = () => step > 0 && setStep(step - 1);

  return (
    <div className="card p-6 sm:p-8 max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-plum-600 text-cream scale-110 shadow-md'
                      : isDone
                        ? 'bg-sage-300 text-white'
                        : 'bg-plum-50 text-plum-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-[10px] sm:text-xs font-medium ${isActive ? 'text-plum-700' : isDone ? 'text-sage-500' : 'text-plum-300'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 rounded-full transition-all duration-300 ${isDone ? 'bg-sage-300' : 'bg-plum-100'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Confidence meter */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-plum-500">
            Confidence {confidence >= 75 ? '· tight ranges' : confidence >= 45 ? '· ranges widen' : '· wide ranges'}
          </span>
          <span className="text-xs font-mono font-semibold text-plum-600">{confidence}%</span>
        </div>
        <div className="h-2 bg-plum-50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${confidence}%`,
              background: confidence >= 75 ? '#4D8A4D' : confidence >= 45 ? '#D4A843' : '#C25B3F',
            }}
          />
        </div>
        <p className="text-[11px] text-plum-300 mt-1">
          The less you tell us, the wider your ranges — we never narrow what we can't see.
        </p>
      </div>

      {/* Step content */}
      <div className="min-h-[300px]">
        {step === 0 && <ProfileStep input={input} onUpdate={onUpdate} />}
        {step === 1 && <IncomeStep input={input} onUpdate={onUpdate} />}
        {step === 2 && <CreditStep input={input} onUpdate={onUpdate} />}
        {step === 3 && <LoanStep input={input} onUpdate={onUpdate} />}
        {step === 4 && <SharperStep input={input} onUpdate={onUpdate} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-plum-50">
        <button onClick={prev} disabled={step === 0} className="btn-ghost flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button onClick={next} disabled={!canProceed} className="btn-primary flex items-center gap-2">
          {step === STEPS.length - 1 ? (
            <>
              <Calculator className="w-4 h-4" />
              See my assessment
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Step components

type StepProps = {
  input: BorrowerInput;
  onUpdate: <K extends keyof BorrowerInput>(field: K, value: BorrowerInput[K]) => void;
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-plum-300 mt-1">{hint}</p>}
    </div>
  );
}

function ProfileStep({ input, onUpdate }: StepProps) {
  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
      <div>
        <h2 className="text-xl font-serif font-semibold text-plum-700 mb-1">A bit about you</h2>
        <p className="text-sm text-plum-400">Just enough to personalise the numbers.</p>
      </div>
      <Field label="Name">
        <input type="text" value={input.name} onChange={(e) => onUpdate('name', e.target.value)} placeholder="e.g. Priya" className="input-field" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Age">
          <input type="number" value={input.age || ''} onChange={(e) => onUpdate('age', Number(e.target.value))} placeholder="e.g. 30" className="input-field" />
        </Field>
        <Field label="City">
          <input type="text" value={input.city} onChange={(e) => onUpdate('city', e.target.value)} placeholder="e.g. Bengaluru" className="input-field" />
        </Field>
      </div>
    </div>
  );
}

function IncomeStep({ input, onUpdate }: StepProps) {
  const types: { value: EmploymentType; label: string; desc: string }[] = [
    { value: 'salaried', label: 'Salaried', desc: 'Regular paycheck' },
    { value: 'self-employed', label: 'Self-employed', desc: 'Business / professional' },
    { value: 'informal', label: 'Informal', desc: 'Gig / cash / daily wage' },
  ];
  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
      <div>
        <h2 className="text-xl font-serif font-semibold text-plum-700 mb-1">Income & obligations</h2>
        <p className="text-sm text-plum-400">This sets your affordability ceiling and rate band.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {types.map((et) => (
          <button
            key={et.value}
            onClick={() => onUpdate('employmentType', et.value)}
            className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
              input.employmentType === et.value ? 'border-plum-600 bg-plum-50' : 'border-plum-100 bg-white hover:border-plum-200'
            }`}
          >
            <p className="font-medium text-plum-700 text-sm">{et.label}</p>
            <p className="text-xs text-plum-400 mt-0.5">{et.desc}</p>
          </button>
        ))}
      </div>
      <Field label="Net monthly income (₹)" hint={input.employmentType === 'self-employed' ? 'Your take-home cash. We corroborate this against ITR below.' : undefined}>
        <input type="number" value={input.netMonthlyIncome || ''} onChange={(e) => onUpdate('netMonthlyIncome', Number(e.target.value))} placeholder="e.g. 50,000" className="input-field font-mono" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Existing monthly EMIs (₹)" hint="Loans you already service">
          <input type="number" value={input.existingEMIs || ''} onChange={(e) => onUpdate('existingEMIs', Number(e.target.value))} placeholder="e.g. 8,000" className="input-field font-mono" />
        </Field>
        <Field label="Monthly living expenses (₹)">
          <input type="number" value={input.monthlyExpenses || ''} onChange={(e) => onUpdate('monthlyExpenses', Number(e.target.value))} placeholder="e.g. 20,000" className="input-field font-mono" />
        </Field>
      </div>

      {/* Adaptive: self-employed only */}
      {input.employmentType === 'self-employed' && (
        <div className="space-y-4 p-4 bg-plum-50/50 rounded-xl border border-plum-100 animate-[fadeIn_0.3s_ease]">
          <p className="text-xs font-medium text-plum-500 uppercase tracking-wide">Self-employed — documentation</p>
          <Field label="Annual income shown on ITR (₹)" hint="Documented income lets a lender treat you as prime, not informal.">
            <input type="number" value={input.itrAmount || ''} onChange={(e) => onUpdate('itrAmount', Number(e.target.value))} placeholder="e.g. 4,20,000" className="input-field font-mono" />
          </Field>
          <Toggle label="I own unencumbered property or gold I could pledge" value={input.hasCollateral} onChange={(v) => onUpdate('hasCollateral', v)} />
          {input.hasCollateral && (
            <Field label="Value of that collateral (₹)" hint="Routes you to a cheaper secured loan.">
              <input type="number" value={input.collateralValue || ''} onChange={(e) => onUpdate('collateralValue', Number(e.target.value))} placeholder="e.g. 45,00,000" className="input-field font-mono" />
            </Field>
          )}
        </div>
      )}
    </div>
  );
}

function CreditStep({ input, onUpdate }: StepProps) {
  const statuses: { value: CreditStatus; label: string; desc: string }[] = [
    { value: 'known', label: 'I know my CIBIL score', desc: 'I have a credit history' },
    { value: 'unknown', label: "I don't have / don't know it", desc: 'No history, or never checked' },
  ];
  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
      <div>
        <h2 className="text-xl font-serif font-semibold text-plum-700 mb-1">Credit history</h2>
        <p className="text-sm text-plum-400">This sets your risk premium — and we never treat "unknown" as a bad score.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => onUpdate('creditStatus', s.value)}
            className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
              input.creditStatus === s.value ? 'border-plum-600 bg-plum-50' : 'border-plum-100 bg-white hover:border-plum-200'
            }`}
          >
            <p className="font-medium text-plum-700 text-sm">{s.label}</p>
            <p className="text-xs text-plum-400 mt-0.5">{s.desc}</p>
          </button>
        ))}
      </div>
      {input.creditStatus === 'known' && (
        <Field label="CIBIL score (300–900)">
          <input type="number" min={300} max={900} value={input.creditScore || ''} onChange={(e) => onUpdate('creditScore', Number(e.target.value))} placeholder="e.g. 750" className="input-field font-mono" />
        </Field>
      )}
      {input.creditStatus === 'unknown' && (
        <div className="p-4 bg-gold-400/10 border border-gold-400/30 rounded-xl">
          <p className="text-sm text-plum-600">
            No problem. We apply a <span className="font-semibold">+2.5% "no-score" premium</span> — not a bad-credit penalty — and your card shows how to negotiate it down with income proof.
          </p>
        </div>
      )}
    </div>
  );
}

function LoanStep({ input, onUpdate }: StepProps) {
  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
      <div>
        <h2 className="text-xl font-serif font-semibold text-plum-700 mb-1">What you want</h2>
        <p className="text-sm text-plum-400">The purpose decides which product — and rate — you should be routed to.</p>
      </div>
      <Field label="What is the loan for?" hint="e.g. wedding, business stock, electric scooter, home">
        <input type="text" value={input.loanPurpose} onChange={(e) => onUpdate('loanPurpose', e.target.value)} placeholder="Electric scooter for deliveries" className="input-field" />
      </Field>
      <Field label="How much do you want (₹)?">
        <input type="number" value={input.loanAmountWanted || ''} onChange={(e) => onUpdate('loanAmountWanted', Number(e.target.value))} placeholder="e.g. 5,00,000" className="input-field font-mono" />
      </Field>
      <Field label="Preferred tenure">
        <div className="flex items-center gap-3">
          <input type="range" min={6} max={120} step={6} value={input.loanTenureMonths} onChange={(e) => onUpdate('loanTenureMonths', Number(e.target.value))} className="flex-1 accent-plum-600" />
          <span className="font-mono font-semibold text-plum-700 text-lg min-w-[3.5rem] text-right">{input.loanTenureMonths}mo</span>
        </div>
        <div className="flex justify-between text-[10px] text-plum-300 mt-1"><span>6mo</span><span>60mo</span><span>120mo</span></div>
      </Field>
    </div>
  );
}

// The "additional questions" tier — adaptive, and every item here moves a number
// or the verdict. Skipping any of them widens the ranges rather than guessing.
function SharperStep({ input, onUpdate }: StepProps) {
  const savingsOptions = [
    { v: 0, label: 'None' },
    { v: 1, label: '<1 mo' },
    { v: 3, label: '~3 mo' },
    { v: 6, label: '6+ mo' },
  ];
  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
      <div>
        <h2 className="text-xl font-serif font-semibold text-plum-700 mb-1">Sharpen the answer</h2>
        <p className="text-sm text-plum-400">Optional — but each one tightens a range or changes the verdict. Skip anything you're unsure of.</p>
      </div>

      <Field label="Emergency savings" hint="Fewer months of buffer lowers the amount we'd call safe to carry.">
        <div className="grid grid-cols-4 gap-2">
          {savingsOptions.map((o) => (
            <button
              key={o.v}
              onClick={() => onUpdate('monthsOfSavings', o.v)}
              className={`py-2.5 rounded-lg text-sm border-2 transition-all ${input.monthsOfSavings === o.v ? 'border-plum-600 bg-plum-50 text-plum-700' : 'border-plum-100 text-plum-400 hover:border-plum-200'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Field>

      <Toggle
        label="Income is steady (2y+ salaried, or documented business)"
        value={input.incomeIsStable === true}
        onChange={(v) => onUpdate('incomeIsStable', v ? true : false)}
      />

      <Field label="Balance on any app loans or credit cards priced above ~24% (₹)" hint="High-cost debt can flip the verdict toward consolidating first.">
        <input
          type="number"
          value={input.highCostDebtOutstanding >= 0 ? input.highCostDebtOutstanding || '' : ''}
          onChange={(e) => onUpdate('highCostDebtOutstanding', e.target.value === '' ? -1 : Number(e.target.value))}
          placeholder="Leave blank if none / unsure"
          className="input-field font-mono"
        />
      </Field>

      <Toggle
        label="I missed or bounced a loan/EMI payment in the last 3 months"
        value={input.bouncedRecently}
        onChange={(v) => onUpdate('bouncedRecently', v)}
      />

      <Toggle
        label="I have a co-applicant with income (spouse, family)"
        value={input.hasCoApplicant}
        onChange={(v) => onUpdate('hasCoApplicant', v)}
      />
      {input.hasCoApplicant && (
        <Field label="Co-applicant net monthly income (₹)" hint="Added to your assessable income, lifting eligibility.">
          <input type="number" value={input.coApplicantIncome || ''} onChange={(e) => onUpdate('coApplicantIncome', Number(e.target.value))} placeholder="e.g. 15,000" className="input-field font-mono" />
        </Field>
      )}

      <div className="p-4 bg-sage-50 border border-sage-100 rounded-xl">
        <p className="text-sm text-sage-500 font-medium">Ready. The assessment shows exactly why each number came out the way it did.</p>
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6.5 shrink-0 rounded-full transition-all duration-200 ${value ? 'bg-sage-400' : 'bg-plum-100'}`}
        style={{ height: '1.6rem', width: '3rem' }}
      >
        <div className={`absolute top-1 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-all duration-200 ${value ? 'left-7' : 'left-1'}`} style={{ height: '1.1rem', width: '1.1rem' }} />
      </button>
      <label className="text-sm text-plum-600 cursor-pointer" onClick={() => onChange(!value)}>{label}</label>
    </div>
  );
}
