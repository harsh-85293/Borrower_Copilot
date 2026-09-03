# Borrower Copilot — Rules & Assumptions

Every threshold, band and assumption the engine uses. The rates and norms are
anchored to published Indian lending practice where that exists, and to my own
judgement where public data is thin (especially informal income). Each row says
which is which. If you disagree with a number, it lives in one place —
`src/domain/loanEngine.ts` — and changing it changes every output.

A note on philosophy that runs through all of it:

- **Unknown is never zero.** A missing CIBIL score is priced as a *thin-file
  premium*, not a 300. A blank field widens the range; it never silently
  becomes the worst case or the best case.
- **The lender's number and the borrower's number are different on purpose.**
  The sanction limit is what a bank will approve. The safe-carry limit is what
  the borrower should actually take. We always tell them to use the smaller one.
- **Silence widens the band.** The less the borrower tells us, the wider the
  rate band and the more we shave off the safe-carry number — and the app says so.

## Affordability (FOIR)

| What | Value | Why | Source / judgement |
|---|---|---|---|
| FOIR ceiling — salaried | 50% of net income | Predictable income supports a higher EMI share | RBI / standard bank practice (SBI, HDFC, ICICI) |
| FOIR ceiling — self-employed | 45% | Income varies more; tighter margin | Bank norms for non-salaried |
| FOIR ceiling — informal | 35% | Cash flow least predictable; most conservative | My judgement — informal-sector risk |

FOIR here means total EMI (existing + new) as a share of assessable monthly income.

## Product routing and base rates

The purpose and collateral decide the product, and the product sets the base rate.
Routing to a *secured* product is often the single biggest favour we can do a
borrower — it can cut the rate by 3–5 points.

| Product | Base rate | Routed when | Source / judgement |
|---|---|---|---|
| Home loan | 8.6% | Purpose is a property purchase and amount ≥ ₹20L | Home-loan market range, 2025 |
| Loan Against Property (LAP) | 10.5% | Borrower has unencumbered property + a business/large ask | LAP market range |
| Gold loan | 11.0% | Purpose or collateral is gold | Gold-loan market range |
| Two-wheeler loan | 11.5% | Purpose is a scooter / bike / EV | Vehicle-loan market range |
| Personal loan | 13.5% | No collateral offered (default unsecured) | Personal-loan market range |
| Business loan | 14.5% | Commercial purpose, no collateral pledged | Business-loan market range |

**Ravi is the case this rule exists for:** he owns a ₹45L shop, so the engine
routes his business ask to a LAP at 10.5% rather than an unsecured business loan
at 14.5%.

## Rate build-up

Final nominal rate = product base + employment premium + credit adjustment.

| What | Value | Why | Source / judgement |
|---|---|---|---|
| Employment premium — salaried | +0% | Baseline | My judgement |
| Employment premium — self-employed | +0.5% | Documentation and income-variability risk | My judgement |
| Employment premium — informal | +2.0% | Highest documentation risk | My judgement |
| No-CIBIL premium | +2.5% | No history to price against — a thin-file premium, **not** a bad-credit penalty | My judgement, mirrors thin-file pricing |
| Credit adjustment 800–900 | −0.5% | Best tier | CIBIL band conventions |
| Credit adjustment 750–799 | 0% | Good, neutral | CIBIL band conventions |
| Credit adjustment 700–749 | +0.5% | Fair | CIBIL band conventions |
| Credit adjustment 650–699 | +1.5% | Below average | CIBIL band conventions |
| Credit adjustment 600–649 | +3.0% | Poor | CIBIL band conventions |
| Credit adjustment 300–599 | +4.5% | Near-subprime | CIBIL band conventions |

## Fair-rate band and confidence

| What | Value | Why | Source / judgement |
|---|---|---|---|
| Band half-width | ±0.5% (full confidence) to ±2.5% (sparse answers) | Fewer answers → wider band. We never narrow what we can't see. | My judgement |
| Confidence score | Weighted: credit known 25, savings 15, income-stability 15, high-cost-debt answered 15, expenses 10, documentation 10, co-applicant coherence 10 | Weights the signals that actually move a number | My judgement |

## All-in APR (the honest cost)

| What | Value | Why | Source / judgement |
|---|---|---|---|
| Processing fee | 1.2% of loan + 18% GST | Typical bank processing charge | Avg across major banks |
| All-in APR | The internal rate of return of the EMI stream against the amount actually disbursed (principal minus the fee) | This is the true cost once fees are amortised — what a borrower should compare a lender's quote against | RBI-style APR disclosure logic |

The APR is solved numerically (bisection), not approximated with a
rate-plus-fee shortcut, so a lender advertising a low headline rate but a fat
fee will show up here as a higher APR.

## How much (the two numbers)

| What | Value | Why | Source / judgement |
|---|---|---|---|
| Lender sanction limit | Max loan the EMI ceiling supports, lifted by collateral LTV for secured products | The number a bank would put on a sanction letter | Standard affordability underwriting |
| Property LTV | 60% | Conservative advance against pledged property | Standard LTV norms |
| Gold LTV | 75% | Higher, because gold is liquid | RBI gold-loan LTV norms |
| Safe-carry factor | 80% base, then −10% if under 3 months savings, +5% if 6+ months, minus a penalty that grows as confidence falls (floor 40%, cap 90%) | Borrow below the sanction so a shock doesn't sink you | My judgement — prudent borrowing |
| Recommended amount | min(amount wanted, safe-carry limit) | Never more than is safe, never more than asked. Everything downstream (EMI, stress, tenure) is measured against this. | My judgement |

## EMI, tenure and stress (what to agree to)

| What | Value | Why | Source / judgement |
|---|---|---|---|
| EMI ceiling | FOIR ceiling × assessable income − existing EMIs | The most a lender should let the borrower commit | Standard affordability math |
| EMI formula | P·r·(1+r)^n / ((1+r)^n − 1) | Standard reducing-balance EMI | Financial mathematics |
| Tenure trade-off | EMI + total interest shown at 24/36/60/84/120 months | Longer tenure lowers EMI but costs more interest — shown, not hidden | My judgement |
| Stress test | 20% income drop, on the recommended amount | Job loss / downturn / health shock. Fails if EMI + existing EMIs top 50% of the reduced income. | My judgement — conservative shock |

## Assessable income (a deliberately conservative call)

For self-employed borrowers with an ITR, the engine lends against
**min(stated cash income, ITR ÷ 12)** rather than the higher cash figure, and
adds any co-applicant income. This is intentionally cautious: it protects the
borrower from over-borrowing against cash they can't document, and it is the
reason Ravi is nudged to "Borrow less" rather than waved through at ₹15L. A
lender might be more generous; a *self-assessment* tool should not be.

## Verdict logic (O1)

Evaluated top to bottom; the first match wins.

| Condition | Verdict | Meaning |
|---|---|---|
| No EMI room at all, **or** a bounce in the last 3 months plus ≥2 other danger signals | **Don't Borrow Yet** | Stabilise and clear high-cost debt first. This is a legitimate, reachable answer. |
| Existing EMIs > 40% of income, **or** high-cost debt greater than a month's income | **Consolidate First** | Clear or refinance expensive debt before adding more |
| The recommended amount fails the stress test | **Borrow Less** | Drop the amount or lengthen the tenure until a 20% dip survives |
| The amount wanted exceeds the safe-carry limit | **Borrow Less** | Take the smaller, safe figure |
| Everything clears | **Borrow** | Income comfortably carries the amount and survives the stress case |

Danger signals counted for "Don't Borrow Yet": a recent bounce, any high-cost
debt, existing EMIs over 40% of income, and disposable income after expenses
below 30% of the FOIR ceiling.

## What this tool does not do

- No bureau pull, no live rate feed, no lender API. Rates are indicative bands,
  not quotes.
- Base rates are point-in-time market anchors, not a live MCLR/repo feed. In
  production they would be fetched, not hard-coded.
- Informal-income risk weights are my judgement, not published figures — the
  segment simply doesn't have clean public benchmarks.
- It is a self-assessment aid. The lender's own model still decides the final
  offer; this exists so the borrower walks in knowing what "fair" looks like.
