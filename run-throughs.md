# Run-throughs — Priya, Ravi, Anita

The three borrowers from the brief, run through the app. For each: the questions
asked, the four outputs (O1–O4), and the Negotiation Card. Numbers below are the
engine's actual output (`src/domain/loanEngine.ts`), not hand-estimates.

Where the brief gives a range (Ravi's ₹40k–80k cash, Anita's ₹26k–30k), the app
uses the midpoint and says so. Load any of them from the **Quick Load** menu.

---

## Priya — 29, salaried, Bengaluru

Software engineer, 5 years at an MNC. Net ₹1,10,000/mo. Car loan EMI ₹14,000
(2 years left). CIBIL 780. Rent ₹28,000. Wants **₹8,00,000 for a wedding**.

**Questions asked:** name/age/city → employment (salaried) + income + existing
EMIs + expenses → CIBIL known (780) → purpose (wedding) + amount (₹8L) + tenure
(60mo) → sharper: 4 months savings, income steady, no high-cost debt, no bounce,
no co-applicant. The self-employed ITR/collateral block is **not shown** — she's
salaried. **Confidence: 100%.**

| Output | Result |
|---|---|
| **Product** | Personal Loan (no collateral offered) |
| **O1 — Verdict** | **Borrow.** Her ₹1,10,000 income comfortably carries ₹8,00,000 within a 50% ceiling and survives a 20% income shock. |
| **O2 — How much** | Lender may sanction **₹17,81,846**; safe to carry **₹14,25,477**. She only wants ₹8L, so **borrow ₹8,00,000** — well within safe. |
| **O3 — Fair rate** | Band **13.00%–14.00%**, all-in APR **14.14%**. |
| **O4 — EMI** | Ceiling **₹41,000/mo**. Stress test: income drops to ₹88,000, debt-to-income **36.8% → passes**. |

**Negotiation Card:** Personal Loan · rate 13.00–14.00%, walk away above 14.00% ·
borrow ₹8,00,000 not the full sanction · "My CIBIL is 780, put me in your best
tier" · "Quote the all-in APR, my benchmark is 14.14%".

Priya is the clean "yes". The point the card makes for her: the bank will happily
offer her ₹17L — she should take less than half that.

---

## Ravi — 42, self-employed, Mysuru

Kirana store, 14 years. Cash ₹40k–80k/mo (midpoint **₹60,000** used); ITR shows
**₹4,20,000/year**. Owns shop premises ~**₹45,00,000**, unencumbered. No CIBIL.
Wife earns ₹18,000 teaching. Wants **₹15,00,000** for a second stock line and a
delivery vehicle, over 84 months.

**Questions asked:** the salaried path **plus** the adaptive self-employed block
(ITR ₹4.2L, collateral ₹45L) and the co-applicant question (wife, ₹18,000). No
CIBIL, so the score field is replaced by the no-score explanation.
**Confidence: 75%** (no credit history is the missing 25).

| Output | Result |
|---|---|
| **Product** | **Loan Against Property (LAP)** — routed to secured because he owns unencumbered property, cutting the rate vs an unsecured business loan. |
| **O1 — Verdict** | **Borrow Less.** Even at ₹15,00,000, a 20% income dip pushes EMIs past half his income. Borrow less or stretch the tenure. |
| **O2 — How much** | Lender may sanction **₹27,00,000** (60% of the ₹45L property); safe to carry **₹20,58,750**. He wants ₹15L, so **borrow ₹15,00,000** — but see the stress note. |
| **O3 — Fair rate** | Band **12.50%–14.50%** (wide, because no CIBIL widens it), all-in APR **13.98%**. |
| **O4 — EMI** | Ceiling **₹23,850/mo**. Stress test at ₹15L over 84mo: debt-to-income **65.3% → fails**, which is why the verdict is Borrow Less. |

**Why the conservative call:** the engine lends against min(cash ₹60k, ITR ₹35k) +
wife ₹18k = ₹53k assessable, not the full ₹60–80k cash. That's deliberate for a
self-assessment tool (see RULES.md) and it's what produces the useful "borrow
less or lengthen tenure" nudge instead of rubber-stamping ₹15L.

**Negotiation Card:** LAP · rate 12.50–14.50% · "Route me to a LAP, not an
unsecured business loan — I own the shop outright" · "I'm pledging ₹45.00L of
property, that should cut my rate, not just raise my limit" · "No CIBIL, but ITR
and 14 years of trading back me — the 2.5% no-score premium is negotiable".

Ravi is the case the brief flags by name: correctly routed to a secured product,
and the borrower's safe number is honestly below what the bank would sanction.

---

## Anita — 35, informal, Hubballi

Delivery rider plus home tailoring, ₹26k–30k/mo (midpoint **₹28,000**). Two
children, husband unemployed 8 months. Three app loans, **₹35,000** outstanding
at 30%+, servicing ~₹4,500/mo, **one EMI bounced last month**. Wants **₹1,50,000**
for an electric scooter to double her delivery runs.

**Questions asked:** informal employment + income + existing EMIs + expenses →
no CIBIL → purpose (electric scooter) + ₹1.5L + 36mo → sharper: 0 months savings,
income not steady, high-cost debt ₹35,000, **bounce = yes**, no co-applicant
(husband unemployed). **Confidence: 65%.**

| Output | Result |
|---|---|
| **Product** | Two-Wheeler Loan (the scooter is its own collateral — cheaper than an app loan). |
| **O1 — Verdict** | **Don't Borrow Yet.** A recent missed payment plus existing pressure means new EMI debt would likely push her into a trap. Stabilise cash flow and clear the high-cost app loans first. |
| **O2 — How much** | Lender might sanction **₹1,50,752**; safe to carry **₹97,612**. But the verdict overrides this — the honest answer is *not now*. |
| **O3 — Fair rate** | Band **14.80%–17.20%**, all-in APR **17.02%** — still far below the 30%+ she pays on app loans. |
| **O4 — EMI** | Ceiling **₹5,300/mo**. On ₹1.5L the stress test technically passes (35.4%), but the bounce + high-cost-debt danger signals fire the "Don't Borrow Yet" verdict first. |

**Negotiation Card:** Two-Wheeler Loan · "I'll revisit in 3 months with a clean
repayment record rather than borrow under pressure now" · "No CIBIL, but ₹28,000/mo
income backs a small secured loan" · and the standing advice to refinance the
30%+ app loans first.

Anita is the reachable **"Don't"** the brief insists on. The tool doesn't just
crunch affordability — it recognises that borrowing more on top of a fresh bounce
and 30% app loans is how the debt trap closes, and it says so. The scooter would
raise her income, so the advice is "clear the trap, then come back", not "never".

---

## Side by side

| | Priya | Ravi | Anita |
|---|---|---|---|
| Employment | Salaried | Self-employed | Informal |
| Assessable income | ₹1,10,000 | ₹53,000 (min of cash/ITR + wife) | ₹28,000 |
| Credit | 780 | None | None |
| Product routed | Personal | **LAP (secured)** | Two-wheeler |
| Verdict | Borrow | Borrow Less | **Don't Borrow Yet** |
| Fair rate | 13.00–14.00% | 12.50–14.50% | 14.80–17.20% |
| Borrow this | ₹8,00,000 | ≤ safe, stretch tenure | ₹0 for now |
| Confidence | 100% | 75% | 65% |
