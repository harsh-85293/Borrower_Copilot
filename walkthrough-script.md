# Five-minute walkthrough

A written walkthrough of Borrower Copilot: the decisions behind it, one borrower
end to end, and what I would build next versus cut. Reads in about five minutes;
works as a script for a screen recording.

---

## The problem, in one line

Every lender has a model that decides what a borrower gets. The borrower walks in
with nothing, takes the first sanction letter, and finds out years later they paid
four points over fair and stretched to 65% of income. This app is the borrower's
model — a self-assessment that makes them the best-informed person in the room.

## What it produces

Four answers and a card:

1. **Should I borrow?** A verdict — and "Don't borrow yet" is reachable and fires
   for Anita.
2. **How much?** Two numbers, always separated: what a lender will *sanction*, and
   what the borrower can *safely carry*. We tell them to use the smaller one.
3. **What rate is fair?** A band (not a point) plus the all-in APR with fees, so a
   lender's quote can be compared honestly.
4. **What EMI?** A monthly ceiling, the tenure trade-off, and a 20%-income-drop
   stress case.

Then a one-page **Negotiation Card** they can print and hold up at the counter.

## The one decision that carries the app: rules separated from UI

Every lending rule lives in `src/domain/loanEngine.ts` as pure functions —
`BorrowerInput` in, `LoanResult` out, no React, no DOM. The components only render.
Three reasons this matters here:

- **You can read the whole product's judgement in one file.** FOIR ceilings,
  product routing, the rate build-up, the stress test — all in one place, which is
  also what `RULES.md` documents row for row.
- **Changing a rule is a one-line change.** The follow-up interview says you'll
  ask me to change a rule live. Because the engine is isolated, moving the informal
  FOIR ceiling from 35% to 30%, or the no-CIBIL premium from 2.5% to 2%, is a single
  constant edit that re-flows every output.
- **It's testable and portable.** I sanity-checked all three personas by importing
  the engine directly, no UI needed. The same file could sit behind an API later
  without touching the calculation.

## Four ideas I want a reviewer to notice

**The lender number and the borrower number are deliberately different.** Priya's
bank will sanction ₹17.8L. She wants ₹8L. The app shows both and says: borrow ₹8L.
The gap *is* the product.

**Unknown is never zero.** Ravi and Anita have no CIBIL. That's not a 300 — it's a
+2.5% thin-file premium, clearly labelled as negotiable with income proof, and it
lowers their confidence score (which widens their rate band) rather than tanking
their verdict.

**Secured routing.** Ravi owns a ₹45L shop, so the engine routes his business ask
to a Loan Against Property at 10.5% instead of an unsecured business loan at 14.5%.
The single most valuable thing the app tells him.

**Confidence is honest.** The fewer questions answered, the wider the band and the
more we shave the safe-carry number — and a banner says exactly that. We never
narrow a range we have no basis to narrow.

## One borrower, end to end: Anita

Anita rides for a delivery platform and tailors at home, ₹28,000/mo, two kids,
husband out of work eight months. Three app loans at 30%+, ₹35,000 outstanding,
and she bounced an EMI last month. She wants ₹1.5L for an electric scooter.

Walking her through: informal income, no CIBIL (no penalty, just a premium), and
on the "sharpen" step she flags zero savings, unstable income, ₹35,000 of
high-cost debt, and the recent bounce.

The engine routes the scooter to a two-wheeler loan (cheaper than app loans), and
the affordability math alone would sanction ~₹1.5L. But the verdict logic sees a
bounce plus two more danger signals and returns **Don't Borrow Yet** — clear the
30% app loans and stabilise first. Her card tells her to come back in three months
with a clean record. The scooter would raise her income, so it's "not now", not
"never". That's the judgement the whole challenge is testing: turning lending
sense into a rule a borrower can see and a machine can run.

## What I'd build next

- **Live rate anchors.** Base rates are point-in-time market figures today. I'd
  fetch repo/MCLR-linked bands so they stay current instead of drifting.
- **Multi-lender comparison.** Take offers the borrower has already received and
  score each against the fair band and all-in APR right on the card.
- **Debt-consolidation path.** For Anita's case, model the actual saving from
  refinancing 30% app loans into one cheaper loan, with a payoff timeline.
- **Localisation.** The copy should speak Kannada/Hindi for the borrowers who need
  this most; the number logic is already language-agnostic.

## What I'd cut

- I already cut a "number of dependents" question while building this — it never
  moved an output on its own, and the brief is explicit that a question that doesn't
  change a number should go. If I brought it back it would have to feed a real
  expense estimate, not just sit there.
- I'd resist adding more loan products than the three borrowers need. Breadth of
  products isn't what makes this useful; the reasoning is.
