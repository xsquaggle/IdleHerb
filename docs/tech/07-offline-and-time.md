# 07. Offline earnings and time

Status: recommended, Phase 0. Owner: Engine Architect. Implemented in Phase 1 by the Save and Offline programmer.

## What "the system clock can't break it" means here

Guaranteed:

1. **No clock value can damage the game.** A clock set to 1970, to 2099, moved backwards, or changed while playing never produces negative time, a frozen timer, a stuck daily quest, a crash or a corrupted save.
2. **Changing the clock while the game is running does nothing.** Live play is timed by a clock that only counts up and cannot be set.
3. **Time away is paid once, and is bounded.** However far the clock says you were gone, earnings are capped by the offline cap (a design number, hours not years).
4. **Setting the clock back never costs progress.** You get whatever time provably passed, timers carry on, and nothing is locked.
5. **Thirty days away is settled instantly**, by formula, with a clear report.

Not guaranteed, and said plainly: a player who deliberately moves their PC clock forward before each launch can collect up to one offline cap of earnings per launch. Stopping that completely needs a trusted clock, which means a server or an internet time check. For a free, single-player, offline game that is out of proportion, and version 1 makes no network requests at all. Two optional hardenings are listed at the end if it ever matters.

## Three clocks

| Clock | Source | Trusted for |
|---|---|---|
| Monotonic | The browser's high-resolution timer | All live play. It cannot be set by the user. Only meaningful while the game is running |
| Wall | The system date and time | A claim about how long the game was closed. Checked and clamped before use |
| Uptime | Time since Windows started, read by the shell | A floor under the claim: time that provably passed even if the wall clock says otherwise |

The core never reads any of them. The app layer reads them, runs the checks below, and hands the core a duration.

## Game time

Everything inside the simulation runs on **game time**: the running total of durations the core has been given. Buffs, cooldowns, research and expeditions store time remaining in game time. They are never stored as a date, so no clock change can reach them.

## Live play

Each frame the app passes the monotonic time since the last frame to `tick`. The maths is exact for any step size (see 02), so a stutter or a dragged window changes nothing.

A gap longer than 60 seconds (the PC slept, the window was hidden) is not treated as a long frame. It goes through the same return path as a fresh launch, below. That keeps the rules identical however the time passed, and stops a long sleep from spawning an hour of random events at once.

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

`away` drives timers and counters. Earnings use `min(away, offline cap)`, where the offline cap is a stat the design can raise through upgrades.

## Calendar features

Daily and weekly quests need a calendar, so they use a guarded day counter rather than raw dates.

```
day = local calendar day number from the wall clock
if day > time.day:            new daily set; time.day = day
else if day < time.day - 1:   time.day = day       // clock moved far back: re-anchor, no new set
// otherwise: same day, or a small step back such as a time-zone change. Nothing happens.
```

Moving the clock back never grants a new daily set by itself, and a clock that was once wildly ahead cannot strand the player until that future date arrives: the counter re-anchors and the next reset is the next real midnight. Daylight saving changes only move the boundary by an hour. Like offline earnings, dailies can still be hurried by someone who keeps pushing the clock forward; that is the accepted limit described above.

## Computing time away

`fastForward` does not loop over ticks. It works by formula, so thirty days costs the same as thirty seconds.

1. Find every timer that will end inside the span (a buff expiring, research finishing) and sort those moments. They split the span into segments in which all multipliers are constant.
2. For each segment, for each floor:
   - automated floor: `cycles = floor((progress + t) / cycleTime)`, income is `cycles x payout x offline multipliers`, and the remainder carries over as progress
   - floor with no manager: finishes its current cycle and waits, exactly as it would on screen
3. At each boundary apply what ended or completed, then continue.
4. Advance all timers by the full time away. Earnings segments stop at the offline cap.
5. Random events (golden sprouts, frenzies) do not occur while away.
6. Return an `OfflineReport`: time away, time that counted, earnings per currency and per floor, what completed, and whether the cap was reached. The welcome-back screen is built from it.

If the design adds automation that buys things while away, the same segmenting applies with purchases as extra boundaries, limited to a fixed maximum number of segments so the cost stays bounded.

Budget: a 30-day return in under 50 ms.

## What happens when

| Situation | Result |
|---|---|
| Closed for 1 minute, 8 hours, 30 days | Paid for the time away up to the offline cap. Timers advance by the full time. Report shown |
| Closed for a year | Treated as 30 days for timers; earnings at the cap |
| Clock moved forward while the game is closed | Treated as time away: at most one offline cap of earnings. Logged as an anomaly if beyond 30 days |
| Clock moved back while the game is closed | Paid for the time that provably passed (often zero). Nothing lost, nothing locked |
| Clock changed while playing | No effect |
| PC sleeps with the game open | On wake, settled as time away for the real duration |
| Game minimised or hidden for an hour | Same |
| Daylight saving change, time-zone travel | Daily reset boundary shifts; no double reset, no missed reset beyond a day |
| Dead clock battery (date resets to years ago, later corrected) | First launch pays proven time and dailies re-anchor. The launch after the correction is treated as a long absence: earnings at the cap, once |
| Save moved to another PC | Wall-clock difference is used, within the same bounds |

## Tests

- Catch-up of 1 minute, 8 hours and 30 days: result equals stepping the live simulation second by second over the same span, within a tiny tolerance. This proves offline and online play follow the same rules.
- Catch-up cost: 30 days under the time budget.
- Clock set back a day, back ten years, forward ten years, to 1970, to 2099: no negative durations, no NaN, state valid, timers sane, dailies behave as in the table.
- Clock changed during a simulated session: earnings unchanged.
- Sleep and resume gap: handled by the return path, no burst of random events.
- Daylight saving and time-zone changes around midnight.
- Random sequences of clock values (property test): earnings never exceed the cap per return and game time never decreases.
- The balance simulator's idle play style uses the same `fastForward`, so its pacing charts are produced by the shipped offline code.

## Optional hardening, not in version 1

Neither is needed for the guarantees above. Both must fail open, so an honest player is never penalised.

1. **Boot check.** If Windows exposes a reliable "this is the same boot as last time" signal (to be confirmed in a short spike on a real PC), then when it is unchanged since the save the uptime difference is the exact time away and any clock change can be ignored. This would close clock-forward cheating without a restart, with no network.
2. **Internet time.** When online, compare the wall clock with the date from a well-known web server. This would be the game's only network request and would be a visible setting.
