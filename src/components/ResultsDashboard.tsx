import {
  Gavel,
  TrendingDown,
  Percent,
  Wallet,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  FileText,
} from 'lucide-react';
import type { LoanResult, BorrowerInput } from '@/types';
import { formatINR, formatINRShort } from '@/domain/loanEngine';
import { NegotiationCard } from './NegotiationCard';

interface ResultsDashboardProps {
  result: LoanResult;
  input: BorrowerInput;
  onBack: () => void;
}

export function ResultsDashboard({ result, input, onBack }: ResultsDashboardProps) {
  const verdictStyles: Record<string, { bg: string; text: string; border: string; icon: typeof ShieldCheck }> = {
    borrow: { bg: 'bg-sage-50', text: 'text-sage-500', border: 'border-sage-200', icon: ShieldCheck },
    borrow_less: { bg: 'bg-gold-400/10', text: 'text-gold-600', border: 'border-gold-400/30', icon: TrendingDown },
    dont_borrow: { bg: 'bg-rust-400/10', text: 'text-rust-500', border: 'border-rust-400/30', icon: AlertTriangle },
    consolidate_first: { bg: 'bg-plum-50', text: 'text-plum-600', border: 'border-plum-200', icon: Gavel },
  };

  const style = verdictStyles[result.verdict] ?? verdictStyles.borrow;
  const VerdictIcon = style.icon;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button onClick={onBack} className="btn-ghost flex items-center gap-1 text-sm no-print">
        <ArrowRight className="w-4 h-4 rotate-180" />
        Edit my answers
      </button>

      {/* O1 — Verdict */}
      <div className={`card p-6 sm:p-8 border-2 ${style.border} ${style.bg}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center shrink-0`}>
            <VerdictIcon className={`w-6 h-6 ${style.text}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-plum-400 uppercase tracking-wider">O1 — Verdict</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-serif font-bold ${style.text} mb-2`}>
              {result.verdictLabel}
            </h2>
            <p className="text-sm sm:text-base text-plum-600 leading-relaxed">{result.rationale}</p>
          </div>
        </div>
      </div>

      {/* O2 & O3 — Max Amount & Fair Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* O2 — Max Amount */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-plum-500" />
            <span className="text-xs font-medium text-plum-400 uppercase tracking-wider">O2 — Max Amount</span>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-plum-400 mb-1">Lender Sanction Limit</p>
              <p className="text-2xl font-mono font-bold text-plum-700">
                {formatINR(result.lenderSanctionLimit)}
              </p>
              <p className="text-[11px] text-plum-300 mt-0.5">What a bank will approve</p>
            </div>
            <div className="h-px bg-plum-50" />
            <div>
              <p className="text-xs text-sage-500 mb-1 font-medium">Safe Carry Limit</p>
              <p className="text-2xl font-mono font-bold text-sage-500">
                {formatINR(result.safeCarryLimit)}
              </p>
              <p className="text-[11px] text-plum-300 mt-0.5">What you should actually borrow</p>
            </div>
          </div>
        </div>

        {/* O3 — Fair Rate */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Percent className="w-5 h-5 text-plum-500" />
            <span className="text-xs font-medium text-plum-400 uppercase tracking-wider">O3 — Fair Rate</span>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-plum-400 mb-1">Interest Rate Band</p>
              <p className="text-2xl font-mono font-bold text-plum-700">
                {(result.rateBand.low * 100).toFixed(2)}%–{(result.rateBand.high * 100).toFixed(2)}%
              </p>
              <p className="text-[11px] text-plum-300 mt-0.5">Negotiate within this range</p>
            </div>
            <div className="h-px bg-plum-50" />
            <div>
              <p className="text-xs text-gold-600 mb-1 font-medium">All-in APR</p>
              <p className="text-2xl font-mono font-bold text-gold-600">
                {(result.rateBand.apr * 100).toFixed(2)}%
              </p>
              <p className="text-[11px] text-plum-300 mt-0.5">Includes processing fees + GST</p>
            </div>
          </div>
        </div>
      </div>

      {/* O4 — EMI Ceiling & Stress Test */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-plum-500" />
          <span className="text-xs font-medium text-plum-400 uppercase tracking-wider">O4 — EMI Ceiling</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-plum-400 mb-1">Maximum Monthly EMI</p>
            <p className="text-3xl font-mono font-bold text-plum-700">
              {formatINR(result.emiCeiling)}
              <span className="text-base text-plum-400 font-sans font-normal">/mo</span>
            </p>
            <p className="text-[11px] text-plum-300 mt-1">
              Never agree to an EMI above this figure
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${result.stressTest.newFOIR > 0.5 ? 'bg-rust-400/10 border-rust-400/30' : 'bg-sage-50 border-sage-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`w-4 h-4 ${result.stressTest.newFOIR > 0.5 ? 'text-rust-500' : 'text-sage-500'}`} />
              <p className={`text-xs font-medium uppercase tracking-wider ${result.stressTest.newFOIR > 0.5 ? 'text-rust-500' : 'text-sage-500'}`}>
                Stress Test
              </p>
            </div>
            <p className="text-sm text-plum-600 mb-2">{result.stressTest.scenario}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-plum-400">New EMI burden</span>
                <span className="font-mono font-medium text-plum-700">{formatINR(result.stressTest.newEMIBurden)}/mo</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-plum-400">New FOIR</span>
                <span className={`font-mono font-medium ${result.stressTest.newFOIR > 0.5 ? 'text-rust-500' : 'text-sage-500'}`}>
                  {(result.stressTest.newFOIR * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <p className={`text-xs mt-2 font-medium ${result.stressTest.newFOIR > 0.5 ? 'text-rust-500' : 'text-sage-500'}`}>
              {result.stressTest.verdict}
            </p>
          </div>
        </div>
      </div>

      {/* Negotiation Card */}
      <NegotiationCard result={result} input={input} />

      {/* Summary footer */}
      <div className="text-center py-4 no-print">
        <p className="text-xs text-plum-300">
          Assessment generated for {input.name} · {input.city} · {input.employmentType.replace('-', ' ')}
        </p>
      </div>
    </div>
  );
}
