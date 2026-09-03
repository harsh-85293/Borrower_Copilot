# Borrower Copilot

**Live demo:** https://harsh-85293.github.io/Borrower_Copilot/

A financial self-assessment tool that helps an Indian borrower answer four questions
*before* they walk into a bank:

1. **Should I borrow at all?**
2. **How much am I really eligible for?** (what a lender will sanction vs. what I can safely carry)
3. **What is a fair interest rate for me?** (a band, plus the all-in APR with fees)
4. **What EMI should I agree to?** (a monthly ceiling, with a stress case)

It then produces a one-page **Negotiation Card** the borrower can print and take to the branch.

Everything runs in the browser. No login, no bureau pull, no data leaves the device.

## Running it locally

Requirements: Node 18+ and npm.

```bash
npm install
npm run dev
```

Vite will print a local URL (usually http://localhost:5173). Open it in a browser.

To try the three sample borrowers, use the **Quick Load** menu in the header
(Priya, Ravi, Anita). The **Rules** button opens the full table of thresholds and assumptions.

### Other scripts

```bash
npm run build      # production build
npm run preview    # preview the production build
npm run typecheck  # type-check without emitting
npm run lint       # eslint
```

## How it's put together

- `src/domain/loanEngine.ts` — all the lending logic as pure functions. No React, no DOM.
  Takes a `BorrowerInput`, returns a `LoanResult`. This is the part that decides sanction
  limits, safe-carry limits, rate bands, APR, the verdict and the stress test.
- `src/hooks/useBorrowerState.ts` — a single custom hook holding the form input, computed
  result, wizard step and confidence score.
- `src/components/` — the UI: the wizard, the results dashboard, the negotiation card and the
  rules modal. Components only render; they don't contain business rules.
- `src/data/personas.ts` — the three sample borrowers used for the run-throughs.

Keeping the rules out of the UI means they can be read (and changed) in one place, and the
same engine could later be dropped behind an API without touching the calculations.

## Documentation

- `RULES.md` — every threshold, band and assumption, with the reasoning and source behind each.
- `run-throughs.md` — the full question flow, four outputs and Negotiation Card for Priya,
  Ravi and Anita.
- `walkthrough-script.md` — a short walkthrough of the decisions, and what I'd build next.

## Assumptions

Rates, FOIR limits and fee levels are based on published Indian banking norms where they exist
and on judgement for segments (especially informal income) where public data is thin. Each
number is documented in `RULES.md` and marked as either a sourced figure or my own judgement.
This is a self-assessment aid, not a sanction guarantee.
