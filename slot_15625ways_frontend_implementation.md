# Slot 15,625 Ways Frontend Implementation Plan

## 1. Architecture Overview
The current `web-sdk` frontend is built using Svelte as its main UI framework, incorporating Spine animations (`SpineSlot`, `SymbolSpine`, etc.) and basic Sprites for rendering game assets into a Canvas or DOM-based board. State is managed via internal contexts and xstate (or Svelte reactive stores like `stateGame.svelte.ts` and `stateLayout.ts`). 
The game handles spin cycles via a centralized engine that receives data from the `math-sdk`. Win animations are driven by the `Win.svelte` component, mapping spine IDs dynamically. Features are triggered primarily through predefined book events (or from `math-sdk` runtime outcomes), triggering Free Spins or base game animations based on the `game_config.py` in the math repository.

## 2. Current vs New Game Comparison

| Property | Old Game (`0_0_ways`) | New Game (`2_0_tbd_15625ways`) |
| -------- | -------- | -------- |
| Reels    | 5        | 6        |
| Rows     | 3        | 5        |
| Ways     | 243      | 15625    |
| Features | Free Spins | Free Spins, Hold & Spin, Jackpots |

## 3. Required Frontend Changes
* **Grid Resize:** The game board (`INITIAL_BOARD` in `constants.ts`) needs to be expanded from a `5×3` visible grid (`5×5` padded) to a `6×5` visible grid (`6×7` padded).
* **Ways Engine Expansion:** Svelte layout logic must dynamically scale the 30 symbols to fit the `BOARD_SIZES`. Reel fall speed, padding multipliers, and ways highlights need tweaks to accommodate more symbols.
* **Hold & Spin Feature Implementation:** Introduce a new "Hold & Spin" state to the internal engine (`stateGame`) parsing `holdnspin_money_prob` and jackpot triggers from the new Math SDK endpoints.
* **Symbol Set Updates:** Implement the "Money" symbol with multiplier mappings (`L5` mapped to `M` temporarily, but requires formalizing asset linkage) and connect jackpots (`MINI`, `MINOR`, `MAJOR`, `GRAND`).
* **Enhanced Free Spins:** Add the multiplier progression per respin (+1 per round during FS Hold & Spin) alongside the 5% chance of a completely wild reel.

## 4. File-Level Change Plan

* **`src/game/config.ts`**
  * *Current:* `gameID: '0_0_ways'`, `numReels: 5`, `numRows: [3, 3, 3, 3, 3]`.
  * *Update:* `gameID: '2_0_tbd_15625ways'`, `numReels: 6`, `numRows: [5, 5, 5, 5, 5, 5]`. Update symbol dictionary to include Money (M), and rename `L`-`H` placeholders as needed matching the math paytable.

* **`src/game/constants.ts`**
  * *Current:* `INITIAL_BOARD` maps 5 reels, 5 rows (3 visible).
  * *Update:* Expand to 6 reels, 7 rows (5 visible). Update `BOARD_DIMENSIONS` to `{ x: 6, y: 5 }`. Scale `SYMBOL_SIZE` or `BOARD_SIZES` multipliers for responsive fitting. Include `M` in `INITIAL_SYMBOL_STATE` dictionaries.

* **`src/components/Board.svelte` & `BoardContainer.svelte`**
  * *Current:* Fixed or slightly scalable logic tailored for 15 symbols.
  * *Update:* Adjust CSS grid ratios to `repeat(6, 1fr)` and ensure 30 visible symbols do not overlap or bleed out of `BoardFrame.svelte`.

* **`src/game/stateGame.svelte.ts` (State Manager)**
  * *Current:* Handles base game and Free Spin triggers via `updateFreeSpin`.
  * *Update:* Add `holdnspin` state definitions (`holdnspin_trigger_count: 6`, `holdnspin_initial_respins: 3`) and intercept jackpot awards.

## 5. Folder Structure
```
web-sdk/apps/
  ways/                (Legacy 5x3 implementation unharmed)
  ways_15625/          (New implementation)
    src/
      components/      (Board, Symbol variants, Feature UIs)
        features/      (NEW: HoldAndSpin.svelte, JackpotOverlay.svelte)
      game/            (config.ts, constants.ts, state handlers)
      stories/         (Data maps for testing)
```

## 6. Math SDK Verification Report
**Verified from `math-sdk/games/2_0_tbd_15625ways/game_config.py`**
* **Confirmation:** Fully supports 6 Reels × 5 Rows (15,625 Ways).
* **Features verified:** Free Spins supported (3-5 scatters), Hold & Spin trigger (6+ money symbols), 3 respins logic exists.
* **Jackpots:** Fixed multi-level jackpots (20x, 50x, 200x, 1000x GRAND) verified. Grand triggers natively if total positions equal 30. RTP distribution verified at 96% configuration.
* **Missing Features / Compatibility Concerns:** The math config relies on base events parsed as `basegame`, `freegame`, and `holdnspin`. The `web-sdk` `ways` frontend natively uses `ModeBaseBookEvent` and `ModeBonusBookEvent` but currently has NO handlers for extracting the `holdnspin` mode or jackpot injections from the bet mode quota parsing yet.

## 7. Asset Audit
* **Reused Assets:**
  * Low Symbols: `10, J, Q, K, A` (Reusability viable via `L1-L4` placeholders, missing 5th low symbol).
  * Feature FX: Explosions (`explosion.spine`), generic Win coins (`WinCoins.svelte`).
* **Missing Icons (Require New Assets):**
  * Mid Symbols: Lantern, Helmet, Pickaxe, TNT Barrel.
  * High Symbols: Gold Cart, Diamond Cluster, Drill Machine.
  * Special Symbols:
    * `W` - Explosive Charge (Currently using `explodedW` default).
    * `S` - Mine Entrance Gate.
    * `M` - Gold Nugget (Currently mapped to small text `L5`).
* **Specs Needed:** Request Spine exports + `.webp` statics for symbols above framed accurately for `120x120` relative scale rendering.

## 8. Edge Cases
* **Full Grid Jackpot Overlap:** 30 visible Money symbols trigger the GRAND jackpot. The frontend requires a deferred render block to highlight the full board simultaneously before incrementing the `WinCoins` balance.
* **Hold & Spin within Free Spins:** A trigger inside Free Spins must temporarily pause the Free Spin counter UI and overlay the Hold & Spin phase, resuming smoothly once respins hit 0. 
* **Feature Multipliers:** Tracking and explicitly rendering `+1` multi per respin cycle on the UI explicitly inside Free Spins. 
* **Large UI Scaling:** Displaying 30 symbols + win lines on portrait mode (`PORTRAIT_MAIN_SIZES` = 1422 height). Canvas could blur on dense clusters. 

## 9. Testing Checklist
- [ ] **Base Spins:** Grid populates 30 distinct instances reliably.
- [ ] **Wins:** 15,625 Ways validation — min 3 adjacent symbols pay correctly.
- [ ] **Scatters:** 3, 4, and 5 scatters trigger respectively 10, 15, 20 Free Spins.
- [ ] **Hold & Spin:** Pauses base flow exactly when 6+ initial Money symbols land hook respins logic. Respins reset up to 3 when new 'M' symbol hits.
- [ ] **Jackpots:** Verify MINI, MINOR, MAJOR overlay popups. Force full board array test string from Python test client to verify GRAND jackpot.
- [ ] **Free Spins:** Run full FS iterations confirming Money symbol constraints (minimum 2x) & +1 per respin multiplier tests.
- [ ] **UI Scaling:** Test vertical vs landscape canvas bounds (`BACKGROUND_RATIO`) on responsive wrapper resizes.
