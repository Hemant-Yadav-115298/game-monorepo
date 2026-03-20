# Math SDK Report — 2_0_tbd_15625ways vs 0_0_ways

## 1) Game Geometry & Ways Calculation
- **Old Game (`0_0_ways`):**
  - **Reels:** 5
  - **Rows:** 3 visible per reel, padded to 5 internally (1 row above/below).
  - **Ways:** $3 \times 3 \times 3 \times 3 \times 3 = 243$ ways.
- **New Game (`2_0_tbd_15625ways`):**
  - **Reels:** 6
  - **Rows:** 5 visible per reel, padded to 7 internally (1 row above/below).
  - **Ways:** $5 \times 5 \times 5 \times 5 \times 5 \times 5 = 15,625$ ways.
- **Implementation Impact:** The frontend must generate a `6x7` padded state in memory, slice it to `6x5` for rendering, and scale symbols down to fit the target screen space. Ways win evaluation now requires scanning up to 6 reels horizontally with 5 vertical possibilities per reel.

## 2) Symbol Definitions & Paytable Structure
- **Old Game:**
  - Aliases: `H1`–`H5` (High), `L1`–`L4` (Low), `W` (Wild), `S` (Scatter).
  - Sparse paytable configuration tuned for 5-reel validation.
- **New Game:**
  - **High:** `DRI` (Drill), `DIA` (Diamond), `GCA` (Gold Cart). Example: `DRI` pays 15x for 6OAK.
  - **Mid:** `TNT`, `PIC` (Pickaxe), `HEL` (Helmet), `LAN` (Lantern). Up to 4x for 6OAK.
  - **Low:** `A`, `K`, `Q`, `J`, `10`. Up to 2x for 6OAK.
  - **Special:** `W` (Wild) appears only on reels 2–4; `S` (Scatter) pays anywhere; `M` (Money) carries a numerical `prize` or `jackpot` Boolean flag and numeric multiplier.
- **Implementation Impact:** The Web SDK's `SYMBOL_INFO_MAP` must map `DRI`/`DIA`/`GCA` explicitly to final spine/sprite keys. Fallback aliasing to old `H*` will look disjointed for the Mining theme.

## 3) Feature Logic Deep Dive
### a. Free Spins (FS)
- **Trigger:** 3, 4, or 5 Scatters award 10, 15, or 20 FS respectively in the base game.
- **Retrigger:** During FS, 3, 4, or 5 Scatters award 5, 10, or 15 additional FS.
- **FS Enhancements:**
  - **Money Values:** The minimum money symbol payload jumps from 1x to 2x.
  - **Wild Expansion:** 5% chance of a completely wild reel during FS.
  - **H&S Boost:** If Hold & Spin triggers *inside* FS, the multiplier grows by +1 after every respin cycle.

### b. Hold & Spin (H&S)
- **Trigger:** 6 or more `M` (Money) symbols block the reels (handled natively by the engine via `force_holdnspin=True` distributions where appropriate).
- **Respins:** Initialized to 3. Any new `M` landing resets respins to 3.
- **Positions:** Total grid tracks 30 valid positions ($6 \times 5$).
- **End State:** Ends when respins = 0, auto-tallying all embedded prizes.
- **Grand Mechanic:** If 30 `M` symbols span the grid, a `GRAND` jackpot is inherently injected to the payout loop upon ending.

### c. Fixed Jackpots
- Configured Values: `MINI` (20x), `MINOR` (50x), `MAJOR` (200x), `GRAND` (1000x).
- **RNG Weights:** From the math profile, jackpot extraction uses weight ratios `MINI`: 65, `MINOR`: 28, `MAJOR`: 7. `GRAND` is excluded from RNG generation inside individual cells (procedural generation via full grid).

## 4) RTP Profile & Buy Feature Configurations
- Target RTP globally assigned as 96% (`self.rtp = 0.96`).
- **Bet Modes (as declared in `game_config.py`):**
  - **`base`:** Standard 1.0 cost spin. Base math distribution weighting across freegame, holdnspin, and zero-win events. Base RTP contribution breakdown evaluates near Base(58%)/FS(20%)/H&S(15%)/Jackpot(3%).
  - **`bonus_fs` (Buy FS):** Cost 80.0. Forces `freegame=True`. Math heavily leverages the `FR0` (Free Reel 0) and `FRWCAP` (Free Reel Wild Cap) reels to satisfy FS pacing. Hold & Spin trigger probability inside the FS buy is tuned to `0.06`.
  - **`bonus_hns` (Buy H&S):** Cost 100.0. Forces `holdnspin=True`. Operates on the `HR0` (Hold Reel 0) mapping, pushing `holdnspin_money_prob` up to `0.09` to satisfy the $100 EV buy feature curve.
- **Implementation Impact:** The Web SDK needs an UI toggle (e.g., jurisdictional Buy UI) feeding the `activeBetModeKey` via `stateBet` to transmit `bonus_fs` or `bonus_hns` requests cleanly.

## 5) Event Payload Contract (`game_events.py`)
The math output directly produces JSON hooks the frontend must parse cleanly in `bookEventHandlerMap.ts`.

- **`holdAndSpinTrigger`:**
  - Includes `totalRespins` (3), `moneyPositions` (array of row/reel dicts, zero-indexed but mathematically +1 padded logic handled by `include_padding=True`), `isFreeSpin` (boolean).
- **`holdAndSpinRespin`:**
  - Emitted per cycle. Carries `respinNumber`, `respinsRemaining`, the full 6x5 mapped `board` state with embedded `locked=True` and `prize=X`, and `newMoneyPositions` for isolated drop animations. Includes the running `multiplier` scalar.
- **`holdAndSpinEnd`:**
  - Carries aggregate `totalWin` (multiplied), `finalMultiplier`, and optionally strings for the `jackpot`.
- **`jackpotAwarded`:**
  - Emitted separately when a jackpot triggers outside of the end-tally. Carries `jackpotType` (e.g., `"MAJOR"`) and `jackpotValue` (cents).
- **`moneySymbolReveal`:**
  - Hook for individual coin flips (e.g., "Rock Cracks open to reveal 10x"). Carries `position`, `prizeValue`, and `isJackpot` boolean flag.

## 6) Reels Mapping & Padding Protocol
- Math operates using `.csv` configurations: `BR0` (Base), `FR0` (Free), `FRWCAP` (Free Wild Capped), `HR0` (Hold).
- The `include_padding = True` directive means Python pre-calculates the off-screen rows. When the backend sends event coordinates (e.g., `row: 2`), it already accounts for the +1 offset internally against the 7-row physical array bounds. The frontend strictly shouldn't apply *double* padding transformations over RGS coordinates inside mapping scopes—only for rendering layers.

## 7) Deterministic Books & Lookup Tables
- Present in `publish_files/books_base.jsonl.zst`, `books_bonus_fs.jsonl.zst`, etc.
- Support logic is completely serialized. Any debugging on the frontend can be run locally using the `mock-rgs` pointing to `.zst` lookups if the backend server is dead.

## 8) Detailed Tuning Constraints (`game_config.py` metrics)
- Base `holdnspin_money_prob`: `0.04`. Generates ~0.96 new money symbols on average over a 24-gap 6x5 grid per respin. Adjustments down from `0.10` in legacy prototypes stabilize the H&S magnitude win scale.
- Base `money_jackpot_prob`: Reduced from `0.5%` to `0.3%` to govern jackpot RTP leakage.
- Max Win Cap: Enforced globally at `5,000x` across `base`, `bonus_fs`, and `bonus_hns`. Math clamps outcomes automatically via wincap override distributions.

## 9) Compatibility Checklist vs 0_0 Base
| System | Required Web SDK Change |
| :--- | :--- |
| **Grid Engine** | Override `BOARD_DIMENSIONS` to x:6, y:5; support 30 nodes rendering. |
| **Win Presentation** | Map `DRI`/`DIA`/`GCA` in `winLevelMap` overrides. Ensure 6th reel explosion/wins track offsets cleanly. |
| **Feature UI** | Inject standard state wrappers (Iron Frame `Sprite`, `BitmapText` counter) connected via `eventEmitter`. |
| **Buy Menu** | Send bet context `{ mode: 'bonus_fs', cost: 80x }` or `{ mode: 'bonus_hns', cost: 100x }` for instant triggers. |
| **Jackpots** | Interpret `jackpotAwarded` and block subsequent UI flow with the `JackpotCelebration` wrapper until timeout. |

## 10) QA Integration Matrix (Test Assertions)
1. **6x5 Board Scaling:** Launch browser, open dev tools (Mobile/Portrait scaling). Assert reels 1 through 6 stay inside canvas boundaries without overlapping bounding boxes.
2. **Scatter Chains:** Force `[S, S, S, *, S, S]` drop. Assert `Total Free Spins = 20`. Verify `jng_intro_fs` sound fires globally.
3. **Hold & Spin Persistence:** Trigger H&S. Wait 1 respin. Assert `rawSymbol.locked === true` for initial trigger positions doesn't flicker/reset during subsequent spin cascades.
4. **Respin Reset:** Drop new `M`. Assert Respins counter snaps exactly to `3` without jumping via tween visual bugs.
5. **Grand Validation:** Send 30 `M` string force drop in REPL. Assert engine fires `holdAndSpinEnd` payload bearing exactly the `{ jackpot: 'GRAND' }` descriptor.
6. **Buy FS Route:** Select Buy FS -> Start. Assert `activeBetModeKey === 'bonus_fs'`. Assert Game flow skips normal scatter delay and transitions straight to Free Spins overlay.
