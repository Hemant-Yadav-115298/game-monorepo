# Slot 15,625 Ways Frontend Implementation Plan

## 1. Architecture Overview
- **Math → frontend contract:** Math emits book events (reveal, wins, free spin triggers, hold & spin triggers, jackpots) that the Svelte client consumes through `playBookEvents` and the `bookEventHandlerMap`.
- **Board/rendering:** Reels are created with `createReelForCascading` and padded boards. The enhanced board controller drives spin/settle/stop and symbol state transitions (spin → land → win → postWinStatic) via `stateGame` and `stateGameDerived`.
- **State & UI:** UI state is kept in `$state` stores per game scope (`stateGame`, `stateLayout`). Feature overlays (free spins, hold & spin, jackpots) are toggled by event emitter messages; audio is centralized in the emitter handlers.
- **Win presentation:** Win animations trigger from book events, highlighting symbol positions and running win level sounds/loops; scatter land sounds are sequenced by counter index.
- **Feature flow:** Free spins and hold & spin rely on dedicated book events. Buy features are exposed as bet modes in math (`bonus_fs`, `bonus_hns`); the frontend must request the proper bet mode to trigger them.

## 2. Current vs New Game Comparison

| Property | Old Game (`0_0_ways`) | New Game (`2_0_tbd_15625ways`) |
| -------- | -------- | -------- |
| Reels    | 5        | 6        |
| Rows     | 3        | 5        |
| Ways     | 243      | 15625 ($5^6$) |
| Features | Free Spins | Free Spins, Hold & Spin, Jackpots, Buy FS, Buy H&S |

## 3. Required Frontend Changes
- **Grid/board resize:** Expand to 6×5 visible (6×7 padded) so the board controller and layout calculations use 30 visible symbols; keep symbol size responsive for portrait/landscape.
- **Ways/highlight logic:** Ensure win highlighting works with 6 reels and 5 rows; validate ways math (min 3 adjacent) against RGS wins.
- **Hold & Spin flow:** Wire `holdAndSpinTrigger/Respin/End` events to a locked-grid mode that preserves existing money symbols, resets respins, and applies jackpot awards; overlay iron frame and counter.
- **Free spins enhancements:** Apply money symbol min value in FS, enable H&S inside FS, and +1 respin multiplier growth; handle optional 5% wild reel cap if turned on.
- **Buy features:** Surface bet modes `bonus_fs` (80x) and `bonus_hns` (100x) and route wagers to those modes so QA can trigger features instantly.
- **Symbol mapping/assets:** Align math symbols (DRI/DIA/GCA/TNT/PIC/HEL/LAN/A/K/Q/J/10/W/S/M) to visual assets; replace placeholder H*/L* aliases and add money symbol/jackpot visuals.

## 4. File-Level Change Plan
- **web-sdk/apps/ways_15625/src/game/config.ts** — Already set to gameID `2_0_tbd_15625ways`, 6 reels, 5 rows, and bet modes base/bonus_fs/bonus_hns. Validate symbol list matches paytable and expose buy modes in UI.
- **web-sdk/apps/ways_15625/src/game/constants.ts** — Board is 6×7 padded; `BOARD_DIMENSIONS` is 6×5. `HIGH_SYMBOLS` still references legacy H1–H5 and aliases are mapped at bottom. Replace aliases with math-native keys, review `SYMBOL_INFO_MAP` sizing for M/S/W, and ensure MONEY symbol uses correct static/win assets.
- **web-sdk/apps/ways_15625/src/game/stateGame.svelte.ts** — Holds holdAndSpin state but does not yet change reel behavior for locked symbols. Add board mode that keeps existing money symbols, updates multiplier/respins, and avoids clearing locked slots on respin.
- **web-sdk/apps/ways_15625/src/game/bookEventHandlerMap.ts** — New handlers exist for holdAndSpinTrigger/Respin/End and jackpotAwarded. Improve: use a non-clearing spin for H&S respins, update multiplier display, and feed jackpot overlays. Ensure snapshot logic also replays H&S state if reconnecting.
- **web-sdk/apps/ways_15625/src/game/utils.ts** — `normalizeBoard` pads 5-row boards to 7; keep this for H&S resends. Add helper to merge locked money symbols for respin flows.
- **web-sdk/apps/ways_15625/src/game/typesBookEvent.ts** — Events defined for H&S and jackpots; confirm RGS payload matches (positions, multiplier, respinsRemaining, jackpotType/value) and extend if money symbol carries displayed prize.
- **web-sdk/apps/ways/src/** (legacy) — Leave untouched; use only as reference.

## 5. Folder Structure
```
web-sdk/apps/
  ways/                (Legacy 5×3)
  ways_15625/          (New 6×5 implementation)
    src/
      components/      (Board, Symbol variants, feature overlays)
        features/      (Hold & Spin frame/counter, jackpot celebration)
      game/            (config/constants/state/handlers)
      stories/         (QA data and mocks)
```

## 6. Math SDK Verification Report
- **Grid/ways:** Game config declares 6 reels, rows [5×6], ways pay, $5^6=15625$.
- **Paytable:** High DRI/DIA/GCA up to 15×; mids TNT/PIC/HEL/LAN up to 4×; lows A/K/Q/J/10 up to 2×.
- **Specials:** Wild `W` reels 2–4 only; Scatter `S` pays anywhere and triggers FS; Money `M` carries prizes and triggers H&S at 6+.
- **Free spins:** Base trigger {3:10, 4:15, 5:20}; retrigger in FS {3:5, 4:10, 5:15}; supports FS wild reel chance 5% and FS H&S multiplier growth +1 per respin.
- **Hold & Spin:** Trigger count 6, initial respins 3, total positions 30, money prob base 0.04 (FS 0.06 via buy), H&S jackpot prob 0.003, jackpots MINI 20/MINOR 50/MAJOR 200/GRAND 1000 (GRAND via full grid).
- **Bet modes (buy):** base, bonus_fs (80x cost, forces freegame reels), bonus_hns (100x cost, forces holdnspin). These enable QA triggering bonus features directly.
- **Compatibility notes:** Frontend must consume new book events `holdAndSpin*` and `jackpotAwarded`; ensure board normalization to 7 rows; wild reel cap applies only in FS; money values differ between base and FS.

## 7. Asset Audit
- **Reused now:** Generic low/high placeholders (h1–h5/l1–l5), wild w.png, scatter s.png, money uses M spine from prior multiplier symbol.
- **Missing/needs mapping:** Dedicated art for DRI/DIA/GCA/TNT/PIC/HEL/LAN/A/K/Q/J/10/M; jackpot badges (MINI/MINOR/MAJOR/GRAND); iron frame overlay; drill activation/sparks; money value text.
- **Action:** Map math symbols directly in `SYMBOL_INFO_MAP` to current placeholders (short-term), then request 120×120 webp + Spine for all math symbols and money/jackpot variants.

## 8. Edge Cases
- **Full grid GRAND:** When all 30 cells filled in H&S, display full-board highlight before payout; grant GRAND automatically.
- **H&S inside FS:** Pause FS counter/UI, run H&S overlay, resume FS state afterward; preserve FS multiplier growth per respin.
- **Respins with locks:** Ensure respin animations do not clear locked money symbols; only newly landed ones animate.
- **Ways density & scaling:** Verify portrait scaling keeps 30 symbols readable; adjust `SYMBOL_SIZE` or padding if bleed occurs.

## 9. Testing Checklist
- [ ] Base spins: 6×5 board populates, stop timing correct.
- [ ] Ways wins: min 3-adjacent validation vs math outputs across 15,625 ways.
- [ ] Scatter → FS: 3/4/5 scatters give 10/15/20 FS; retriggers in FS.
- [ ] Hold & Spin trigger: 6+ money triggers, respins reset on new money, locks persist, multiplier growth in FS.
- [ ] Jackpots: MINI/MINOR/MAJOR via money jackpots; GRAND on full grid; UI overlay and sounds fire.
- [ ] Buy features: bonus_fs (80x) enters FS immediately; bonus_hns (100x) enters H&S immediately.
- [ ] UI scaling: portrait/landscape/desktop wrappers hold 30 symbols without overlap.

### QA Trigger Notes
- Set the bet mode to `bonus_fs` to jump straight into free spins; set to `bonus_hns` for instant Hold & Spin.
- Hold & Spin flow now keeps locked money symbols between respins and drives the respin counter + frame overlays.
