import { useState } from 'react';
import { Header } from '@/components/Header';
import { Wizard } from '@/components/Wizard';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { RulesModal } from '@/components/RulesModal';
import { useBorrowerState } from '@/hooks/useBorrowerState';
import type { Persona } from '@/types';

function App() {
  const {
    input,
    result,
    showResults,
    updateField,
    loadPersona,
    reset,
    compute,
    confidence,
  } = useBorrowerState();

  const [rulesOpen, setRulesOpen] = useState(false);

  const handleLoadPersona = (persona: Persona) => {
    loadPersona(persona.input);
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header
        onLoadPersona={handleLoadPersona}
        onShowRules={() => setRulesOpen(true)}
        onReset={reset}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {!showResults || !result ? (
          <div>
            {/* Hero */}
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-plum-700 mb-3 leading-tight">
                Know Before You Owe
              </h2>
              <p className="text-base text-plum-500 leading-relaxed">
                Assess your loan eligibility, discover fair interest rates, and walk into the bank
                with a negotiation card — all before speaking to a lender.
              </p>
            </div>

            <Wizard
              input={input}
              onUpdate={updateField}
              onCompute={compute}
              confidence={confidence}
            />
          </div>
        ) : (
          <ResultsDashboard result={result} input={input} onBack={() => {}} />
        )}
      </main>

      <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />

      <footer className="border-t border-plum-100 mt-16 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-plum-300">
            Borrower Copilot · A financial self-assessment tool for Indian borrowers
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
