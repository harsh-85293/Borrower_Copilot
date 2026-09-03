import { X, BookOpen } from 'lucide-react';
import { useEffect } from 'react';
import type { RuleEntry } from '@/types';

const rules: RuleEntry[] = [
  { what: 'FOIR limit — salaried', value: '50% of net income', why: 'Predictable income supports a higher share of income going to EMIs', source: 'RBI / standard bank practice (SBI, HDFC, ICICI)' },
  { what: 'FOIR limit — self-employed', value: '45% of net income', why: 'Income varies more, so a tighter margin', source: 'Bank norms for non-salaried' },
  { what: 'FOIR limit — informal', value: '35% of net income', why: 'Cash-flow is least predictable — most conservative ceiling', source: 'My judgement — informal-sector risk' },
  { what: 'Base rate — Home', value: '8.6% p.a.', why: 'Cheapest, fully secured against property', source: 'Indian home-loan market, 2025 range' },
  { what: 'Base rate — LAP', value: '10.5% p.a.', why: 'Secured against property, above home-loan pricing', source: 'LAP market range' },
  { what: 'Base rate — Gold', value: '11.0% p.a.', why: 'Secured, quick disbursal', source: 'Gold-loan market range' },
  { what: 'Base rate — Two-wheeler', value: '11.5% p.a.', why: 'Vehicle is the collateral', source: 'Vehicle-loan market range' },
  { what: 'Base rate — Personal', value: '13.5% p.a.', why: 'Unsecured, so priced higher', source: 'Personal-loan market range' },
  { what: 'Base rate — Business', value: '14.5% p.a.', why: 'Unsecured business risk', source: 'Business-loan market range' },
  { what: 'Employment premium', value: '+0% / +0.5% / +2% (sal/self/informal)', why: 'Layered on the product rate for income-type risk', source: 'My judgement' },
  { what: 'No-CIBIL premium', value: '+2.5%', why: 'No history to price against — a premium, not a 300 score. "Unknown is never zero."', source: 'My judgement — mirrors thin-file pricing' },
  { what: 'Credit adjustment', value: '−0.5% (800+) up to +4.5% (<600)', why: 'Better score, cheaper money', source: 'CIBIL band conventions' },
  { what: 'Processing fee', value: '1.2% + 18% GST', why: 'Folded into the all-in APR, not hidden', source: 'Avg across major banks' },
  { what: 'All-in APR', value: 'IRR of the EMI stream net of fee', why: 'The true cost once fees are amortised — what to compare a lender quote against', source: 'RBI-style APR disclosure logic' },
  { what: 'Safe-carry factor', value: '80% base, adjusted', why: 'Borrow below the sanction for a buffer; docked for thin savings and for low confidence', source: 'My judgement — prudent borrowing' },
  { what: 'Collateral LTV', value: 'Property 60%, Gold 75%', why: 'How much a secured lender advances against pledged value', source: 'Standard LTV norms' },
  { what: 'Confidence → band width', value: '±0.5% (full) to ±2.5% (sparse)', why: 'Fewer answers, wider band. We never narrow what we cannot see.', source: 'My judgement' },
  { what: 'Stress test', value: '20% income drop', why: 'Job loss / downturn / health event; fails if debt-to-income tops 50%', source: 'My judgement — conservative shock' },
  { what: "Verdict — Don't borrow", value: 'No EMI room, or a recent bounce + 2 danger signals', why: '"Don\'t" must be reachable when the borrower is under real pressure', source: 'My judgement — debt-trap prevention' },
  { what: 'Verdict — Consolidate first', value: 'Existing EMIs > 40%, or high-cost debt > income', why: 'Clear expensive debt before adding more', source: 'My judgement' },
  { what: 'Verdict — Borrow less', value: 'Wanted > safe-carry, or stress fails', why: 'Take the smaller, survivable amount', source: 'My judgement' },
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
