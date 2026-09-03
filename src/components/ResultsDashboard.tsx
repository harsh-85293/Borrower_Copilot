import {
  TrendingDown,
  Percent,
  Wallet,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Landmark,
  Info,
  Gauge,
} from 'lucide-react';
import type { LoanResult, BorrowerInput, Verdict } from '@/types';
import { formatINR } from '@/domain/loanEngine';
import { NegotiationCard } from './NegotiationCard';

interface ResultsDashboardProps {
  result: LoanResult;
  input: BorrowerInput;
  onBack: () => void;
}

const verdictStyles: Record<Verdict, { bg: string; text: string; border: string; icon: typeof ShieldCheck }> = {
  borrow: { bg: 'bg-sage-50', text: 'text-sage-500', border: 'border-sage-200', icon: ShieldCheck },
  borrow_less: { bg: 'bg-gold-400/10', text: 'text-gold-600', border: 'border-gold-400/30', icon: TrendingDown },
  dont_borrow: { bg: 'bg-rust-400/10', text: 'text-rust-500', border: 'border-rust-400/30', icon: AlertTriangle },
  consolidate_first: { bg: 'bg-plum-50', text: 'text-plum-600', border: 'border-plum-200', icon: AlertTriangle },
};

function Why({ text }: { text: string }) {
  return (
    <p className="text-[11px] text-plum-400 leading-snug mt-1.5 flex items-start gap-1">
      <Info className="w-3 h-3 mt-0.5 shrink-0 text-plum-300" />
      <span>{text}</span>
    </p>
  );
}

export function ResultsDashboard({ result, input, onBack }: ResultsDashboardProps) {
  const style = verdictStyles[result.verdict] ?? verdictStyles.borrow;
  const VerdictIcon = style.icon;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between no-print">
        <button onClick={onBack} className="btn-ghost flex items-center gap-1 text-sm">
          <ArrowRight className="w-4 h-4 rotate-180" />
          Edit answers
        </button>
        <div className="flex items-center gap-2 text-xs text-plum-400">
          <Gauge className="w-4 h-4" />
          Confidence: <span className="font-semibold text-plum-600">{result.confidenceLabel} ({result.confidence}%)</span>
        </div>
      </div>

      {/* Confidence honesty banner */}
      {result.confidence < 75 && (
        <div className="rounded-xl border border-gold-400/30 bg-gold-400/10 px-4 py-3 no-print">
          <p className="text-sm text-plum-600">{result.confidenceNote}</p>
        </div>
      )}

      {/* O1 — Verdict */}
      <div className={`card p-6 sm:p-8 border-2 ${style.border} ${style.bg}`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center shrink-0`}>
            <VerdictIcon className={`w-6 h-6 ${style.text}`} />
          </div>
          <div className="flex-1">
            <span className="text-xs font-medium text-plum-400 uppercase tracking-wider">O1 · The verdict</span>
            <h2 className={`text-2xl sm:text-3xl font-serif font-bold ${style.text} mb-2`}>{result.verdictLabel}</h2>
            <p className="text-sm sm:text-base text-plum-600 leading-relaxed">{result.rationale}</p>
          </div>
        </div>
      </div>

      {/* Product routing */}
      <div className="card p-5 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-plum-600 flex items-center justify-center shrink-0">
          <Landmark className="w-5 h-5 text-cream" />
        </div>
        <div>
          <span className="text-xs font-medium text-plum-400 uppercase tracking-wider">Ask for this product</span>
          <p className="text-lg font-serif font-semibold text-plum-700 leading-tight">{result.productLabel}</p>
          <p className="text-sm text-plum-500 mt-0.5">{result.productWhy}</p>
        </div>
      </div>

      {/* O2 & O3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* O2 — Max amount */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-plum-500" />
            <span className="text-xs font-medium text-plum-400 uppercase tracking-wider">O2 · How much</span>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-plum-400 mb-1">A lender will likely sanction</p>
              <p className="text-2xl font-mono font-bold text-plum-700">{formatINR(result.lenderSanctionLimit)}</p>
              <Why text={result.lenderSanctionWhy} />
            </div>
            <div className="h-px bg-plum-50" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-sage-500 font-medium">You can safely carry</p>
                <span className="text-[9px] font-semibold uppercase tracking-wide bg-sage-400 text-white px-1.5 py-0.5 rounded">Use this</span>
              </div>
              <p className="text-2xl font-mono font-bold text-sage-500">{formatINR(result.safeCarryLimit)}</p>
              <Why text={result.safeCarryWhy} />
            </div>
            {result.amountWanted > 0 && (
              <div className="pt-2 border-t border-plum-50 space-y-1">
                <div className="text-[11px] text-plum-400">
                  You asked for <span className="font-mono font-semibold text-plum-600">{formatINR(result.amountWanted)}</span>
                  {result.amountWanted > result.safeCarryLimit ? ' — above your safe limit.' : ' — within your safe limit.'}
                </div>
                <div className="text-xs text-plum-600">
                  Borrow this: <span className="font-mono font-bold text-sage-500">{formatINR(result.recommendedAmount)}</span>
                  <span className="text-plum-300"> (the lower of what's safe and what you asked for)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* O3 — Fair rate */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Percent className="w-5 h-5 text-plum-500" />
            <span className="text-xs font-medium text-plum-400 uppercase tracking-wider">O3 · Fair rate</span>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-plum-400 mb-1">Fair interest band</p>
              <p className="text-2xl font-mono font-bold text-plum-700">
                {(result.rateBand.low * 100).toFixed(2)}%–{(result.rateBand.high * 100).toFixed(2)}%
              </p>
              <Why text={result.rateWhy} />
            </div>
            <div className="h-px bg-plum-50" />
            <div>
              <p className="text-xs text-gold-600 mb-1 font-medium">All-in APR (with fees + GST)</p>
              <p className="text-2xl font-mono font-bold text-gold-600">{(result.rateBand.apr * 100).toFixed(2)}%</p>
              <Why text="Compare the lender's quoted APR against this — a headline rate that hides fees will read higher here." />
            </div>
          </div>
        </div>
      </div>

      {/* O4 — EMI ceiling + tenure trade-off + stress */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-plum-500" />
          <span className="text-xs font-medium text-plum-400 uppercase tracking-wider">O4 · EMI you should agree to</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-plum-400 mb-1">Monthly EMI ceiling</p>
            <p className="text-3xl font-mono font-bold text-plum-700">
              {formatINR(result.emiCeiling)}
              <span className="text-base text-plum-400 font-sans font-normal">/mo</span>
            </p>
            <Why text={result.emiWhy} />

            {/* Tenure trade-off */}
            <div className="mt-4">
              <p className="text-[11px] font-medium text-plum-400 uppercase tracking-wider mb-2">
                Tenure trade-off on {formatINR(result.recommendedAmount)}
              </p>
              <div className="space-y-1">
                {result.tenureOptions.map((t) => (
                  <div key={t.months} className="flex items-center justify-between text-xs">
                    <span className="text-plum-400">{t.months} months</span>
                    <span className="font-mono text-plum-600">{formatINR(t.emi)}/mo</span>
                    <span className="font-mono text-plum-300">+{formatINR(t.totalInterest)} interest</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-plum-300 mt-1">Longer tenure lowers the EMI but costs more interest overall.</p>
            </div>
          </div>

          {/* Stress test */}
          <div className={`p-4 rounded-xl border ${result.stressTest.passes ? 'bg-sage-50 border-sage-200' : 'bg-rust-400/10 border-rust-400/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`w-4 h-4 ${result.stressTest.passes ? 'text-sage-500' : 'text-rust-500'}`} />
              <p className={`text-xs font-medium uppercase tracking-wider ${result.stressTest.passes ? 'text-sage-500' : 'text-rust-500'}`}>
                Stress test
              </p>
            </div>
            <p className="text-sm text-plum-600 mb-2">{result.stressTest.scenario}</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-plum-400">EMI burden then</span>
                <span className="font-mono font-medium text-plum-700">{formatINR(result.stressTest.newEMIBurden)}/mo</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-plum-400">Debt-to-income then</span>
                <span className={`font-mono font-medium ${result.stressTest.passes ? 'text-sage-500' : 'text-rust-500'}`}>
                  {(result.stressTest.newFOIR * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <p className={`text-xs mt-2 font-medium ${result.stressTest.passes ? 'text-sage-500' : 'text-rust-500'}`}>
              {result.stressTest.verdict}
            </p>
          </div>
        </div>
      </div>

      {/* Negotiation card */}
      <NegotiationCard result={result} />

      <div className="text-center py-4 no-print">
        <p className="text-xs text-plum-300">
          Self-assessment for {input.name} · {input.city}. Not a sanction guarantee — your lender's own model decides the final offer.
        </p>
      </div>
    </div>
  );
}
