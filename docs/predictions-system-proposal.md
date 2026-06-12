# Pulse90 Predictions System — Proposal

**Scope rule:** every prediction is computed only from data already inside the Supabase project
(`pqfdzelkucqdobyturfv`). No odds feeds, no injury news, no external APIs. What the database
doesn't know, the system says it doesn't know.

**Voice rule:** calm analyst. Probability language only — "projected chance," "model lean,"
"confidence level." Never "lock," "guaranteed," "sure win," "free money," "risk-free."

---

## 1. What the database gives us

| Asset | Table(s) | Rows | Use |
|---|---|---|---|
| Tournament + 72 group fixtures | `tournaments`, `fixtures`, `fixture_cards_view` | 1 / 72 | The prediction surface — every fixture gets a prediction card |
| 48 teams + groups | `teams`, `standings` | 48 | Identity, group context |
| Historical results | `team_history_matches` | 1,660 | Team strength ratings (Elo) + attack/defense rates (Poisson) |
| Historical goals | `team_history_goals` | 2,715 | Scoring-rate detail (penalties, minutes) |
| Tournament pedigree | `team_history` | 48 | Appearances, titles, best finish — secondary signal |
| Players | `players` | 1,248 | Roster context, key-player flags (display only in v1) |
| Form view | `team_form_summary_view` | computed | Recent W/D/L + goals — feeds confidence + rationale |
| Prediction store | `predictions` | 0 (ready) | Versioned, append-only output — already has `model_version`, `valid_from`, `valid_until`, `probability`, `rationale`, `movement_label/value` |
| Audit trail | `job_runs`, `source_snapshots`, `updates` | small | Provenance and run logging |

**Empty for now (design for, don't depend on):** `match_events`, `team_lineups`,
`team_recent_matches`, `teams.current_rank` (all null), live scores. No betting-market data
exists anywhere in the DB — and the product will say so explicitly.

---

## 2. Products

### P1 — Match Prediction (core)
One prediction card per fixture in `fixtures` (all 72 group matches at launch; knockout
fixtures as they populate). Three outcome probabilities (home / draw / away) plus an
expected-goals lean.

### P2 — Group Outlook
Monte Carlo simulation of each group (10,000 runs) using P1's match probabilities →
per-team **projected chance to advance** and projected finishing position. Surfaces through
the existing `live_group_projection_view` pattern.

### P3 — Daily Slate
The fixture list (`fixture_cards_view`, ordered by `starts_at`) with each match's model lean
inline. This is the "list of all fixtures" entry point — predictions are attached to the
schedule, not the other way around.

**Deliberately out of v1** (data isn't in the DB to do it honestly):
- Player props / top-scorer markets — `players` has no per-player stats; historical scorer
  names in `team_history_goals` aren't reliably linked to current rosters.
- Live in-match win probability — `match_events` is empty until a live pipeline exists.
- Anything priced against odds — there are no odds in the database.

---

## 3. Model (all inputs from the DB)

Two simple, explainable components — no black box:

1. **Elo ratings** built by replaying `team_history_matches` chronologically.
   - K-factor weighted by competition (`World Cup` > qualifier > `Friendly`) and recency decay.
   - Teams with few tracked matches get a wide-uncertainty prior, not a fake-precise rating.
2. **Poisson goal model** from per-team attack/defense rates in the same table
   (goals for/against per match, opponent-adjusted by Elo).
   - Produces a full scoreline distribution → collapse to home/draw/away probabilities and
     expected goals. Draw probability comes out naturally (crucial for group stage).

P2 = run P1's probabilities through 10k group simulations with the official tiebreak rules
(points → GD → goals for), seeded so runs are reproducible.

**Confidence level** is not the same as the win probability. It's a data-coverage grade:

| Level | Criteria |
|---|---|
| Higher | Both teams ≥ 25 tracked matches, ≥ 5 in last 18 months, head-to-head sample exists |
| Moderate | Both teams ≥ 10 tracked matches |
| Lower | Either team < 10 tracked matches, or no recent data — card says exactly why |

A 70% favorite can still be a *Lower confidence* call if one team barely appears in
`team_history_matches`. The card states that plainly.

---

## 4. Output contract (every prediction card)

Stored in `predictions` + rendered in this fixed order:

1. **Projected outcome** — "Model lean: Mexico, projected chance 54% (draw 24%, South Africa 22%)" *(illustrative numbers — real values come from the model run)*
2. **Confidence level** — Higher / Moderate / Lower, with the data-coverage reason
3. **Key supporting factors** — 2–4 bullets pulled from real rows: Elo gap, recent form from `team_form_summary_view`, head-to-head from `team_history_matches`, tournament pedigree from `team_history`
4. **Main risks / missing data** — always present; v1 always includes: "No lineup, injury, or live-market data is in our dataset. A late team-news change can move this materially." Plus match-specific gaps (e.g., "South Africa has only 8 tracked matches").
5. **Responsible-use note** — fixed footer: "Probabilistic analysis for information only — not betting or financial advice. Outcomes are uncertain and can change with injuries, lineups, weather, or coaching decisions. If you choose to bet, follow your local laws and only risk what you can afford to lose."

---

## 5. Trust mechanics (mapped to existing schema)

| Trust rule | Implementation |
|---|---|
| No silent edits / version history | `predictions` is **append-only**. A revised view = new row with new `model_version` + `valid_from`; the old row gets `valid_until` set. UI shows "Updated — see previous version." `movement_label`/`movement_value` display the shift ("Mexico lean +3 pts since yesterday"). |
| Auditable | Every batch run logs to `job_runs` (records read/changed, duration, errors). Input snapshots hash into `source_snapshots`. |
| No cherry-picking | Public **Track Record** page: after `fixtures.status` goes final, every prediction is graded automatically (hit/miss + Brier score per `model_version`). Losses render identically to wins. The grading query is just `predictions ⋈ fixtures` — nothing can be hidden because nothing is deleted. |
| Disclosure | Fixed methodology page: "Inputs: historical match results and tournament records in our database. Not used: betting odds, sponsor input, injury reports, lineups." `predictions.source` records the generating pipeline. |
| No manipulative UX | No streak counters, no "last chance" timers, no loss-chasing prompts, no push notifications urging action. Calm typography; probabilities always shown with the counter-case ("46% of the time, Mexico doesn't win this"). |

---

## 6. Legal / safety guardrails

- Every page with predictions carries the responsible-use footer (§4.5) and an
  18+/21+ jurisdictional notice if any betting context is ever introduced.
- No deposit links, no affiliate odds links in v1. If affiliates are ever added, the
  disclosure rule in §5 requires labeling them on the prediction card itself.
- Geo-sensitive: betting legality varies by state/country; the product is informational,
  but **a compliance/legal review is recommended before public launch**, especially given
  US host-market gambling regulations.
- Copy bans the words: guaranteed, lock, sure win, free money, risk-free (lint check in CI).

---

## 7. Pipeline & rollout

**Phase 1 (now — group stage):**
1. `compute_ratings` job: replay `team_history_matches` → Elo + Poisson rates (cached table or materialized view).
2. `generate_predictions` job: one row per upcoming fixture per run; re-run daily and on data change (new history rows, fixture reschedule). Log to `job_runs`.
3. `simulate_groups` job: 10k runs → advancement probabilities.
4. UI: Daily Slate + Match Card + Group Outlook + Methodology page.

**Phase 2 (as tables fill):** lineups land in `team_lineups` → lineup-aware confidence bumps;
`match_events` flows → live re-rating between group rounds; knockout fixtures → bracket
path simulation via `team_path_view`.

**Phase 3 (post-group):** Track Record page goes from empty to load-bearing — 72 graded
predictions and a published Brier score before the round of 32 begins. That's the trust moment:
the model's honesty gets demonstrated, not asserted.

---

## 8. What we will say we can't do

Printed on the methodology page, verbatim spirit:

> Our dataset contains match results and tournament records. It does not contain injuries,
> suspensions, confirmed lineups, weather, referee assignments, or betting-market prices.
> Our probabilities are a starting point built from historical performance — they cannot
> react to news our database hasn't seen. Sports outcomes are genuinely uncertain; treat
> every number here as an estimate, never a promise.
