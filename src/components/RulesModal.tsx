import { X, BookOpen } from 'lucide-react';
import { useEffect } from 'react';
import type { RuleEntry } from '@/types';

const rules: RuleEntry[] = [
  { what: 'FOIR Limit (Salaried)', value: '50% of net income', why: 'Banks cap total EMI obligations at 50% for salaried borrowers with stable income', source: 'RBI guidelines + standard banking practice' },
  { what: 'FOIR Limit (Self-Employed)', value: '45% of net income', why: 'Income variability warrants tighter margin', source: 'Bank lending norms for non-salaried' },
  { what: 'FOIR Limit (Informal)', value: '35% of net income', why: 'Cash-flow unpredictability requires conservative ceiling', source: 'Judgement — informal sector risk' },
  { what: 'Risk Premium (Unknown Credit)', value: '+2.5% on base rate', why: 'No CIBIL history means lender cannot assess default probability — premium compensates', source: 'Judgement — mirrors subprime risk pricing' },
  { what: 'Base Rate (Salaried)', value: '9.5% p.a.', why: 'Starting point for salaried with good credit', source: 'Avg personal loan rates, SBI/HDFC 2024' },
  { what: 'Base Rate (Self-Employed)', value: '10.5% p.a.', why: 'Slightly higher due to income variability', source: 'Avg business loan rates 2024' },
  { what: 'Base Rate (Informal)', value: '14% p.a.', why: 'Informal sector faces highest rates due to lack of documentation', source: 'MFI / informal lending market rates' },
  { what: 'Credit Score Adjustment (800+)', value: '-0.5%', why: 'Excellent credit earns best rate', source: 'CIBIL score bands' },
  { what: 'Credit Score Adjustment (750–799)', value: '0%', why: 'Good credit — neutral adjustment', source: 'CIBIL score bands' },
  { what: 'Credit Score Adjustment (700–749)', value: '+0.5%', why: 'Fair credit — slight premium', source: 'CIBIL score bands' },
  { what: 'Credit Score Adjustment (650–699)', value: '+1%', why: 'Below average — moderate premium', source: 'CIBIL score bands' },
  { what: 'Credit Score Adjustment (600–649)', value: '+2%', why: 'Poor credit — significant premium', source: 'CIBIL score bands' },
  { what: 'Credit Score Adjustment (<600)', value: '+3.5%', why: 'Very poor — near subprime pricing', source: 'CIBIL score bands' },
  { what: 'Processing Fee', value: '1.2% of loan amount + 18% GST', why: 'Standard bank processing fee with GST', source: 'Avg across major Indian banks' },
  { what: 'Safe Carry Factor', value: '70% of sanction limit', why: 'Borrowing less than max approved creates buffer for emergencies', source: 'Judgement — conservative borrowing principle' },
  { what: 'Collateral LTV', value: '70% of collateral value', why: 'Loan-to-value ratio for secured lending', source: 'Standard banking LTV norms' },
  { what: 'Stress Test', value: '20% income drop', why: 'Simulates job loss, business downturn, or health event', source: 'Judgement — conservative stress scenario' },
  { what: 'Consolidate First Threshold', value: 'Existing EMIs > 40% of income', why: 'If already over-leveraged, new debt is dangerous — clear existing first', source: 'Judgement — debt trap prevention' },
  { what: 'Borrow Less Threshold', value: 'Total FOIR > 45% at max EMI', why: 'Borrowing at full capacity leaves no room for shocks', source: 'Judgement — prudent borrowing' },
];

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto bg-plum-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card max-w-4xl w-full p-6 sm:p-8 my-8 animate-[fadeIn_0.2s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-plum-500" />
            <h2 className="text-xl font-serif font-semibold text-plum-700">Domain Rules & Assumptions</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-plum-400 mb-4">
          Every threshold and calculation in this app is driven by the rules below. These combine
          published banking norms with judgement-based assumptions for the informal sector.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-plum-100">
                <th className="text-left py-3 px-2 font-medium text-plum-500">What</th>
                <th className="text-left py-3 px-2 font-medium text-plum-500">Value</th>
                <th className="text-left py-3 px-2 font-medium text-plum-500">Why</th>
                <th className="text-left py-3 px-2 font-medium text-plum-500">Source / Judgement</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, i) => (
                <tr key={i} className="border-b border-plum-50 last:border-b-0">
                  <td className="py-3 px-2 font-medium text-plum-700 align-top">{rule.what}</td>
                  <td className="py-3 px-2 font-mono text-plum-600 align-top whitespace-nowrap">{rule.value}</td>
                  <td className="py-3 px-2 text-plum-500 align-top">{rule.why}</td>
                  <td className="py-3 px-2 text-plum-400 align-top text-xs">{rule.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
