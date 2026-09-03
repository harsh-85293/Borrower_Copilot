import { useState, useCallback, useMemo } from 'react';
import type { BorrowerInput, LoanResult } from '@/types';
import { calculateLoan, computeConfidence } from '@/domain/loanEngine';
import { emptyInput } from '@/data/personas';

export function useBorrowerState() {
  const [input, setInput] = useState<BorrowerInput>(emptyInput);
  const [result, setResult] = useState<LoanResult | null>(null);
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const updateField = useCallback(<K extends keyof BorrowerInput>(
    field: K,
    value: BorrowerInput[K],
  ) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  }, []);

  const loadPersona = useCallback((data: BorrowerInput) => {
    setInput({ ...data });
    setResult(null);
    setShowResults(false);
    setStep(0);
  }, []);

  const reset = useCallback(() => {
    setInput(emptyInput);
    setResult(null);
    setShowResults(false);
    setStep(0);
  }, []);

  const compute = useCallback(() => {
    const res = calculateLoan(input);
    setResult(res);
    setShowResults(true);
  }, [input]);

  const confidence = useMemo(() => computeConfidence(input), [input]);

  return {
    input,
    result,
    step,
    setStep,
    showResults,
    setShowResults,
    updateField,
    loadPersona,
    reset,
    compute,
    confidence,
  };
}
