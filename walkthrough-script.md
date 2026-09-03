# Borrower Copilot — 5-Minute Walkthrough Script

**Speaker:** Information Science engineering student with MERN stack background
**Audience:** Course evaluator / peers
**Duration:** ~5 minutes

---

## [0:00–0:30] Introduction

"Hey everyone, I'm an Information Science engineering student, and for this project I built **Borrower Copilot** — a financial self-assessment tool that helps Indian borrowers figure out their loan eligibility and fair terms *before* they walk into a bank.

The problem is simple: most borrowers in India — especially in the informal sector — have no idea what a fair interest rate looks like, how much they can safely borrow, or what their EMI ceiling should be. They walk into a branch, the lender quotes a number, and they accept it because they have no benchmark. Borrower Copilot gives them that benchmark."

---

## [0:30–1:15] Architecture & State Management

"Now, coming from a MERN stack background, my instinct was to reach for Redux or a state management library. But for this app, I deliberately chose **pure React state management using a custom hook** — specifically, a `useBorrowerState` hook that wraps `useState` and `useMemo`.

Here's why: the app's state is self-contained. There's one form, one set of inputs, one result. There's no global state shared across dozens of components. Redux would be overkill — it would add bundle size, boilerplate, and complexity for no benefit. Instead, the hook centralizes all state logic in one place: the borrower input, the computed result, the current wizard step, and the confidence score. The hook returns these as simple values and callbacks, and any component that needs them gets them via props.

If this app grows — say we add user accounts and saved assessments — that's when I'd consider a context provider or a lightweight store like Zustand. But right now, a custom hook is the cleanest, most readable choice."

---

## [1:15–2:15] Domain Logic Decoupling

"The most important architectural decision I made was **strictly separating domain logic from the UI**. All the financial calculations live in a single file called `loanEngine.ts`. This file contains pure functions — they take a `BorrowerInput` object and return a `LoanResult` object. No React, no DOM, no side effects.

Why does this matter? Three reasons:

First, **testability**. I can write unit tests against `loanEngine.ts` without rendering a single React component. I can verify that a salaried borrower with income ₹85,000 and CIBIL 780 gets exactly the right EMI ceiling — pure input, pure output.

Second, **portability**. When I build the Node.js backend — which I'll talk about in a minute — I can import this exact same `loanEngine.ts` file into a server route. The calculation logic doesn't change whether it runs in the browser or on the server. That's the payoff of decoupling.

Third, **readability**. A new developer looking at the codebase can understand the business rules by reading `loanEngine.ts` — the FOIR limits, the credit score bands, the stress test — without having to parse through JSX and CSS classes. The UI components just call `calculateLoan(input)` and render the result."

---

## [2:15–3:00] The Unknown Credit Score Edge Case

"One of the trickiest edge cases I had to handle is the **unknown credit score** scenario. In India, a huge segment of borrowers — especially in the informal sector — have never had a credit card or formal loan. They don't have a CIBIL score. Traditional tools would either block them or ask them to guess.

Here's how I handle it smoothly: in the wizard, when the user reaches the credit step, they see two options — 'I know my CIBIL score' and 'I don't have a CIBIL score.' If they select unknown, the score input field disappears entirely — no confusing empty field staring at them. Instead, they see a friendly message explaining that a +2.5% risk premium will be applied to their base rate, and that this premium is negotiable.

In the domain engine, the `getCreditAdjustment` function checks the credit status. If it's 'unknown', it returns a flat +2.5% premium. If it's 'known', it looks up the score in a band table — 800+ gets −0.5%, 750–799 is neutral, down to 300–599 at +3.5%.

And critically, the **Negotiation Card** generates a specific talking point for unknown-credit borrowers: it tells them to bring income proof to the branch and negotiate the risk premium down. So the edge case isn't just handled mathematically — it's turned into actionable advice."

---

## [3:00–4:00] The Four Outputs & Negotiation Card

"The app produces four outputs, each addressing a different question a borrower should ask before signing:

**O1 — Verdict:** Should I borrow at all? The engine checks if existing EMIs already exceed 40% of income (Consolidate First), if income can't support any new EMI (Don't Borrow), if borrowing at max capacity pushes FOIR above 45% (Borrow Less), or if everything looks healthy (Borrow). Each verdict comes with a one-sentence rationale.

**O2 — Max Amount:** This is where I separate 'what the bank will give you' from 'what you should actually take.' The Lender Sanction Limit is the mathematical maximum. The Safe Carry Limit is 70% of that — because borrowing at your absolute ceiling leaves no room for emergencies.

**O3 — Fair Rate:** A rate band, not a single number — because negotiation happens in ranges. Plus the all-in APR including processing fees and GST, which is the true cost of borrowing.

**O4 — EMI Ceiling:** The maximum monthly outflow, paired with a stress test that simulates a 20% income drop. For Priya and Ravi, the stress test shows 'Dangerous' — their EMI burden exceeds 50% of reduced income. For Anita, it's 'Manageable' — her conservative FOIR limit of 35% actually protects her.

The **Negotiation Card** ties it all together — profile summary, target numbers, and 3–5 specific talking points. It has a print button that uses CSS `@media print` to isolate just the card for a clean single-page printout. The borrower walks into the branch with this card."

---

## [4:00–4:45] Design & UX Decisions

"On the design side, I went for an editorial fintech aesthetic — light cream backgrounds, deep plum accents, serif headings, and monospace fonts for all currency figures. The monospace font for money is a deliberate choice: it aligns numbers visually and signals precision.

The wizard is adaptive — if you select 'Self-Employed,' additional fields for ITR and collateral slide in. If you select 'Salaried,' those fields don't exist. The Confidence Meter gamifies data collection: as you answer more optional questions, the meter fills from red to green, encouraging users to provide more data for a better assessment."

---

## [4:45–5:00] Future Plans — Node.js Backend

"Right now, this is a pure frontend app — all calculations run in the browser, no server. That's intentional for a self-assessment tool: your financial data never leaves your device.

But the next step is a **Node.js backend with Express**. The plan is:
- An API endpoint that accepts borrower inputs and returns the same `LoanResult` — reusing `loanEngine.ts` on the server.
- A MongoDB database to save assessments against user accounts, so borrowers can track how their eligibility changes over time.
- Integration with live MCLR rates from RBI APIs, so base rates auto-update instead of being hardcoded.
- A lender comparison layer that pulls real offers from partner banks and compares them against our fair rate band.

The architecture I chose — pure domain functions, custom hooks, no heavy state library — makes this transition straightforward. The domain engine is server-ready today. I just need to wrap it in an Express route and add a database. That's the MERN stack coming full circle."

---

## Closing

"Borrower Copilot turns an opaque, intimidating process — walking into a bank and accepting whatever terms are quoted — into an informed, data-driven decision. Three personas, from a salaried tech worker in Bengaluru to an informal tailor in Hubballi, can all use the same tool and walk away knowing exactly what they should borrow, at what rate, and what to say when the lender pushes back. Thank you."
