# 05. Big numbers

Status: recommended, Phase 0. Owner: Engine Architect.

## The problem

Costs climb geometrically, so the game leaves ordinary number range quickly. A JavaScript number tops out near 1.8e308 and silently becomes `Infinity` past it. The bible's own model already gets there: a floor at level 6,000 with 1.15 cost growth needs 1.15^6000, which is about 1.5e364. Checked in the build session: the native calculation returns `Infinity`.

The brief's requirement: big numbers never overflow or lose precision, and the formatter is consistent everywhere.

## Decision

Use **break_infinity.js** (MIT, the long-standing standard for incremental games) and hide it behind our own `Num` module in the core. Gameplay code imports `Num` and never the library.

- Representation: a mantissa (a double between 1 and 10) and a power-of-ten exponent. About 16 significant digits at any size.
- Range: up to about 1e(9e15). Checked: 1.15^6000 gives 1.538e364.
- Speed: one million multiply-and-add pairs took 109 ms in the build session. The game does a few thousand per frame.
- The wrapper means that if a future reset layer ever needs numbers beyond that range, we swap in break_eternity.js in one file.

## Which values are big numbers and which are not

This rule is what "never lose precision" means in practice.

| Kind of value | Type | Why |
|---|---|---|
| World currencies (Coins, Notes and the rest), payouts, costs, income rates, lifetime earnings, multiplier products, Compost and Ribbons | `Num` | They grow without bound. 16 significant digits is far more than is ever shown |
| Levels, counts, card copies, chest counts, pity counters, quest progress, gems and other small spendable currencies | integer | They must be exact to the unit. Integers are exact up to 9 quadrillion |
| Probabilities, cycle seconds, small multipliers in tables | plain number | Small and bounded |
| Time | integer milliseconds | Exact |

A consequence players never see but code must respect: adding 1 to 1e30 changes nothing (checked: true). So nothing that needs unit accuracy is ever stored as a `Num`, and no rule may depend on a large `Num` changing by a small amount.

## Rules for gameplay code

1. **Compare with methods, never with operators.** `coins.gte(cost)`, not `>=`.
2. **Check before subtracting.** A purchase is `if (coins.gte(cost)) coins = coins.sub(cost)`. Checked over 200,000 random cases: when `a >= b`, `a - b` is never negative, and `a - a` is exactly zero.
3. **Bulk purchases use closed forms, then verify.** Cost of `k` levels from level `n` is `base * g^n * (g^k - 1) / (g - 1)`. The most levels affordable is `floor(log_g(1 + coins * (g - 1) / (base * g^n)))`. Because logarithms round, the result is then confirmed against the cost formula and stepped down or up by one if needed. Checked against a buy-one-at-a-time loop in 3,000 random cases with no mismatches.
4. **Use `Num.pow` for any growth curve.** `Math.pow` overflows silently, as above.
5. **Apply income in one step per source per tick** (rate times elapsed time), not as many tiny additions.
6. **No `Num` is ever NaN or infinite.** Development and test builds check every result and fail loudly. Release builds refuse to save a non-finite value and keep the last good save.

## Saving numbers

`Num` values are written as a string of the exact mantissa and exponent, for example `"1.2345678901234567e345"`, using our own writer and reader.

This is deliberate. Checked in the build session: the library's own text conversion did not return the identical value in 114 of 100,000 random round trips, while writing the mantissa and exponent explicitly returned the identical value every time. A property test in the core holds this.

Integers are saved as plain JSON numbers.

## Formatting

One formatter, in the core, used by every label, tooltip, popup, the simulator's reports and the content report. Nothing else may turn a number into text.

**Notations** (player setting):

| Notation | 12,345,678 | 1.5e45 |
|---|---|---|
| Short (default proposal) | 12.3M | 1.50QaDc |
| Long | 12.3 Million | 1.50 Quattuordecillion |
| Scientific | 1.23e7 | 1.50e45 |
| Engineering | 12.3e6 | 1.50e45 |

Short and long names follow the standard short-scale naming and are generated, not typed, so they cannot have gaps. Past the last named size the short notation falls back to scientific. The UI designer picks the default and the size at which short names give way to scientific. More notations (for example letter suffixes) are additions to this one module.

**Fixed rules**

- Three significant digits once abbreviated: `1.23M`, `12.3M`, `123M`. The text width stays steady, so counters do not jitter.
- Below one million, whole numbers with thousands separators. A currency may declare decimals below 1,000 (`49.31`).
- **What you have rounds down; what something costs rounds up.** The display can therefore never show that you can afford something you cannot. Whether a button is enabled is always decided by the exact comparison, never by the text.
- Rates (`per second`) and multipliers (`x3.5`) have their own small formats in the same module, as do durations (`2h 14m`).
- Output does not depend on the PC's regional settings.

Counters that count up do so in the presentation layer only, easing toward the true value (in log space when the gap spans orders of magnitude). The stored value is never animated.

## Simulator and game agreement

Both run the same `Num` code on the same JavaScript engine family (V8 in Node and in Electron), so results match. Tests that involve logarithms or powers compare with a tiny tolerance rather than bit equality, in case engine versions ever differ in the last digit.

## Tests

- Property tests against exact integer arithmetic for add, subtract, multiply, divide, power, logarithm and comparison across the range.
- Save round trip is bit-exact for random values.
- Bulk-buy cost and max-affordable against the one-at-a-time loop.
- Formatter golden tables for every notation, including boundaries (999, 999,999, each suffix change) and the round-down and round-up rules.
- A soak test that runs the economy to extreme sizes and asserts that no value is ever NaN or infinite.
