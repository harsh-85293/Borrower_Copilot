# Borrower Copilot — Run-Throughs for Test Personas

This document traces the exact question flow, the four computed outputs (O1–O4), and the Negotiation Card details for each of the three test personas.

---

## Persona 1: Priya (29, Salaried, Bengaluru)

### Question Flow

| Step | Question | Priya's Answer |
|---|---|---|
| 1 — Profile | Full Name | Priya Sharma |
| 1 — Profile | Age | 29 |
| 1 — Profile | City | Bengaluru |
| 2 — Employment | Employment Type | Salaried |
| 2 — Employment | Net Monthly Income | ₹85,000 |
| 2 — Employment | Existing Monthly EMIs | ₹12,000 |
| 2 — Employment | Monthly Expenses | ₹35,000 |
| 3 — Credit | Credit Status | Known |
| 3 — Credit | CIBIL Score | 780 |
| 4 — Loan | Purpose | Home renovation |
| 4 — Loan | Tenure | 60 months |
| 5 — Optional | Dependents | 0 |
| 5 — Optional | Has Insurance | Yes |
| 5 — Optional | Job Tenure | 36 months |
| 5 — Optional | Other Income | ₹0 |

**Confidence Meter: 100%** (all optional fields answered + credit score known)

### Calculations

- **FOIR Limit:** 50% (salaried) → ₹85,000 × 0.50 = ₹42,500
- **EMI Ceiling:** ₹42,500 − ₹12,000 (existing EMIs) = **₹30,500/month**
- **Base Rate:** 9.5% (salaried)
- **Credit Adjustment:** 0% (score 780 falls in 750–799 band)
- **Final Rate:** 9.5% + 0% = **9.5%**
- **Lender Sanction Limit:** MaxLoanFromEMI(₹30,500, 9.5%, 60mo) ≈ **₹14,42,000**
- **Safe Carry Limit:** ₹14,42,000 × 0.70 ≈ **₹10,09,000**
- **Processing Fee:** ₹14,42,000 × 1.2% × 1.18 ≈ ₹20,400
- **APR:** ~10.2% (rate + amortized fee)
- **Stress Test:** Income drops to ₹68,000 → New FOIR = (₹30,500 + ₹12,000) / ₹68,000 = 62.5% → **Dangerous**
- **Verdict:** Existing EMIs = ₹12,000 / ₹85,000 = 14.1% (< 40%, no consolidate). EMI ceiling > 0. Total FOIR at max = (₹30,500 + ₹12,000) / ₹85,000 = 50% (at FOIR limit, not > 45% above). → **Borrow** (at safe carry limit)

### Four Outputs

| Output | Result |
|---|---|
| **O1 — Verdict** | **Borrow** — Your income comfortably supports the safe carry limit of ₹10,09,000 within a 50% FOIR ceiling. |
| **O2 — Max Amount** | Lender Sanction Limit: **₹14,42,000** · Safe Carry Limit: **₹10,09,000** |
| **O3 — Fair Rate** | Rate Band: **9.50%–10.50%** · All-in APR: **~10.2%** |
| **O4 — EMI Ceiling** | Max EMI: **₹30,500/mo** · Stress Test: Income drops to ₹68,000 → FOIR hits 62.5% → **Dangerous — EMI burden exceeds 50% of reduced income** |

### Negotiation Card

- **Profile:** Priya Sharma, 29 — salaried in Bengaluru. Income: ₹85,000/mo. CIBIL: 780.
- **Target Rate:** 9.50%
- **Target EMI:** ₹21,350/mo (70% of ceiling)
- **Target Loan Amount:** ₹10,09,000
- **Talking Points:**
  1. My fair rate band is 9.50%–10.50% — I won't accept above 10.50%.
  2. My safe EMI ceiling is ₹30,500/month — I cannot commit beyond this.
  3. My CIBIL score is 780 — I qualify for your best rate tier, not the standard quote.

---

## Persona 2: Ravi (42, Self-Employed, Mysuru)

### Question Flow

| Step | Question | Ravi's Answer |
|---|---|---|
| 1 — Profile | Full Name | Ravi Kumar |
| 1 — Profile | Age | 42 |
| 1 — Profile | City | Mysuru |
| 2 — Employment | Employment Type | Self-Employed |
| 2 — Employment | Net Monthly Income | ₹1,20,000 |
| 2 — Employment | Existing Monthly EMIs | ₹25,000 |
| 2 — Employment | Monthly Expenses | ₹45,000 |
| 2 — Employment (Adaptive) | Annual ITR Amount | ₹15,00,000 |
| 2 — Employment (Adaptive) | Has Collateral | Yes |
| 2 — Employment (Adaptive) | Collateral Value | ₹20,00,000 |
| 3 — Credit | Credit Status | Known |
| 3 — Credit | CIBIL Score | 710 |
| 4 — Loan | Purpose | Business expansion |
| 4 — Loan | Tenure | 84 months |
| 5 — Optional | Dependents | 3 |
| 5 — Optional | Has Insurance | Yes |
| 5 — Optional | Job Tenure | 120 months |
| 5 — Optional | Other Income | ₹15,000 |

**Confidence Meter: 100%** (all optional fields + credit known)

### Calculations

- **FOIR Limit:** 45% (self-employed) → ₹1,20,000 × 0.45 = ₹54,000
- **EMI Ceiling:** ₹54,000 − ₹25,000 = **₹29,000/month**
- **Base Rate:** 10.5% (self-employed)
- **Credit Adjustment:** +0.5% (score 710 falls in 700–749 band)
- **Final Rate:** 10.5% + 0.5% = **11.0%**
- **EMI-based sanction:** MaxLoanFromEMI(₹29,000, 11%, 84mo) ≈ ₹13,70,000
- **ITR-based sanction:** ITR income = ₹15,00,000/12 = ₹1,25,000/mo → FOIR cap = ₹56,250 − ₹25,000 = ₹31,250 → MaxLoanFromEMI(₹31,250, 11%, 84mo) ≈ ₹14,76,000
- **Collateral-based:** ₹20,00,000 × 70% = **₹14,00,000**
- **Lender Sanction Limit:** max(₹13,70,000, ₹14,76,000, ₹14,00,000) ≈ **₹14,76,000**
- **Safe Carry Limit:** ₹14,76,000 × 0.70 ≈ **₹10,33,000**
- **Processing Fee:** ₹14,76,000 × 1.2% × 1.18 ≈ ₹20,900
- **APR:** ~11.8%
- **Stress Test:** Income drops to ₹96,000 → New FOIR = (₹29,000 + ₹25,000) / ₹96,000 = 56.2% → **Dangerous**
- **Verdict:** Existing EMIs = ₹25,000 / ₹1,20,000 = 20.8% (< 40%). EMI ceiling > 0. Total FOIR at max = (₹29,000 + ₹25,000) / ₹1,20,000 = 45% (at limit). → **Borrow** (at safe carry limit)

### Four Outputs

| Output | Result |
|---|---|
| **O1 — Verdict** | **Borrow** — Your income comfortably supports the safe carry limit of ₹10,33,000 within a 45% FOIR ceiling. |
| **O2 — Max Amount** | Lender Sanction Limit: **₹14,76,000** · Safe Carry Limit: **₹10,33,000** |
| **O3 — Fair Rate** | Rate Band: **11.00%–12.00%** · All-in APR: **~11.8%** |
| **O4 — EMI Ceiling** | Max EMI: **₹29,000/mo** · Stress Test: Income drops to ₹96,000 → FOIR hits 56.2% → **Dangerous — EMI burden exceeds 50% of reduced income** |

### Negotiation Card

- **Profile:** Ravi Kumar, 42 — self employed in Mysuru. Income: ₹1,20,000/mo. CIBIL: 710.
- **Target Rate:** 11.00%
- **Target EMI:** ₹20,300/mo (70% of ceiling)
- **Target Loan Amount:** ₹10,33,000
- **Talking Points:**
  1. My fair rate band is 11.00%–12.00% — I won't accept above 12.00%.
  2. My safe EMI ceiling is ₹29,000/month — I cannot commit beyond this.
  3. My CIBIL score is 710 — I qualify for your best rate tier, not the standard quote.
  4. I have ITR showing ₹15.00 L annual income — treat me as a documented borrower, not informal.
  5. I'm offering collateral worth ₹20.00 L — this should reduce my rate, not just increase my loan size.

---

## Persona 3: Anita (35, Informal, Hubballi)

### Question Flow

| Step | Question | Anita's Answer |
|---|---|---|
| 1 — Profile | Full Name | Anita Devi |
| 1 — Profile | Age | 35 |
| 1 — Profile | City | Hubballi |
| 2 — Employment | Employment Type | Informal |
| 2 — Employment | Net Monthly Income | ₹28,000 |
| 2 — Employment | Existing Monthly EMIs | ₹3,000 |
| 2 — Employment | Monthly Expenses | ₹18,000 |
| 3 — Credit | Credit Status | Unknown (no CIBIL score) |
| 4 — Loan | Purpose | Working capital for tailoring shop |
| 4 — Loan | Tenure | 36 months |
| 5 — Optional | Dependents | 2 |
| 5 — Optional | Has Insurance | No |
| 5 — Optional | Job Tenure | 48 months |
| 5 — Optional | Other Income | ₹0 |

**Confidence Meter: 60%** (3 of 5 confidence fields answered — credit unknown, no insurance, no other income)

### Calculations

- **FOIR Limit:** 35% (informal) → ₹28,000 × 0.35 = ₹9,800
- **EMI Ceiling:** ₹9,800 − ₹3,000 = **₹6,800/month**
- **Base Rate:** 14% (informal)
- **Credit Adjustment:** +2.5% (unknown credit — risk premium applied)
- **Final Rate:** 14% + 2.5% = **16.5%**
- **Lender Sanction Limit:** MaxLoanFromEMI(₹6,800, 16.5%, 36mo) ≈ **₹1,96,000**
- **Safe Carry Limit:** ₹1,96,000 × 0.70 ≈ **₹1,37,000**
- **Processing Fee:** ₹1,96,000 × 1.2% × 1.18 ≈ ₹2,775
- **APR:** ~17.8%
- **Stress Test:** Income drops to ₹22,400 → New FOIR = (₹6,800 + ₹3,000) / ₹22,400 = 43.7% → **Manageable** (under 50%)
- **Verdict:** Existing EMIs = ₹3,000 / ₹28,000 = 10.7% (< 40%). EMI ceiling > 0. Total FOIR at max = (₹6,800 + ₹3,000) / ₹28,000 = 35% (at FOIR limit, not > 45%). → **Borrow** (at safe carry limit)

### Four Outputs

| Output | Result |
|---|---|
| **O1 — Verdict** | **Borrow** — Your income comfortably supports the safe carry limit of ₹1,37,000 within a 35% FOIR ceiling. |
| **O2 — Max Amount** | Lender Sanction Limit: **₹1,96,000** · Safe Carry Limit: **₹1,37,000** |
| **O3 — Fair Rate** | Rate Band: **16.50%–17.50%** · All-in APR: **~17.8%** |
| **O4 — EMI Ceiling** | Max EMI: **₹6,800/mo** · Stress Test: Income drops to ₹22,400 → FOIR = 43.7% → **Manageable under stress** |

### Negotiation Card

- **Profile:** Anita Devi, 35 — informal in Hubballi. Income: ₹28,000/mo. No CIBIL score.
- **Target Rate:** 16.50%
- **Target EMI:** ₹4,760/mo (70% of ceiling)
- **Target Loan Amount:** ₹1,37,000
- **Talking Points:**
  1. My fair rate band is 16.50%–17.50% — I won't accept above 17.50%.
  2. My safe EMI ceiling is ₹6,800/month — I cannot commit beyond this.
  3. I don't have a CIBIL score yet, but my income of ₹28,000/mo supports this loan — the +2.5% risk premium is negotiable.

---

## Comparison Summary

| Metric | Priya | Ravi | Anita |
|---|---|---|---|
| Employment | Salaried | Self-Employed | Informal |
| Income | ₹85,000/mo | ₹1,20,000/mo | ₹28,000/mo |
| FOIR Limit | 50% | 45% | 35% |
| Credit Status | Known (780) | Known (710) | Unknown |
| Final Rate | 9.50% | 11.00% | 16.50% |
| Sanction Limit | ₹14,42,000 | ₹14,76,000 | ₹1,96,000 |
| Safe Carry | ₹10,09,000 | ₹10,33,000 | ₹1,37,000 |
| Stress Verdict | Dangerous | Dangerous | Manageable |
| Confidence | 100% | 100% | 60% |
