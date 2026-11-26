# 07. Offline earnings and time

Status: recommended, Phase 0. Owner: Engine Architect. Implemented in Phase 1 by the Save and Offline programmer. Brought in line with design version 0.2 on 2026-11-26.

The design says what time away is worth (GDD 15.1) and how the game must behave when the clock is changed (the five rules of GDD 15.2). This document is the mechanism behind both.

## What "the system clock can't break it" means here

Guaranteed:

1. **No clock value can damage the game.** A clock set to 1970, to 2099, moved backwards, or changed while playing never produces negative time, a frozen timer, a stuck daily quest, a crash or a corrupted save.
2. **Changing the clock while the game is running does nothing.** Live play is timed by a clock that only counts up and cannot be set.
3. **Time away is paid once, and is bounded.** However far the clock says you were gone, earnings stop at the stored hours the player has built up (4 hours to start, 36 at the very most).
4. **Setting the clock back never costs progress.** You get whatever time provably passed, timers carry on, and nothing is locked.
5. **Thirty days away is settled instantly**, by formula, with a clear report.

Not guaranteed, and said plainly: a player who deliberately moves their PC clock forward before each launch can collect up to one full store of offline earnings per launch. Stopping that completely needs a trusted clock, which means a server or an internet time check. For a free, single-player, offline game that is out of proportion, and version 1 makes no network requests at all. Two optional hardenings are listed at the end if it ever matters.

## Three clocks

| Clock | Source | Trusted for |
|---|---|---|
| Monotonic | The browser's high-resolution timer | All live play. It cannot be set by the user. Only meaningful while the game is running |
| Wall | The system date and time | A claim about how long the game was closed. Checked and clamped before use |
| Uptime | Time since Windows started, read by the shell | A floor under the claim: time that provably passed even if the wall clock says otherwise |

The core never reads any of them. The app layer reads them, runs the checks below, and hands the core a duration.

## Game time

Everything inside the simulation runs on **game time**: the running total of durations the core has been given. Boosts, cooldowns, research, bench jobs and Morning Baskets store time remaining in game time. They are never stored as a date, so no clock change can reach them.

## Live play

A simulation timer passes the monotonic time since its last step to `tick`. The maths is exact for any step size (see 02), so a stutter or a dragged window changes nothing.

**A game that is open is playing, even in the background.** While the window is unfocused, hidden or minimised, the timer keeps running and the game earns at the full online rate (GDD 15.1). Drawing slows or stops. Earning does not. Garden Visitors are the one thing that waits for the window to have focus (GDD 6.6).

**A stopped process is time away.** If the PC sleeps or hibernates, or the phone preview's browser tab is frozen, no steps arrive. The test is that steps stopped arriving: more than 2 minutes on the monotonic clock since the last step, or a suspend and resume signal from the shell. Either one sends the gap through the return path below and not through `tick`, which keeps the rules identical however the time passed.

**A jump on the wall clock alone is never time away.** If the wall clock leaps while steps keep arriving on time, that is someone changing the clock during play, and guarantee 2 says it does nothing. The wall clock is read only inside the return path, to size a gap that the monotonic clock or the shell has already shown. On a system that stops the monotonic clock during sleep and gives no signal, the sleep simply is not counted. That fails safe, and the Electron shell always gives the signal.

## Returning after time away

```
onReturn(now):
  wallDelta = now.wall - time.lastWall
  proven    = sameRun ? now.mono - time.lastMono
                      : (now.uptime >= time.lastUptime ? now.uptime - time.lastUptime
                                                       : now.uptime)        // 0 if uptime unknown
  away      = clamp(max(wallDelta, proven), 0, MAX_AWAY)                    // MAX_AWAY = 30 days
  if wallDelta < -2 min or wallDelta > MAX_AWAY: count an anomaly and log it
  time.lastWall, time.lastMono, time.lastUptime = now
  report = game.fastForward(away)
```

`proven` is a lower bound that the user cannot inflate. Within one run it is the monotonic clock. Across runs it comes from uptime: if the PC has not restarted, at least the difference in uptime has passed; if it has restarted, at least the new uptime has passed. So when a clock is corrected backwards, or a dead motherboard battery resets it to years ago, the player still receives the time that really went by.

This `away` is the `trustedNow - lastSeen` of GDD 15.1.

## What the time away is worth

`fastForward(away)` does two separate things, both from GDD 15.1.

**It advances everything that runs on time, by the whole of `away`:** research, bench jobs, ability cooldowns, Morning Basket timers, the customer queue in Loomington, the weather loop in Papaya Cay and Hearth Heat in Mount Mitten. Insight accrues for at most `INSIGHT_TANK_HOURS`. Timed boosts run out and add nothing.

**It pays earnings for the first `min(away, offline.cap)` of it:**

```
for each unlocked world:
    earned = steady income of its managed floors x offline efficiency x seconds in the window
             x that world's twist over the window
```

- `offline.cap` and offline efficiency are stats (see 02), so skills, research, plants, managers, heirlooms and the Compost Shop raise them exactly as GDD 13.4 says. Efficiency is capped at 1. The Night Market and Compound Interest multiply after that cap.
- Earnings use the steady rate. The Boost and Growth Spurts are never part of them (GDD 13.5 rule 8).
- A floor without a manager finishes the cycle it was on and waits.
- There are no visitors, taps, Combo or Spurts while away.
- **Morning Dew.** If `away` is at least `DEW_AWAY`, the player returns to a ×2 boost in every world for `dew.duration`.
- **The fair stall** earns by its own fixed rule, `FAIR_OFFLINE_EFF` for up to `FAIR_OFFLINE_CAP`, whatever the player's own offline stats are (GDD 15.3).
- **Time Warp** calls the earnings half alone, for 1 or 4 hours. It ignores the stored-hours cap and advances no timer, which is why the two halves are separate functions.
- Nothing is bought while away. The Auto-Gardener and Auto-Replant work only while the game is open (CONTENT.md 8).

## Calendar features

Daily and weekly quests and weekend events need a calendar, so they use a guarded day counter and never raw dates.

```
day = local calendar day number from the wall clock
if day > time.day:            new daily set; time.day = day
else if day < time.day - 1:   time.day = day       // clock moved far back: re-anchor, no new set
// otherwise: same day, or a small step back such as a time-zone change. Nothing happens.
```

Moving the clock back never grants a new daily set by itself, and a clock that was once wildly ahead cannot strand the player until that future date arrives: the counter re-anchors and the next reset is the next real midnight. Daylight saving changes only move the boundary by an hour.

The week (it starts on Monday) and the weekend event (Friday to Sunday, one of four by week number) are worked out from that same day number, so they inherit its guards. Morning Baskets are plain timers in game time, not calendar features.

Like offline earnings, dailies can still be hurried by someone who keeps pushing the clock forward. That is the accepted limit described above.

## Computing time away

`fastForward` does not loop over ticks. It works by formula, so thirty days costs the same as thirty seconds.

1. Find every moment inside the span at which a rate changes (a research project that raises profit finishing, Hearth Heat reaching its floor, the end of the earning window) and sort them. They split the span into segments in which every multiplier is constant or changes in a straight line.
2. For each segment inside the earning window, for each floor:
   - managed floor: `cycles = floor((progress + t) / cycleTime)`, income is `cycles x payout x offline efficiency`, and the remainder carries over as progress. This is the GDD's `floorIPS x efficiency x seconds` to within one harvest per floor, and it is exactly what the floor would have done on screen
   - floor with no manager: finishes its current cycle and waits
   - a chance on a harvest, such as a Bountiful double, is paid at its average. Only harvests the player can watch are rolled
3. Apply each world's twist in closed form (GDD 14.4):
   - **Customers:** the queue gains one every `CUSTOMER_INTERVAL` up to `CUSTOMER_QUEUE_CAP`. That is one division and a `min`
   - **Weather:** the loop position moves on by the whole of `away`. Earnings use the loop averages of GDD 14.4 for the whole loops inside the window and the exact weather for the part of a loop left over, so a five-minute absence and a five-day one are both right
   - **Hearth Heat:** falls in a straight line to its floor, so income over that stretch is the average of the multiplier at each end. Reaching the floor is a segment boundary
   - **Floating Harvests and Orbital Sunrise:** bubbles and orbits pay ×1 while away, which is ordinary income. The sunrise streak is kept
4. At each boundary apply what ended or completed, then continue.
5. Advance all timers by the full time away.
6. Return an `OfflineReport`: time away, time that counted, earnings for each world and floor, what completed, whether the store was full, and whether Morning Dew was earned. The Welcome Back screen and its basket are built from it.

Budget: a 30-day return in under 50 ms.

## What happens when

| Situation | Result |
|---|---|
| Closed for 1 minute, 8 hours, 30 days | Paid for the time away up to the stored hours. Timers advance by the full time. Report shown |
| Closed for a year | Treated as 30 days for timers. Earnings stop at the stored hours |
| Clock moved forward while the game is closed | Treated as time away: one capped return, as GDD 15.2 rule 4 allows. Logged as an anomaly if beyond 30 days |
| Clock moved back while the game is closed | Paid for the time that provably passed (often zero). Nothing lost, nothing locked |
| Clock changed while playing | No effect |
| Game minimised, hidden or behind another window for an hour | It kept playing at the full online rate. It is not time away |
| PC sleeps with the game open | On wake, settled as time away for the real duration |
| Daylight saving change, time-zone travel | Daily reset boundary shifts; no double reset, no missed reset beyond a day |
| Dead clock battery (date resets to years ago, later corrected) | First launch pays proven time and dailies re-anchor. The launch after the correction is treated as a long absence: one capped return |
| Save moved to another PC | Wall-clock difference is used, within the same bounds |

## Tests

- The five rules of GDD 15.2, one named test each.
- Catch-up of 1 minute, 8 hours and 30 days: the result equals stepping the same offline rules second by second over the same span, within a tiny tolerance. This proves the formulas and the stepped simulation follow the same rules.
- The same check in each world with a twist: a queue that fills, a weather loop caught mid-turn, Heat that reaches its floor inside the window.
- Earnings never exceed `offline.cap` hours of steady income, before the two multipliers that apply after the cap, whatever the stats and the clock.
- Catch-up cost: 30 days under the time budget.
- Clock set back a day, back ten years, forward ten years, to 1970, to 2099: no negative durations, no NaN, state valid, timers sane, dailies behave as in the table.
- Clock changed during a simulated session: earnings unchanged.
- An hour with the window hidden pays the same as an hour with it in front, apart from visitors.
- Sleep and resume gap: handled by the return path, no burst of random events.
- Daylight saving and time-zone changes around midnight, and a week boundary.
- Random sequences of clock values (property test): earnings never exceed the cap per return and game time never decreases.
- The balance simulator's idle play style uses the same `fastForward`, so its pacing charts are produced by the shipped offline code.

## Optional hardening, not in version 1

Neither is needed for the guarantees above. Both must fail open, so an honest player is never penalised.

1. **Boot check.** If Windows exposes a reliable "this is the same boot as last time" signal (to be confirmed in a short spike on a real PC), then when it is unchanged since the save the uptime difference is the exact time away and any clock change can be ignored. This would close clock-forward cheating without a restart, with no network.
2. **Internet time.** When online, compare the wall clock with the date from a well-known web server. This would be the game's only network request and would be a visible setting.
