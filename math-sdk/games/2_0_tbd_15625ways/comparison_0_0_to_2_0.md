# Detailed Code Comparison: 0_0_ways → 2_0_tbd_15625ways

This is a file-by-file, function-by-function comparison between:
- Old template: `math-sdk/games/0_0_ways`
- New implementation: `math-sdk/games/2_0_tbd_15625ways`

It includes:
1. exact function additions/modifications/removals,
2. line-level code references,
3. unified-diff section references.

---

## Diff Artifacts

- Full consolidated patch: [diff_0_0_to_2_0.patch](diff_0_0_to_2_0.patch)
- Section anchors inside patch:
  - `game_calculations.py`: [L2-L45](diff_0_0_to_2_0.patch#L2-L45)
  - `game_config.py`: [L47-L466](diff_0_0_to_2_0.patch#L47-L466)
  - `game_events.py`: [L467-L571](diff_0_0_to_2_0.patch#L467-L571)
  - `game_executables.py`: [L572-L631](diff_0_0_to_2_0.patch#L572-L631)
  - `game_optimization.py`: [L632-L821](diff_0_0_to_2_0.patch#L632-L821)
  - `game_override.py`: [L822-L1009](diff_0_0_to_2_0.patch#L822-L1009)
  - `gamestate.py`: [L1010-L1388](diff_0_0_to_2_0.patch#L1010-L1388)
  - `run.py`: [L1389-L1441](diff_0_0_to_2_0.patch#L1389-L1441)
  - `readme.txt`: [L1442-L1542](diff_0_0_to_2_0.patch#L1442-L1542)

---

## High-Level Delta Summary

- Engine scope moves from a basic ways+freespin template to a 6x5, 15,625 ways game with Hold & Spin and fixed jackpots.
- Core runtime adds money symbol lifecycle, respin loop, board forcing rules, and event model extensions.
- Config introduces new economic controls (money value distributions, jackpot odds/weights, feature-specific probabilities).
- Optimization setup splits criteria into base/freegame/holdnspin and adds separate bonus modes for FS and H&S.

---

## Function Delta Matrix

### Added functions (new in 2_0)

- `GameCalculations.calculate_holdnspin_win` — [game_calculations.py L9](game_calculations.py#L9)
- `GameCalculations.check_holdnspin_full_grid` — [game_calculations.py L18](game_calculations.py#L18)
- `GameCalculations.count_money_symbols` — [game_calculations.py L27](game_calculations.py#L27)
- `holdnspin_trigger_event` — [game_events.py L7](game_events.py#L7)
- `holdnspin_respin_event` — [game_events.py L24](game_events.py#L24)
- `holdnspin_end_event` — [game_events.py L58](game_events.py#L58)
- `jackpot_event` — [game_events.py L73](game_events.py#L73)
- `money_symbol_event` — [game_events.py L84](game_events.py#L84)
- `GameExecutables.check_holdnspin_trigger` — [game_executables.py L18](game_executables.py#L18)
- `GameExecutables.get_money_positions` — [game_executables.py L23](game_executables.py#L23)
- `GameExecutables.get_locked_positions` — [game_executables.py L34](game_executables.py#L34)
- `GameExecutables.get_unlocked_positions` — [game_executables.py L43](game_executables.py#L43)
- `GameStateOverride.assign_money_value` — [game_override.py L42](game_override.py#L42)
- `GameStateOverride.assign_money_value_holdnspin` — [game_override.py L69](game_override.py#L69)
- `GameStateOverride.get_jackpot_type_from_prize` — [game_override.py L88](game_override.py#L88)
- `GameStateOverride.perform_holdnspin_respin` — [game_override.py L96](game_override.py#L96)
- `GameStateOverride.lock_money_symbols` — [game_override.py L140](game_override.py#L140)
- `GameStateOverride.apply_random_wild_reel` — [game_override.py L147](game_override.py#L147)
- `GameState.run_hold_and_spin` — [gamestate.py L116](gamestate.py#L116)
- `GameState._force_money_on_board` — [gamestate.py L247](gamestate.py#L247)

### Modified functions

- `GameExecutables.evaluate_ways_board`
  - old: [../0_0_ways/game_executables.py L8-L14](../0_0_ways/game_executables.py#L8-L14)
  - new: [game_executables.py L10-L16](game_executables.py#L10-L16)
- `OptimizationSetup.__init__`
  - old: [../0_0_ways/game_optimization.py L17](../0_0_ways/game_optimization.py#L17)
  - new: [game_optimization.py L28](game_optimization.py#L28)
- `GameStateOverride.reset_book`
  - old: [../0_0_ways/game_override.py L11-L14](../0_0_ways/game_override.py#L11-L14)
  - new: [game_override.py L22-L34](game_override.py#L22-L34)
- `GameStateOverride.assign_special_sym_function`
  - old: [../0_0_ways/game_override.py L16-L17](../0_0_ways/game_override.py#L16-L17)
  - new: [game_override.py L36-L40](game_override.py#L36-L40)
- `GameStateOverride.check_game_repeat`
  - old: [../0_0_ways/game_override.py L24-L28](../0_0_ways/game_override.py#L24-L28)
  - new: [game_override.py L160-L168](game_override.py#L160-L168)
- `GameState.run_spin`
  - old: [../0_0_ways/gamestate.py L9-L27](../0_0_ways/gamestate.py#L9-L27)
  - new: [gamestate.py L33-L77](gamestate.py#L33-L77)
- `GameState.run_freespin`
  - old: [../0_0_ways/gamestate.py L29-L40](../0_0_ways/gamestate.py#L29-L40)
  - new: [gamestate.py L79-L114](gamestate.py#L79-L114)
- `GameState.check_freespin_entry` (override introduced in 2_0)
  - base behavior previously inherited in 0_0, now local override: [gamestate.py L223-L245](gamestate.py#L223-L245)
- `GameState.draw_board` (override introduced in 2_0)
  - base behavior previously inherited in 0_0, now local override: [gamestate.py L293-L365](gamestate.py#L293-L365)

### Removed/replaced logic

- `GameStateOverride.assign_mult_property` removed from game-local override layer.
  - old local impl: [../0_0_ways/game_override.py L19-L22](../0_0_ways/game_override.py#L19-L22)
  - replacement model: money-symbol assignment + Hold & Spin value handling in [game_override.py L42-L87](game_override.py#L42-L87)

---

## File-by-File Detailed Breakdown

## 1) `game_calculations.py`

### Structural change
- Old file is mostly empty implementation shell: [../0_0_ways/game_calculations.py L4-L5](../0_0_ways/game_calculations.py#L4-L5)
- New file adds three H&S utility methods: [game_calculations.py L6-L35](game_calculations.py#L6-L35)

### Function-level changes
- `calculate_holdnspin_win(board)` [game_calculations.py L9-L16](game_calculations.py#L9-L16)
  - New additive win accumulation over symbol `prize` attributes.
  - Enables feature-level finalization in `run_hold_and_spin`.
- `check_holdnspin_full_grid(board)` [game_calculations.py L18-L25](game_calculations.py#L18-L25)
  - New locked-position counter compared against `holdnspin_total_positions`.
  - Used for GRAND jackpot path.
- `count_money_symbols(board=None)` [game_calculations.py L27-L35](game_calculations.py#L27-L35)
  - New symbol scan helper for trigger checks and forced-board operations.

### Diff reference
- [diff_0_0_to_2_0.patch L2-L45](diff_0_0_to_2_0.patch#L2-L45)

---

## 2) `game_config.py`

### Class/method anchors
- Old `GameConfig`: [../0_0_ways/game_config.py L7](../0_0_ways/game_config.py#L7)
- New `GameConfig`: [game_config.py L15](game_config.py#L15)
- `__new__`: old [L12](../0_0_ways/game_config.py#L12), new [L20](game_config.py#L20)
- `__init__`: old [L17](../0_0_ways/game_config.py#L17), new [L25](game_config.py#L25)

### Core identity and dimensions
- `game_id`: `0_0_ways` → `2_0_tbd_15625ways`
  - old [L19](../0_0_ways/game_config.py#L19), new [L27](game_config.py#L27)
- `provider_number`: `0` → `2`
  - old [L20](../0_0_ways/game_config.py#L20), new [L28](game_config.py#L28)
- `working_name`: updated
  - old [L21](../0_0_ways/game_config.py#L21), new [L29](game_config.py#L29)
- RTP: `0.97` → `0.96`
  - old [L24](../0_0_ways/game_config.py#L24), new [L32](game_config.py#L32)
- Grid: `5x3` → `6x5`
  - old `num_reels/num_rows`: [L28-L29](../0_0_ways/game_config.py#L28-L29)
  - new `num_reels/num_rows`: [L39-L40](game_config.py#L39-L40)

### Paytable + symbol model
- Old paytable uses `H1-H5`, `L1-L4` buckets: [../0_0_ways/game_config.py L31](../0_0_ways/game_config.py#L31)
- New paytable uses mining symbol set (`DRI`,`DIA`,`GCA`,`TNT`,`PIC`,`HEL`,`LAN`,`A-K-Q-J-10`): [game_config.py L48](game_config.py#L48)
- `special_symbols` adds money symbol channel:
  - old [L62](../0_0_ways/game_config.py#L62)
  - new [L119-L124](game_config.py#L119-L124)

### Trigger and feature parameters (new)
- Freespin trigger tuning:
  - old [L64-L67](../0_0_ways/game_config.py#L64-L67)
  - new [L129-L132](game_config.py#L129-L132)
- Anticipation changed (`freegame`: 1 → 2):
  - old [L68](../0_0_ways/game_config.py#L68)
  - new [L133](game_config.py#L133)
- New Hold & Spin controls:
  - trigger count [L138](game_config.py#L138)
  - initial respins [L139](game_config.py#L139)
  - full-grid position count [L140](game_config.py#L140)
  - gametype token [L143](game_config.py#L143)
  - base money values [L147-L155](game_config.py#L147-L155)
  - freegame money values [L159-L166](game_config.py#L159-L166)
  - jackpot probability [L170](game_config.py#L170)
  - jackpot values [L173-L178](game_config.py#L173-L178)
  - jackpot weights [L182-L186](game_config.py#L182-L186)
  - H&S symbol probability [L191](game_config.py#L191)
  - FS H&S multiplier growth [L194](game_config.py#L194)
  - random wild-reel chance [L197](game_config.py#L197)

### Reel sets and modes
- Reels map now adds `HR0`:
  - old [L70](../0_0_ways/game_config.py#L70)
  - new [L202-L206](game_config.py#L202-L206)
- `mode_maxwins` changed from `base/bonus/superspin` to `base/bonus_fs/bonus_hns`:
  - old [L75](../0_0_ways/game_config.py#L75)
  - new [L216-L220](game_config.py#L216-L220)

### Distribution and bet-mode migration
- Old modes: `base`, `bonus` [../0_0_ways/game_config.py L79](../0_0_ways/game_config.py#L79), [L140](../0_0_ways/game_config.py#L140)
- New modes: `base`, `bonus_fs`, `bonus_hns` [game_config.py L227](game_config.py#L227), [L298](game_config.py#L298), [L329](game_config.py#L329)
- Notable criteria migration:
  - old `base` includes `wincap` criteria [../0_0_ways/game_config.py L88](../0_0_ways/game_config.py#L88)
  - new `base` uses `freegame`, `holdnspin`, `0`, `basegame` [game_config.py L236](game_config.py#L236), [L252](game_config.py#L252), [L268](game_config.py#L268), [L282](game_config.py#L282)
- FRWCAP weighting changed in FS buy:
  - old `{"FR0":1,"FRWCAP":5}` [../0_0_ways/game_config.py L154](../0_0_ways/game_config.py#L154)
  - new `{"FR0":1,"FRWCAP":1}` [game_config.py L314](game_config.py#L314)
- New H&S force path in distributions: [game_config.py L262](game_config.py#L262), [L347](game_config.py#L347)

### Diff reference
- [diff_0_0_to_2_0.patch L47-L466](diff_0_0_to_2_0.patch#L47-L466)

---

## 3) `game_events.py`

### Structural change
- Old file only re-exports shared events import: [../0_0_ways/game_events.py L1](../0_0_ways/game_events.py#L1)
- New file defines 5 game-specific H&S event emitters: [game_events.py L7-L95](game_events.py#L7-L95)

### Added function details
- `holdnspin_trigger_event` [L7-L22](game_events.py#L7-L22)
  - Adds trigger event payload with positions and `isFreeSpin` flag.
- `holdnspin_respin_event` [L24-L56](game_events.py#L24-L56)
  - Serializes board snapshot + new-money positions + optional multiplier.
- `holdnspin_end_event` [L58-L71](game_events.py#L58-L71)
  - Emits capped cents win and optional jackpot/final multiplier.
- `jackpot_event` [L73-L82](game_events.py#L73-L82)
  - New fixed jackpot payload.
- `money_symbol_event` [L84-L95](game_events.py#L84-L95)
  - Per-symbol money reveal event for client visualization.

### Diff reference
- [diff_0_0_to_2_0.patch L467-L571](diff_0_0_to_2_0.patch#L467-L571)

---

## 4) `game_executables.py`

### Method inventory delta
- Old class methods: `evaluate_ways_board` only.
  - [../0_0_ways/game_executables.py L8-L14](../0_0_ways/game_executables.py#L8-L14)
- New class methods:
  - `evaluate_ways_board` [L10-L16](game_executables.py#L10-L16) (same functional intent, docstring updated)
  - `check_holdnspin_trigger` [L18-L21](game_executables.py#L18-L21)
  - `get_money_positions` [L23-L32](game_executables.py#L23-L32)
  - `get_locked_positions` [L34-L41](game_executables.py#L34-L41)
  - `get_unlocked_positions` [L43-L50](game_executables.py#L43-L50)

### Behavior delta
- Execution layer now provides board topology helpers used by H&S runtime loop and event generation.

### Diff reference
- [diff_0_0_to_2_0.patch L572-L631](diff_0_0_to_2_0.patch#L572-L631)

---

## 5) `game_optimization.py`

### Class/method anchor
- `OptimizationSetup.__init__`
  - old: [../0_0_ways/game_optimization.py L17](../0_0_ways/game_optimization.py#L17)
  - new: [game_optimization.py L28](game_optimization.py#L28)

### Opt-model structure migration
- Mode keys:
  - old: `base`, `bonus` [../0_0_ways/game_optimization.py L23](../0_0_ways/game_optimization.py#L23), [L79](../0_0_ways/game_optimization.py#L79)
  - new: `base`, `bonus_fs`, `bonus_hns` [game_optimization.py L36](game_optimization.py#L36), [L120](game_optimization.py#L120), [L162](game_optimization.py#L162)

### Criteria targets and search filters
- `base.conditions`:
  - old had `wincap`, `0`, `freegame`, `basegame` with freegame RTP 0.37 and basegame RTP 0.59
    - [../0_0_ways/game_optimization.py L25-L32](../0_0_ways/game_optimization.py#L25-L32)
  - new has `0`, `freegame`, `holdnspin`, `basegame`
    - [game_optimization.py L40-L60](game_optimization.py#L40-L60)
  - new adds holdnspin filter `{"symbol":"money","feature":"holdnspin"}`: [L54](game_optimization.py#L54)

### Scaling profile changes
- Old scaling focuses on basegame/freegame ranges: [../0_0_ways/game_optimization.py L35-L61](../0_0_ways/game_optimization.py#L35-L61)
- New scaling adds dedicated holdnspin windows in base mode and introduces full holdnspin scaling set for `bonus_hns`:
  - base scaling: [game_optimization.py L63-L101](game_optimization.py#L63-L101)
  - bonus_hns scaling: [game_optimization.py L171-L187](game_optimization.py#L171-L187)

### Bonus-mode split
- Old bonus mode optimizes freegame only: [../0_0_ways/game_optimization.py L79-L112](../0_0_ways/game_optimization.py#L79-L112)
- New split:
  - `bonus_fs` freegame optimization [game_optimization.py L120-L154](game_optimization.py#L120-L154)
  - `bonus_hns` holdnspin optimization [game_optimization.py L162-L197](game_optimization.py#L162-L197)

### Diff reference
- [diff_0_0_to_2_0.patch L632-L821](diff_0_0_to_2_0.patch#L632-L821)

---

## 6) `game_override.py`

### Method delta map

#### Old methods
- `reset_book` [../0_0_ways/game_override.py L11-L14](../0_0_ways/game_override.py#L11-L14)
- `assign_special_sym_function` [../0_0_ways/game_override.py L16-L17](../0_0_ways/game_override.py#L16-L17)
- `assign_mult_property` [../0_0_ways/game_override.py L19-L22](../0_0_ways/game_override.py#L19-L22)
- `check_game_repeat` [../0_0_ways/game_override.py L24-L28](../0_0_ways/game_override.py#L24-L28)

#### New methods
- `reset_book` [game_override.py L22-L34](game_override.py#L22-L34)
- `assign_special_sym_function` [game_override.py L36-L40](game_override.py#L36-L40)
- `assign_money_value` [game_override.py L42-L67](game_override.py#L42-L67)
- `assign_money_value_holdnspin` [game_override.py L69-L86](game_override.py#L69-L86)
- `get_jackpot_type_from_prize` [game_override.py L88-L94](game_override.py#L88-L94)
- `perform_holdnspin_respin` [game_override.py L96-L138](game_override.py#L96-L138)
- `lock_money_symbols` [game_override.py L140-L145](game_override.py#L140-L145)
- `apply_random_wild_reel` [game_override.py L147-L158](game_override.py#L147-L158)
- `check_game_repeat` [game_override.py L160-L168](game_override.py#L160-L168)

### Line-by-line behavior migration summary

1. **State model expansion in reset**
   - Added fields for H&S board, respins, multiplier, jackpot tracking, trigger flags.
   - Reference: [game_override.py L24-L34](game_override.py#L24-L34)

2. **Special-symbol function routing changed**
   - Old: maps `W` to multiplier assignment.
   - New: maps `M` to money/jackpot assignment.
   - References: old [L16-L22](../0_0_ways/game_override.py#L16-L22), new [L36-L67](game_override.py#L36-L67)

3. **Money symbol value pipeline added**
   - Adds base vs freegame value sets, jackpot roll, jackpot type selection.
   - References: [L42-L87](game_override.py#L42-L87)

4. **Respin mutation engine added**
   - Position-by-position respin with probability gate and lock-in behavior.
   - References: [L96-L138](game_override.py#L96-L138)

5. **Repeat-condition hardening**
   - Adds `force_holdnspin` satisfaction check in repeat logic.
   - Reference: [L165-L168](game_override.py#L165-L168)

### Diff reference
- [diff_0_0_to_2_0.patch L822-L1009](diff_0_0_to_2_0.patch#L822-L1009)

---

## 7) `gamestate.py`

### Method delta map

#### Old methods
- `run_spin` [../0_0_ways/gamestate.py L9-L27](../0_0_ways/gamestate.py#L9-L27)
- `run_freespin` [../0_0_ways/gamestate.py L29-L40](../0_0_ways/gamestate.py#L29-L40)

#### New methods
- `run_spin` [gamestate.py L33-L77](gamestate.py#L33-L77)
- `run_freespin` [gamestate.py L79-L114](gamestate.py#L79-L114)
- `run_hold_and_spin` [gamestate.py L116-L221](gamestate.py#L116-L221)
- `check_freespin_entry` [gamestate.py L223-L245](gamestate.py#L223-L245)
- `_force_money_on_board` [gamestate.py L247-L291](gamestate.py#L247-L291)
- `draw_board` [gamestate.py L293-L365](gamestate.py#L293-L365)

### Detailed change analysis

1. **`run_spin` orchestration now branches across three outcomes**
   - old flow: evaluate ways → maybe enter free spins.
   - new flow: evaluate ways → compute H&S trigger and FS trigger → priority routing (`H&S if no FS`, else FS, else base).
   - old/new refs:
     - old [../0_0_ways/gamestate.py L15-L22](../0_0_ways/gamestate.py#L15-L22)
     - new [gamestate.py L43-L64](gamestate.py#L43-L64)

2. **`run_freespin` now includes feature chaining + risk guard**
   - adds random wild reel transform.
   - allows H&S trigger while in free spins.
   - introduces `running_bet_win >= wincap` break guard.
   - ref: [gamestate.py L90-L112](gamestate.py#L90-L112)

3. **`run_hold_and_spin` introduces full respin feature lifecycle**
   - trigger bookkeeping, board clone + lock pass, respin loop, reset/decrement logic,
   - event emission per stage,
   - full-grid GRAND path,
   - remaining-cap clipping and total update event.
   - refs: [gamestate.py L116-L221](gamestate.py#L116-L221)

4. **Forced-distribution compatibility added**
   - `check_freespin_entry` blocks FS when `force_holdnspin` active unless explicitly also forcing freegame.
   - `draw_board` handles three forced/non-forced branches with retry limits.
   - refs: [gamestate.py L223-L245](gamestate.py#L223-L245), [L293-L365](gamestate.py#L293-L365)

5. **Forced-money helper added**
   - `_force_money_on_board` mutates non-special tiles into `M` to satisfy trigger count.
   - ref: [gamestate.py L247-L291](gamestate.py#L247-L291)

### Diff reference
- [diff_0_0_to_2_0.patch L1010-L1388](diff_0_0_to_2_0.patch#L1010-L1388)

---

## 8) `run.py`

### Parameter deltas

- Batch size:
  - old [../0_0_ways/run.py L15](../0_0_ways/run.py#L15) = `50000`
  - new [run.py L16](run.py#L16) = `200000`

- Sim counts per mode:
  - old [../0_0_ways/run.py L19-L22](../0_0_ways/run.py#L19-L22): `base`, `bonus` at `1e4`
  - new [run.py L20-L24](run.py#L20-L24): `base`, `bonus_fs`, `bonus_hns` at `2e5`

- Target modes:
  - old [../0_0_ways/run.py L30](../0_0_ways/run.py#L30)
  - new [run.py L32](run.py#L32)

- Analysis keys:
  - old scatter only [../0_0_ways/run.py L55](../0_0_ways/run.py#L55)
  - new scatter + money/holdnspin [run.py L57-L60](run.py#L57-L60)

### Diff reference
- [diff_0_0_to_2_0.patch L1389-L1441](diff_0_0_to_2_0.patch#L1389-L1441)

---

## 9) `readme.txt`

### Documentation delta

- Old readme: short template description for 5x3 ways game.
  - [../0_0_ways/readme.txt L1-L16](../0_0_ways/readme.txt#L1-L16)
- New readme: full product spec including
  - geometry/ways [readme.txt L4-L6](readme.txt#L4-L6),
  - symbol/paytable sheets,
  - hold & spin/jackpot spec,
  - free spin enhancements,
  - buy-feature pricing,
  - RTP split,
  - explicit fix list [readme.txt L73-L81](readme.txt#L73-L81).

### Diff reference
- [diff_0_0_to_2_0.patch L1442-L1542](diff_0_0_to_2_0.patch#L1442-L1542)

---

## Explicit Add/Modify/Replace Checklist

### Added
- New H&S helper methods in calculations/executables/override/state.
- New event emitters for H&S lifecycle and jackpots.
- New buy mode (`bonus_hns`) and mode split (`bonus` → `bonus_fs` + `bonus_hns`).
- New config parameters for money value distributions, jackpots, and H&S dynamics.

### Modified
- Existing `run_spin`, `run_freespin`, `evaluate_ways_board`, `check_game_repeat`, optimization `__init__`, config `__init__`.
- Distribution definitions and criteria mapping.

### Replaced
- Game-local wild multiplier assignment function replaced by money-value/jackpot assignment pathway.

---

## Practical Verification Targets

1. H&S trigger correctness:
   - validate `count_money_symbols >= holdnspin_trigger_count` path.
2. Wincap enforcement:
   - validate both free spin loop guard and H&S mid-loop cap checks.
3. Distribution forcing:
   - validate `force_holdnspin` and `force_freegame` interactions in `draw_board` and `check_freespin_entry`.
4. RTP split behavior:
   - validate optimization criteria outputs align with base/freegame/holdnspin targets.
