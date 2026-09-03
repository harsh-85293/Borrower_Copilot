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
  Users,
  ShieldCheck,
  Clock,
  TrendingUp,
} from 'lucide-react';
import type { BorrowerInput, EmploymentType, CreditStatus } from '@/types';
import { computeConfidence } from '@/domain/loanEngine';

interface WizardProps {
  input: BorrowerInput;
  onUpdate: <K extends keyof BorrowerInput>(field: K, value: BorrowerInput[K]) => void;
  onCompute: () => void;
  confidence: number;
}

const STEPS = [
  { id: 0, label: 'Profile', icon: User },
  { id: 1, label: 'Employment', icon: Briefcase },
  { id: 2, label: 'Credit', icon: CreditCard },
  { id: 3, label: 'Loan', icon: Target },
  { id: 4, label: 'Optional', icon: CheckCircle2 },
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
        return input.loanPurpose.trim() !== '' && input.loanTenureMonths > 0;
      case 4:
        return true;
      default:
        return false;
    }
  }, [step, input]);

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onCompute();
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

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
          <span className="text-xs font-medium text-plum-500">Confidence Meter</span>
          <span className="text-xs font-mono font-semibold text-plum-600">{confidence}%</span>
        </div>
        <div className="h-2 bg-plum-50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${confidence}%`,
              background: confidence >= 75 ? '#4D8A4D' : confidence >= 40 ? '#D4A843' : '#C25B3F',
            }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[280px]">
        {step === 0 && <ProfileStep input={input} onUpdate={onUpdate} />}
        {step === 1 && <EmploymentStep input={input} onUpdate={onUpdate} />}
        {step === 2 && <CreditStep input={input} onUpdate={onUpdate} />}
        {step === 3 && <LoanStep input={input} onUpdate={onUpdate} />}
        {step === 4 && <OptionalStep input={input} onUpdate={onUpdate} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-plum-50">
        <button
          onClick={prev}
          disabled={step === 0}
          className="btn-ghost flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button onClick={next} disabled={!canProceed} className="btn-primary flex items-center gap-2">
          {step === STEPS.length - 1 ? (
            <>
              <Calculator className="w-4 h-4" />
              See My Results
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

// ── Step components ────────────────────────────────────────────────────────

type StepProps = {
  input: BorrowerInput;
  onUpdate: <K extends keyof BorrowerInput>(field: K, value: BorrowerInput[K]) => void;
};

function ProfileStep({ input, onUpdate }: StepProps) {
  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
      <div>
        <h2 className="text-xl font-serif font-semibold text-plum-700 mb-1">Tell us about yourself</h2>
        <p className="text-sm text-plum-400">Basic details to personalize your assessment.</p>
      </div>
      <div>
        <label className="label-text">Full Name</label>
        <input
          type="text"
          value={input.name}
          onChange={(e) => onUpdate('name', e.target.value)}
          placeholder="e.g. Priya Sharma"
          className="input-field"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">Age</label>
          <input
            type="number"
            value={input.age || ''}
            onChange={(e) => onUpdate('age', Number(e.target.value))}
            placeholder="29"
            className="input-field"
          />
        </div>
        <div>
          <label className="label-text">City</label>
          <input
            type="text"
            value={input.city}
            onChange={(e) => onUpdate('city', e.target.value)}
            placeholder="Bengaluru"
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
}

function EmploymentStep({ input, onUpdate }: StepProps) {
  const employmentTypes: { value: EmploymentType; label: string; desc: string }[] = [
    { value: 'salaried', label: 'Salaried', desc: 'Regular monthly paycheck' },
    { value: 'self-employed', label: 'Self-Employed', desc: 'Business owner / professional' },
    { value: 'informal', label: 'Informal', desc: 'Daily wage / gig / cash income' },
  ];

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
      <div>
        <h2 className="text-xl font-serif font-semibold text-plum-700 mb-1">Employment & Income</h2>
        <p className="text-sm text-plum-400">This shapes your eligibility and rate band.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {employmentTypes.map((et) => (
          <button
            key={et.value}
            onClick={() => onUpdate('employmentType', et.value)}
            className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
              input.employmentType === et.value
                ? 'border-plum-600 bg-plum-50'
                : 'border-plum-100 bg-white hover:border-plum-200'
            }`}
          >
            <p className="font-medium text-plum-700 text-sm">{et.label}</p>
            <p className="text-xs text-plum-400 mt-0.5">{et.desc}</p>
          </button>
        ))}
      </div>

      <div>
        <label className="label-text">Net Monthly Income (₹)</label>
        <input
          type="number"
          value={input.netMonthlyIncome || ''}
          onChange={(e) => onUpdate('netMonthlyIncome', Number(e.target.value))}
          placeholder="85000"
          className="input-field font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-text">Existing Monthly EMIs (₹)</label>
          <input
            type="number"
            value={input.existingEMIs || ''}
            onChange={(e) => onUpdate('existingEMIs', Number(e.target.value))}
            placeholder="12000"
            className="input-field font-mono"
          />
        </div>
        <div>
          <label className="label-text">Monthly Expenses (₹)</label>
          <input
            type="number"
            value={input.monthlyExpenses || ''}
            onChange={(e) => onUpdate('monthlyExpenses', Number(e.target.value))}
            placeholder="35000"
            className="input-field font-mono"
          />
        </div>
      </div>

      {/* Adaptive: Self-employed fields */}
      {input.employmentType === 'self-employed' && (
        <div className="space-y-4 p-4 bg-plum-50/50 rounded-xl border border-plum-100 animate-[fadeIn_0.3s_ease]">
          <p className="text-xs font-medium text-plum-500 uppercase tracking-wide">Self-Employed Specifics</p>
          <div>
            <label className="label-text">Annual ITR Amount (₹)</label>
            <input
              type="number"
              value={input.itrAmount || ''}
              onChange={(e) => onUpdate('itrAmount', Number(e.target.value))}
              placeholder="1500000"
              className="input-field font-mono"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUpdate('hasCollateral', !input.hasCollateral)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                input.hasCollateral ? 'bg-plum-600 border-plum-600' : 'border-plum-200'
              }`}
            >
              {input.hasCollateral && <CheckCircle2 className="w-3.5 h-3.5 text-cream" />}
            </button>
            <label className="text-sm text-plum-600 cursor-pointer" onClick={() => onUpdate('hasCollateral', !input.hasCollateral)}>
              I have unencumbered collateral to offer
            </label>
          </div>
          {input.hasCollateral && (
            <div>
              <label className="label-text">Collateral Value (₹)</label>
              <input
                type="number"
                value={input.collateralValue || ''}
                onChange={(e) => onUpdate('collateralValue', Number(e.target.value))}
                placeholder="2000000"
                className="input-field font-mono"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreditStep({ input, onUpdate }: StepProps) {
  const statuses: { value: CreditStatus; label: string; desc: string }[] = [
    { value: 'known', label: 'I know my CIBIL score', desc: 'I have a credit history' },
    { value: 'unknown', label: 'I don\'t have a CIBIL score', desc: 'No credit history or never checked' },
  ];

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
      <div>
        <h2 className="text-xl font-serif font-semibold text-plum-700 mb-1">Credit Profile</h2>
        <p className="text-sm text-plum-400">Your credit history determines your risk premium.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => onUpdate('creditStatus', s.value)}
            className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
              input.creditStatus === s.value
                ? 'border-plum-600 bg-plum-50'
                : 'border-plum-100 bg-white hover:border-plum-200'
            }`}
          >
            <p className="font-medium text-plum-700 text-sm">{s.label}</p>
            <p className="text-xs text-plum-400 mt-0.5">{s.desc}</p>
          </button>
        ))}
      </div>

      {input.creditStatus === 'known' && (
        <div className="animate-[fadeIn_0.3s_ease]">
          <label className="label-text">CIBIL Score (300–900)</label>
          <input
            type="number"
            min={300}
            max={900}
            value={input.creditScore || ''}
            onChange={(e) => onUpdate('creditScore', Number(e.target.value))}
            placeholder="780"
            className="input-field font-mono"
          />
          <div className="mt-2 flex items-center gap-1">
            <div className="flex-1 h-1.5 bg-gradient-to-r from-rust-400 via-gold-400 to-sage-400 rounded-full" />
          </div>
          <div className="flex justify-between text-[10px] text-plum-300 mt-1">
            <span>300</span><span>650</span><span>750</span><span>900</span>
          </div>
        </div>
      )}

      {input.creditStatus === 'unknown' && (
        <div className="p-4 bg-gold-400/10 border border-gold-400/30 rounded-xl animate-[fadeIn_0.3s_ease]">
          <p className="text-sm text-plum-600">
            No problem — we'll apply a <span className="font-semibold">+2.5% risk premium</span> to your base rate
            and show you how to negotiate it down once you have income proof.
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
        <h2 className="text-xl font-serif font-semibold text-plum-700 mb-1">Loan Requirements</h2>
        <p className="text-sm text-plum-400">What do you need the money for, and for how long?</p>
      </div>
      <div>
        <label className="label-text">Purpose of Loan</label>
        <input
          type="text"
          value={input.loanPurpose}
          onChange={(e) => onUpdate('loanPurpose', e.target.value)}
          placeholder="e.g. Home renovation, Business expansion"
          className="input-field"
        />
      </div>
      <div>
        <label className="label-text">Preferred Tenure (months)</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={6}
            max={120}
            step={6}
            value={input.loanTenureMonths}
            onChange={(e) => onUpdate('loanTenureMonths', Number(e.target.value))}
            className="flex-1 accent-plum-600"
          />
          <span className="font-mono font-semibold text-plum-700 text-lg min-w-[3rem] text-right">
            {input.loanTenureMonths}mo
          </span>
        </div>
        <div className="flex justify-between text-[10px] text-plum-300 mt-1">
          <span>6mo</span><span>60mo</span><span>120mo</span>
        </div>
      </div>
    </div>
  );
}

function OptionalStep({ input, onUpdate }: StepProps) {
  const optionalItems: {
    icon: typeof Users;
    label: string;
    field: keyof BorrowerInput;
    type: 'number' | 'toggle';
    placeholder?: string;
  }[] = [
    { icon: Users, label: 'Number of dependents', field: 'dependents', type: 'number', placeholder: '2' },
    { icon: ShieldCheck, label: 'Do you have life/health insurance?', field: 'hasInsurance', type: 'toggle' },
    { icon: Clock, label: 'How long at current job/business? (months)', field: 'jobTenureMonths', type: 'number', placeholder: '36' },
    { icon: TrendingUp, label: 'Other monthly income (₹)', field: 'otherIncome', type: 'number', placeholder: '5000' },
  ];

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
      <div>
        <h2 className="text-xl font-serif font-semibold text-plum-700 mb-1">Optional Details</h2>
        <p className="text-sm text-plum-400">These boost your confidence score and improve accuracy.</p>
      </div>
      <div className="space-y-4">
        {optionalItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.field} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-plum-50 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-plum-400" />
              </div>
              <div className="flex-1">
                <label className="label-text">{item.label}</label>
                {item.type === 'number' ? (
                  <input
                    type="number"
                    value={(input[item.field] as number) || ''}
                    onChange={(e) => onUpdate(item.field, Number(e.target.value) as BorrowerInput[typeof item.field])}
                    placeholder={item.placeholder}
                    className="input-field font-mono"
                  />
                ) : (
                  <button
                    onClick={() => onUpdate(item.field, !input[item.field] as BorrowerInput[typeof item.field])}
                    className={`relative w-14 h-7 rounded-full transition-all duration-200 ${
                      input[item.field] ? 'bg-sage-400' : 'bg-plum-100'
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${input[item.field] ? 'left-8' : 'left-1'}`} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 bg-sage-50 border border-sage-100 rounded-xl">
        <p className="text-sm text-sage-500 font-medium">
          You're ready to generate your assessment. Click "See My Results" to proceed.
        </p>
      </div>
    </div>
  );
}
