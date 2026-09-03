# Borrower Copilot — Domain Rules & Assumptions

Every threshold, calculation, and assumption that drives the Borrower Copilot engine. These combine published Indian banking norms with judgement-based estimates for segments where public data is limited (especially the informal sector).

| What | Value | Why | Source / Judgement |
|---|---|---|---|
| FOIR Limit (Salaried) | 50% of net monthly income | Banks cap total EMI obligations at 50% for salaried borrowers with predictable income streams | RBI guidelines + standard banking practice (SBI, HDFC, ICICI) |
| FOIR Limit (Self-Employed) | 45% of net monthly income | Income variability warrants a tighter margin than salaried | Bank lending norms for non-salaried professionals |
| FOIR Limit (Informal) | 35% of net monthly income | Cash-flow unpredictability in informal sector requires conservative ceiling | Judgement — informal sector risk assessment |
| Risk Premium (Unknown Credit) | +2.5% added to base rate | No CIBIL history means lender cannot assess default probability — premium compensates for unknown risk | Judgement — mirrors subprime risk pricing logic |
| Base Rate (Salaried) | 9.5% p.a. | Starting point for a salaried borrower with good credit | Average personal loan rates from SBI/HDFC 2024 |
| Base Rate (Self-Employed) | 10.5% p.a. | Slightly higher due to income variability and business risk | Average business loan rates 2024 |
| Base Rate (Informal) | 14% p.a. | Informal sector faces highest rates due to lack of documentation and higher perceived risk | MFI / informal lending market rates |
| Credit Score Adjustment (800–900) | −0.5% | Excellent credit earns the best rate tier | CIBIL score band conventions |
| Credit Score Adjustment (750–799) | 0% | Good credit — neutral adjustment, base rate applies | CIBIL score band conventions |
| Credit Score Adjustment (700–749) | +0.5% | Fair credit — slight premium | CIBIL score band conventions |
| Credit Score Adjustment (650–699) | +1% | Below average — moderate premium | CIBIL score band conventions |
| Credit Score Adjustment (600–649) | +2% | Poor credit — significant premium | CIBIL score band conventions |
| Credit Score Adjustment (300–599) | +3.5% | Very poor — near subprime pricing | CIBIL score band conventions |
| Processing Fee | 1.2% of loan amount + 18% GST | Standard bank processing fee with GST applied | Average across major Indian banks (SBI, HDFC, Axis) |
| Safe Carry Factor | 70% of lender sanction limit | Borrowing less than the maximum approved creates a financial buffer for emergencies and income shocks | Judgement — conservative borrowing principle |
| Collateral LTV (Loan-to-Value) | 70% of collateral value | Standard LTV for secured lending — protects lender and sets borrower expectation | Standard banking LTV norms |
| Stress Test | 20% income drop | Simulates job loss, business downturn, or health event — tests if borrower can still service EMI | Judgement — conservative stress scenario |
| Consolidate First Threshold | Existing EMIs > 40% of income | If already over-leveraged, new debt is dangerous — advise clearing/consolidating existing debt first | Judgement — debt trap prevention |
| Borrow Less Threshold | Total FOIR > 45% at max EMI capacity | Borrowing at full capacity leaves no room for shocks — recommend borrowing less than sanction limit | Judgement — prudent borrowing guidance |
| EMI Calculation | Standard reducing-balance formula | EMI = P × r × (1+r)^n / ((1+r)^n − 1) where r = monthly rate, n = tenure months | Standard financial mathematics |
| APR Calculation | Rate + amortized processing fee impact | All-in APR includes interest plus processing fee (with GST) spread across tenure | Judgement — true cost of borrowing |
| Confidence Meter | % of optional fields answered | More optional data (dependents, insurance, job tenure, other income) increases assessment accuracy | Judgement — gamified data collection |
| Rate Band Width | +1% above calculated fair rate | Gives borrower a negotiation range — fair rate is the floor, +1% is the ceiling they should accept | Judgement — negotiation buffer |
| ITR Income Corroboration (Self-Employed) | ITR / 12 used as monthly income | For self-employed, ITR provides documented income proof that can improve sanction limit | Judgement — standard income assessment for self-employed |
| Collateral Boost (Self-Employed) | max(EMI-based, Collateral × 70%) | If collateral-backed loan exceeds EMI-based sanction, use the higher value | Judgement — secured lending benefit |
| Tenure Range | 6–120 months | Covers short-term personal loans to long-term home/business loans | Standard Indian lending market range |

## Verdict Logic

| Condition | Verdict | Meaning |
|---|---|---|
| Existing EMIs already > 40% of income | **Consolidate First** | Clear existing debt before taking new loans |
| EMI ceiling ≤ 0 (income can't support any new EMI) | **Don't Borrow** | Income insufficient for additional debt |
| Total FOIR > 45% at maximum EMI capacity | **Borrow Less** | Borrow below the sanction limit to stay safe |
| All above conditions clear | **Borrow** | Income comfortably supports the safe carry limit |

## Formula Summary

```
EMI Ceiling = (Net Monthly Income × FOIR Limit) − Existing EMIs

Lender Sanction Limit = MaxLoanFromEMI(EMI Ceiling, Final Rate, Tenure)
  + Collateral boost if self-employed with collateral
  + ITR-based income corroboration if self-employed with ITR

Safe Carry Limit = Lender Sanction Limit × 70%

Final Rate = Base Rate (by employment) + Credit Score Adjustment (or +2.5% if unknown)

Rate Band = [Final Rate, Final Rate + 1%]

APR = Final Rate + Amortized(Processing Fee + GST) / Tenure

Stress Test FOIR = (EMI Ceiling + Existing EMIs) / (Income × 0.8)
```
