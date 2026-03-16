# Mining Ways Hold & Spin — Detailed Technical Report

> **Game ID:** `1_0_mining_ways`  
> **SDK:** Stake Engine Math (Python 3.12+ / Rust Optimization)  
> **Target RTP:** 96%  
> **Max Win:** 5,000x  
> **Status:** ✅ Fully functional — all bet modes and distribution criteria tested  
> **Report Date:** March 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Game Specification](#2-game-specification)
3. [Architecture & File Structure](#3-architecture--file-structure)
4. [File-by-File Breakdown](#4-file-by-file-breakdown)
5. [Inheritance Chain & SDK Integration](#5-inheritance-chain--sdk-integration)
6. [Game Flow — How It Works](#6-game-flow--how-it-works)
7. [Feature Mechanics Deep Dive](#7-feature-mechanics-deep-dive)
8. [Reel Strips & Symbol Distribution](#8-reel-strips--symbol-distribution)
9. [Bet Modes & Distribution System](#9-bet-modes--distribution-system)
10. [Optimization Pipeline](#10-optimization-pipeline)
11. [Event System & Frontend Integration](#11-event-system--frontend-integration)
12. [Test Results & Validation](#12-test-results--validation)
13. [Bugs Encountered & Solutions](#13-bugs-encountered--solutions)
14. [How to Run](#14-how-to-run)
15. [How to Integrate with Production](#15-how-to-integrate-with-production)
16. [Configuration Reference](#16-configuration-reference)
17. [FAQ](#17-faq)
18. [Glossary](#18-glossary)

---

## 1. Executive Summary

**Mining Ways Hold & Spin** is a mining-themed slot game built on the Stake Engine Math SDK. It features a **5-reel × 6-row grid** with **7,776 ways-to-win**, three engaging bonus features (**Free Spins**, **Hold & Spin**, **Fixed Jackpots**), and three playable bet modes (**Base**, **Free Spins Buy**, **Hold & Spin Buy**).

### What Was Built

| Component | Description |
|-----------|-------------|
| `game_config.py` | Complete game configuration — grid, paytable, symbols, features, distributions |
| `game_calculations.py` | Hold & Spin win calculation helpers |
| `game_events.py` | Custom H&S event emitters for frontend communication |
| `game_executables.py` | Ways evaluation engine + H&S trigger detection |
| `game_override.py` | Money symbol value assignment, H&S respin logic, board forcing |
| `gamestate.py` | Main game loop — base game, free spins, hold & spin orchestration |
| `game_optimization.py` | Optimization targets for the Rust-based RTP solver |
| `run.py` | Main execution script for simulation, optimization, and analysis |
| `readme.txt` | Game documentation |
| `reels/*.csv` | 4 reel strip files (BR0, FR0, FRWCAP, HR0) |

### Test Results (100 spins per criteria)

| Criteria | Avg Win | Total Win | Errors |
|----------|---------|-----------|--------|
| basegame | 2.05x | 205.40x | 0 |
| zero-win | 0.00x | 0.00x | 0 |
| freegame | 49.70x | 4,970.30x | 0 |
| holdnspin | 196.49x | 19,648.70x | 0 |
| bonus_fs (50 spins) | 767.05x | — | 0 |
| bonus_hns (50 spins) | 331.61x | — | 0 |

---

## 2. Game Specification

### Grid Layout

```
┌─────────────────────────────────┐
│  Reel 1  Reel 2  Reel 3  Reel 4  Reel 5  │
│  ──────  ──────  ──────  ──────  ──────  │
│  Row 1   Row 1   Row 1   Row 1   Row 1   │
│  Row 2   Row 2   Row 2   Row 2   Row 2   │
│  Row 3   Row 3   Row 3   Row 3   Row 3   │
│  Row 4   Row 4   Row 4   Row 4   Row 4   │
│  Row 5   Row 5   Row 5   Row 5   Row 5   │
│  Row 6   Row 6   Row 6   Row 6   Row 6   │
└─────────────────────────────────┘
         5 Reels × 6 Rows = 30 positions
         Ways = 6^5 = 7,776
```

### Symbol Table

| Category | Symbol | Name | 3-of-kind | 4-of-kind | 5-of-kind |
|----------|--------|------|-----------|-----------|-----------|
| **High** | DRI | Drill Machine | 2x | 4x | 8x |
| **High** | DIA | Diamond Cluster | 1.5x | 3x | 6x |
| **High** | GCA | Gold Cart | 1x | 2x | 5x |
| **Mid** | TNT | TNT Explosive | 0.5x | 1x | 2x |
| **Mid** | PIC | Pickaxe | 0.5x | 1x | 2x |
| **Mid** | HEL | Helmet | 0.5x | 1x | 2x |
| **Mid** | LAN | Lantern | 0.5x | 1x | 2x |
| **Low** | A | Ace | 0.2x | 0.4x | 1x |
| **Low** | K | King | 0.2x | 0.4x | 1x |
| **Low** | Q | Queen | 0.2x | 0.4x | 1x |
| **Low** | J | Jack | 0.2x | 0.4x | 1x |
| **Low** | 10 | Ten | 0.2x | 0.4x | 1x |
| **Special** | W | Wild | Substitutes all paying (reels 2-4 only) |
| **Special** | S | Scatter | Triggers Free Spins (all reels) |
| **Special** | M | Money | Carries prize value, triggers H&S (all reels) |

### RTP Budget (96% Target)

```
┌─────────────────────────────────────┐
│  Component       │  RTP Allocation  │
│──────────────────│──────────────────│
│  Base Game Wins  │  58% (0.5568)    │
│  Free Spins      │  20% (0.1920)    │
│  Hold & Spin     │  15% (0.1440)    │
│  Jackpots        │   3% (0.0288)    │
│  Wincap          │   1% (0.0096)    │
│──────────────────│──────────────────│
│  TOTAL           │  96% (0.9600)    │
└─────────────────────────────────────┘
```

---

## 3. Architecture & File Structure

```
games/1_0_mining_ways/
├── game_config.py           # Configuration singleton — all game parameters
├── game_calculations.py     # H&S win calculation helpers
├── game_events.py           # Custom event emitters for H&S
├── game_executables.py      # Ways evaluation + H&S trigger checks
├── game_override.py         # Money value assignment, H&S respin logic
├── gamestate.py             # Main game loop orchestration
├── game_optimization.py     # Rust optimizer target configuration
├── run.py                   # Entry point — simulation/optimization/analysis
├── readme.txt               # Human-readable game doc
└── reels/
    ├── BR0.csv              # Base game reel strip (109 rows × 5 reels)
    ├── FR0.csv              # Free game reel strip (109 rows × 5 reels)
    ├── FRWCAP.csv           # Free game wincap reel (109 rows × 5 reels)
    └── HR0.csv              # Hold & Spin auxiliary reel (40 rows × 5 reels)
```

### Relationship to SDK Source

```
src/                              ← Stake Engine Math SDK (shared by all games)
├── config/config.py              ← Base Config class (singleton, reel loading)
├── config/distributions.py       ← Distribution criteria definitions
├── config/betmode.py             ← BetMode container
├── calculations/board.py         ← Board creation, force_special_board
├── calculations/ways.py          ← Ways win calculation engine
├── calculations/statistics.py    ← get_random_outcome, weighted random
├── state/state.py                ← GeneralGameState (sim lifecycle)
├── state/conditions.py           ← Distribution condition management
├── executables/executables.py    ← Free spin framework, evaluate_finalwin
├── events/events.py              ← Standard event emitters (reveal, setWin...)
├── wins/win_manager.py           ← Win tracking (base/free/running totals)
└── write_data/write_configs.py   ← LUT/config output
```

---

## 4. File-by-File Breakdown

### 4.1 `game_config.py` — Configuration

**Purpose:** Defines every configurable parameter for the game as a singleton.

**Key Contents:**
- **Grid dimensions:** `num_reels=5`, `num_rows=[6,6,6,6,6]`
- **Paytable:** 36 entries mapping `(match_count, symbol_name)` → `pay_multiplier`
- **Special symbols:** Wild (`W`), Scatter (`S`), Money (`M`)
- **Free spin triggers:** `{3: 10, 4: 15, 5: 20}` base, `{3: 5, 4: 10, 5: 15}` retrigger
- **Hold & Spin config:**
  - `holdnspin_trigger_count = 6` (minimum money symbols)
  - `holdnspin_initial_respins = 3`
  - `holdnspin_total_positions = 30` (full grid for GRAND)
  - `holdnspin_money_prob = 0.10` (per-position per-respin)
- **Money value weights:** Base `{1:40, 2:25, 3:15, 5:10, 10:6, 20:2, 50:0.5}`
- **Jackpot values:** `{MINI:20, MINOR:50, MAJOR:200, GRAND:1000}`
- **Jackpot weights:** `{MINI:60, MINOR:30, MAJOR:10}` (GRAND = full grid only)
- **Reel loading:** Reads 4 CSV files into `self.reels` dict
- **Bet Modes:** 3 modes with 5+1+1 distributions total

**Singleton Pattern:**
```python
class GameConfig(Config):
    _instance = None
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```
> ⚠️ **Important:** When running multiple test instances, you must reset `GameConfig._instance = None` between them or the first config will be reused.

---

### 4.2 `game_calculations.py` — Win Helpers

**Purpose:** Extends `Executables` with Hold & Spin specific calculation methods.

| Method | Purpose |
|--------|---------|
| `calculate_holdnspin_win(board)` | Sums all money symbol `.prize` values on the board |
| `check_holdnspin_full_grid(board)` | Returns `True` if all 30 positions are locked (GRAND) |
| `count_money_symbols(board=None)` | Counts `M` symbols on current or specified board |

**Critical Implementation Detail:**
```python
# Uses sym.prize directly (not sym.has_prize) for reliable null-checking
if sym.prize is not None and sym.prize > 0:
    total_prize += sym.prize
```
The SDK `Symbol` class uses `__slots__` and only initializes `has_prize` for symbols with `"prize"` in their `special_flags`. Money symbols use `"money"` flag, so `has_prize` isn't guaranteed to be set initially.

---

### 4.3 `game_events.py` — Event Emitters

**Purpose:** Defines Hold & Spin specific events that the frontend consumes for animations.

| Event Function | Event Type | When Emitted |
|---------------|------------|--------------|
| `holdnspin_trigger_event()` | `holdAndSpinTrigger` | H&S feature starts |
| `holdnspin_respin_event()` | `holdAndSpinRespin` | Each respin round |
| `holdnspin_end_event()` | `holdAndSpinEnd` | H&S feature ends |
| `jackpot_event()` | `jackpotAwarded` | Any jackpot awarded |
| `money_symbol_event()` | `moneySymbolReveal` | Individual money reveal |

**Event Data Examples:**

```json
// holdAndSpinTrigger
{
  "index": 2,
  "type": "holdAndSpinTrigger",
  "totalRespins": 3,
  "moneyPositions": [{"reel": 0, "row": 2}, {"reel": 1, "row": 4}, ...],
  "isFreeSpin": false
}

// holdAndSpinRespin
{
  "index": 5,
  "type": "holdAndSpinRespin",
  "respinNumber": 1,
  "respinsRemaining": 3,
  "board": [[{"name": "M", "locked": true, "prize": 5}, ...], ...],
  "newMoneyPositions": [{"reel": 2, "row": 1}],
  "multiplier": 2  // only during Free Spins
}

// holdAndSpinEnd
{
  "index": 20,
  "type": "holdAndSpinEnd",
  "totalWin": 8800,  // in cents (88.0 * 100)
  "jackpot": "GRAND",  // optional
  "finalMultiplier": 5  // only during Free Spins
}
```

Also imports all standard SDK events via `from src.events.events import *`:
- `reveal_event` — board reveal
- `set_win_event` — individual win
- `set_total_event` — running total update
- `final_win_event` — end-of-round final
- `freespin_trigger_event`, `update_freespin_event`, `freespin_end_event`

---

### 4.4 `game_executables.py` — Evaluation Engine

**Purpose:** Bridges ways calculation engine with Hold & Spin board inspection.

| Method | Purpose |
|--------|---------|
| `evaluate_ways_board()` | Calculates all ways wins, records them, emits events |
| `check_holdnspin_trigger()` | Returns `True` if ≥6 money symbols on board |
| `get_money_positions(board)` | Returns list of `{reel, row}` dicts for all M symbols |
| `get_locked_positions(board)` | Returns positions where `sym.locked == True` |
| `get_unlocked_positions(board)` | Returns positions where `sym.locked == False` |

**Ways Evaluation Flow:**
```python
def evaluate_ways_board(self):
    self.win_data = Ways.get_ways_data(self.config, self.board)  # SDK calculation
    if self.win_data["totalWin"] > 0:
        Ways.record_ways_wins(self)                               # Statistics
        self.win_manager.update_spinwin(self.win_data["totalWin"]) # Win tracking
    Ways.emit_wayswin_events(self)                                # Frontend events
```

---

### 4.5 `game_override.py` — Custom Logic

**Purpose:** The most complex file — handles money symbol value assignment, Hold & Spin respin mechanics, and board forcing logic.

#### Key Methods

**`reset_book()`** — Initializes H&S state each spin:
```python
self.holdnspin_board = None
self.holdnspin_respins = 0
self.holdnspin_win = 0.0
self.holdnspin_multiplier = 1
self.holdnspin_triggered = False
self.in_holdnspin = False
self.jackpot_positions = {}  # (reel, row) → jackpot type
```

**`assign_money_value(symbol)`** — Called automatically by the SDK when creating `M` symbols:
- Selects value from weighted distribution (base or freegame)
- 0.5% chance → jackpot (MINI/MINOR/MAJOR)
- Sets `symbol.prize` and `symbol.has_prize = True`

**`perform_holdnspin_respin(board, is_freespin)`** — Core H&S respin logic:
- Iterates every unlocked position
- `random.random() < money_prob` → new money symbol lands
- Creates new `M` symbol via `symbol_storage.create_symbol("M")`
- Assigns prize value, locks it, records position
- Returns list of new money positions

**`check_game_repeat()`** — Post-spin validation:
- Verifies win criteria matches final win
- For H&S criteria: ensures H&S was actually triggered

---

### 4.6 `gamestate.py` — Main Game Loop

**Purpose:** Orchestrates the complete game flow — base game spin, free spins, and Hold & Spin.

#### Entry Point: `run_spin(sim, simulation_seed)`

```
┌────────────────────────────────────────────┐
│                 run_spin()                  │
│                                            │
│  1. reset_seed(sim)                        │
│  2. repeat = True                          │
│  3. WHILE repeat:                          │
│     ├─ reset_book()                        │
│     ├─ draw_board()                        │
│     ├─ evaluate_ways_board()               │
│     ├─ Check H&S trigger (6+ money)        │
│     ├─ Check FS trigger (3+ scatter)       │
│     │                                      │
│     ├─ IF H&S only:                        │
│     │   └─ run_hold_and_spin(False)        │
│     ├─ ELIF Free Spins:                    │
│     │   └─ run_freespin_from_base()        │
│     ├─ ELSE:                               │
│     │   └─ Check forced criteria           │
│     │                                      │
│     ├─ evaluate_finalwin()                 │
│     ├─ check_repeat()                      │
│     └─ Validate H&S criteria               │
│                                            │
│  4. imprint_wins()                         │
└────────────────────────────────────────────┘
```

#### `draw_board()` Override — 4 Branches

| Condition | Behavior |
|-----------|----------|
| `force_holdnspin` + basegame | `_force_money_on_board(6)` — places 6+ money symbols |
| `force_freegame` + basegame | Forces scatter placement with retry-limited loop |
| Normal basegame (no force) | `create_board_reelstrips()` + reject if scatters ≥ trigger |
| Freegame / other | Standard `create_board_reelstrips()` |

#### Win Tracking Pattern

```python
# CRITICAL: update_gametype_wins is called ONCE per spin, AFTER all features
if holdnspin_triggered:
    self.run_hold_and_spin(is_freespin=False)
    self.win_manager.update_gametype_wins(self.gametype)  # ways + H&S combined
elif fs_triggered:
    self.win_manager.update_gametype_wins(self.gametype)  # base ways win
    self.run_freespin_from_base()                          # FS handles its own
else:
    self.win_manager.update_gametype_wins(self.gametype)  # ways only
```

> ⚠️ **Bug Fix Applied:** Originally `update_gametype_wins` was called before H&S, causing double-counting and the `"Base + Free game payout mismatch!"` assertion error.

---

### 4.7 `game_optimization.py` — RTP Solver Config

**Purpose:** Configures the Rust-based optimization algorithm with target RTP splits.

**Optimization Targets by Mode:**

| Mode | Criteria | Target RTP |
|------|----------|------------|
| base | wincap | 0.01 (1%) |
| base | zero-win | 0.00 |
| base | freegame | 0.20 (20%) |
| base | holdnspin | 0.15 (15%) |
| base | basegame | 0.58 (58%) |
| bonus_fs | freegame | 0.95 (95%) |
| bonus_hns | holdnspin | 0.95 (95%) |

**Scaling Factors:** Adjust win distributions to smooth the payout curve:
- Basegame small wins (1-2x): scale 1.2x
- Basegame medium wins (10-20x): scale 1.5x
- Freegame large wins (500-1000x): scale 0.8x
- H&S medium-large wins (500-2000x): scale 1.3x

---

### 4.8 `run.py` — Execution Script

**Purpose:** Main entry point that orchestrates the full pipeline.

**Pipeline Steps:**
1. **Simulation:** `create_books()` — runs N simulations per bet mode
2. **Config Output:** `generate_configs()` — writes LUT/config files
3. **Optimization:** `OptimizationExecution().run_all_modes()` — Rust solver
4. **Analysis:** `create_stat_sheet()` — generates statistics
5. **Verification:** `execute_all_tests()` — validates RGS format

**Default Settings:**
```python
num_sim_args = {
    "base": 10000,
    "bonus_fs": 10000,
    "bonus_hns": 10000,
}
num_threads = 10
rust_threads = 20
batching_size = 50000
```

---

## 5. Inheritance Chain & SDK Integration

The game follows a strict class hierarchy that extends SDK base classes:

```
Config (SDK)
  └── GameConfig (game_config.py)
          Singleton, all game parameters

GeneralGameState (SDK state.py)
  └── Conditions (SDK conditions.py)
        └── Board/Tumble (SDK board.py)
              └── Executables (SDK executables.py)
                    └── GameCalculations (game_calculations.py)
                          └── GameExecutables (game_executables.py)
                                └── GameStateOverride (game_override.py)
                                      └── GameState (gamestate.py)
```

### What Each Layer Provides

| Layer | Source | Responsibility |
|-------|--------|----------------|
| `Config` | SDK | Reel loading, path management, base config |
| `GeneralGameState` | SDK | Simulation lifecycle, seed management |
| `Conditions` | SDK | Distribution/criteria management |
| `Board` | SDK | `create_board_reelstrips()`, `force_special_board()`, Symbol creation |
| `Executables` | SDK | `evaluate_finalwin()`, `run_freespin_from_base()`, free spin framework |
| `GameCalculations` | Game | H&S win sum, full grid check, money counting |
| `GameExecutables` | Game | Ways evaluation wrapper, H&S trigger detection |
| `GameStateOverride` | Game | Money value assignment, respin logic, board forcing |
| `GameState` | Game | `run_spin()`, `run_freespin()`, `run_hold_and_spin()` |

### SDK Symbol Class (`__slots__`)

```python
class Symbol:
    __slots__ = ['defn', 'explode', 'locked', 'scatter', 'wild',
                 'has_multiplier', 'multiplier', 'has_prize', 'prize']
```

> ⚠️ **Critical Constraint:** Cannot add arbitrary attributes to Symbol objects. This is why jackpot types are tracked in `self.jackpot_positions` dict on the gamestate, not on the symbol itself.

---

## 6. Game Flow — How It Works

### 6.1 Base Game Spin

```
Player clicks SPIN
        │
        ▼
    reset_book()          ← Clear all state, set holdnspin_triggered=False
        │
        ▼
    draw_board()          ← Select reel strip, generate 5×6 symbol grid
        │
        ▼
    evaluate_ways_board() ← Count all left-to-right ways wins
        │
        ├──── money_count ≥ 6? ────► run_hold_and_spin(False)
        │                                    │
        │                                    ▼
        │                              Lock money symbols
        │                              3 respins loop
        │                              Sum all prizes
        │                              Check full grid → GRAND
        │
        ├──── scatter_count ≥ 3? ───► run_freespin_from_base()
        │                                    │
        │                                    ▼
        │                              10/15/20 free spins
        │                              Each spin: ways + H&S check
        │                              Retrigger possible
        │
        └──── No trigger ──────────► Track ways win only
                                          │
                                          ▼
                                   evaluate_finalwin()
                                   check_repeat()
                                   imprint_wins()
```

### 6.2 Free Spins Flow

```
Trigger: 3+S in base game
        │
        ▼
  Determine spin count:  3S→10, 4S→15, 5S→20
        │
        ▼
  FOR EACH free spin:
    ├── Draw board (free game reels)
    ├── Evaluate ways wins
    ├── Money ≥ 6? → run_hold_and_spin(True)
    │                  └── Growing multiplier (+1 per round)
    │                  └── Higher money values (min 2x)
    ├── Scatters ≥ 3? → Retrigger (3S→+5, 4S→+10, 5S→+15)
    └── Track freegame wins
        │
        ▼
  end_freespin()
```

### 6.3 Hold & Spin Flow

```
Trigger: 6+ Money symbols on board
        │
        ▼
  Lock all current M symbols
  respins = 3, multiplier = 1
        │
        ▼
  WHILE respins > 0:
    ├── For each UNLOCKED position:
    │   └── random() < 0.10? → Place new M
    │                           Lock it
    │                           Assign prize value
    │
    ├── New M landed? → respins = 3 (reset)
    ├── No new M?     → respins -= 1
    │
    └── Check wincap
        │
        ▼
  Sum all M prizes
  Full grid (30/30)? → +1000x GRAND jackpot
  Apply multiplier (if in Free Spins)
        │
        ▼
  Return total H&S win
```

---

## 7. Feature Mechanics Deep Dive

### 7.1 Money Symbol Value Assignment

When the SDK creates an `M` symbol via `create_symbol("M")`, it calls the registered function `assign_money_value(symbol)`:

```python
# 99.5% chance: regular value
prize_value = get_random_outcome({1:40, 2:25, 3:15, 5:10, 10:6, 20:2, 50:0.5})

# 0.5% chance: jackpot
jackpot_type = get_random_outcome({"MINI":60, "MINOR":30, "MAJOR":10})
prize_value = jackpot_values[jackpot_type]  # 20, 50, or 200
```

**During Free Spins**, minimum value is 2x:
```python
money_values_freegame = {2:40, 3:25, 5:15, 10:10, 20:6, 50:2}
```

### 7.2 Hold & Spin Respin Mechanics

Each respin iterates all unlocked positions:

```python
for reel_idx, reel in enumerate(board):
    for row_idx, sym in enumerate(reel):
        if not sym.locked:
            if random.random() < money_prob:  # 10% (configurable per distribution)
                new_sym = self.symbol_storage.create_symbol("M")
                prize_value, jackpot_type = self.assign_money_value_holdnspin()
                new_sym.assign_attribute({"prize": prize_value, "locked": True})
                board[reel_idx][row_idx] = new_sym
```

The `money_prob` varies by distribution:
| Distribution | money_prob |
|-------------|-----------|
| basegame | 0.10 (10%) |
| freegame | 0.10 |
| holdnspin forced | 0.12 |
| wincap | 0.20 |
| bonus_hns | 0.15 |

### 7.3 GRAND Jackpot

The GRAND jackpot (1000x) is **only** awarded when all 30 positions on the grid are filled with locked money symbols:

```python
if self.check_holdnspin_full_grid(self.holdnspin_board):
    jackpot_awarded = "GRAND"
    holdnspin_prize_sum += self.config.jackpot_values["GRAND"]
```

This is exceptionally rare — requires every position to land a money symbol during the H&S sequence.

### 7.4 Free Spin Multiplier Growth

When Hold & Spin triggers **within** Free Spins:
- Multiplier starts at 1x
- Grows by +1 each respin round
- Final H&S win = `prize_sum × multiplier`

Example: 5 respin rounds → multiplier = 6x → prizes totaling 50x → final = 300x

---

## 8. Reel Strips & Symbol Distribution

### 8.1 Reel Strip Files

| File | Purpose | Rows | Special Symbol Spacing |
|------|---------|------|----------------------|
| `BR0.csv` | Base game | 109 | S, M, W spaced ≥7 apart per reel |
| `FR0.csv` | Free game | 109 | More M and W, still properly spaced |
| `FRWCAP.csv` | Free game wincap | 109 | Heavy W for max-win scenarios |
| `HR0.csv` | Hold & Spin auxiliary | 40 | M only, no S or W |

### 8.2 Symbol Placement Rules

Special symbols (S, M, W) are placed with **minimum 7 positions apart** on each reel strip. This prevents the following problems:

1. **Stacked scatters:** The SDK's `force_special_board` picks a window of 6 rows. If two scatters are adjacent on the strip, forcing 1 scatter could produce 2, causing infinite retry loops.

2. **Adjacent money symbols:** Could produce unexpected trigger counts during natural base game spins.

### 8.3 Reel Selection Weights

| Game Phase | Reel ID | Weight |
|-----------|---------|--------|
| Base game | BR0 | 1 |
| Free game (normal) | FR0 | 1 |
| Free game (wincap) | FRWCAP | 5 |
| Hold & Spin | HR0 | 1 |

---

## 9. Bet Modes & Distribution System

### 9.1 Distribution Overview

The SDK uses a **distribution system** to ensure target RTP and volatility. Each simulation is assigned a **criteria** (outcome type) based on weighted probabilities.

### 9.2 Base Mode (`cost=1.0x`)

| Criteria | Quota | Description |
|----------|-------|-------------|
| `wincap` | 0.1% | Forces max win (5000x) |
| `freegame` | 8% | Forces free spin trigger |
| `holdnspin` | 5% | Forces Hold & Spin trigger |
| `0` | 35% | Forces zero win |
| `basegame` | 52% | Standard base game win |

**For each criteria, specific conditions apply:**

- **`wincap`:** Uses FRWCAP reels (5:1 weight), forces free spins, higher H&S prob (20%)
- **`freegame`:** Forces scatters `{3:100, 4:20, 5:5}` (weighted), normal money
- **`holdnspin`:** Forces 6+ money symbols on board, disables free spins
- **`0`:** Uses base reels, rejects if scatters trigger
- **`basegame`:** Uses base reels, rejects if scatters trigger, allows natural H&S

### 9.3 Free Spins Buy Bonus (`cost=80x`)

| Criteria | Quota | Description |
|----------|-------|-------------|
| `freegame` | 100% | Always triggers free spins |

Uses FRWCAP reels (5:1) + FR0. Guarantees free spin entry.

### 9.4 Hold & Spin Buy Bonus (`cost=100x`)

| Criteria | Quota | Description |
|----------|-------|-------------|
| `holdnspin` | 100% | Always triggers H&S |

Forces 6+ money symbols. Higher money probability (15%).

---

## 10. Optimization Pipeline

### 10.1 How Optimization Works

The Stake Engine uses a **Rust-based optimization program** to tune reel strip symbol weights so that simulated RTP matches targets.

```
┌──────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Python Sims  │───►│  Rust Optimizer   │───►│  Tuned Configs   │
│  (10K+ runs)  │    │  (gradient search) │    │  (LUT files)     │
└──────────────┘    └──────────────────┘    └─────────────────┘
```

### 10.2 Optimization Parameters

```python
ConstructParameters(
    num_show=5000,         # Simulations to display
    num_per_fence=10000,   # Simulations per fence/bucket
    min_m2m=4,             # Minimum money-to-money ratio
    max_m2m=8,             # Maximum money-to-money ratio
    pmb_rtp=1.0,           # Per-mode base RTP
    sim_trials=5000,       # Trial simulations
    test_spins=[50, 100, 200],   # Test spin counts
    test_weights=[0.3, 0.4, 0.3], # Test spin weights
    score_type="rtp",      # Optimization score metric
)
```

### 10.3 Running Optimization

```bash
cd games/1_0_mining_ways
python run.py
```

This will:
1. Run 10,000 simulations per bet mode (30K total)
2. Execute Rust optimizer across all 3 modes
3. Generate analysis spreadsheets
4. Run RGS format verification tests

---

## 11. Event System & Frontend Integration

### 11.1 Event Sequence — Base Game Win Only

```json
[
  {"type": "reveal", "board": [[...]]},
  {"type": "winInfo", "ways": [...]},
  {"type": "setWin", "win": 200},
  {"type": "setTotalWin", "total": 200},
  {"type": "finalWin", "totalWin": 200}
]
```

### 11.2 Event Sequence — Free Spins Triggered

```json
[
  {"type": "reveal"},
  {"type": "freeSpinTrigger", "scatterCount": 3, "totalFreeSpins": 10},
  // For each free spin:
  {"type": "updateFreeSpin", "currentSpin": 1, "totalSpins": 10},
  {"type": "reveal"},
  {"type": "winInfo"},
  {"type": "setWin"},
  // ... more free spins ...
  {"type": "freeSpinEnd", "totalWin": 5000},
  {"type": "setTotalWin"},
  {"type": "finalWin"}
]
```

### 11.3 Event Sequence — Hold & Spin Triggered

```json
[
  {"type": "reveal"},
  {"type": "holdAndSpinTrigger",
   "totalRespins": 3,
   "moneyPositions": [{"reel":0,"row":2},{"reel":1,"row":4},...],
   "isFreeSpin": false},
  // For each respin:
  {"type": "holdAndSpinRespin",
   "respinNumber": 1,
   "respinsRemaining": 3,
   "board": [[{"name":"M","locked":true,"prize":5},...],...]},
  // ... more respins ...
  {"type": "holdAndSpinEnd",
   "totalWin": 8800,
   "jackpot": null},
  {"type": "setTotalWin"},
  {"type": "finalWin"}
]
```

### 11.4 Frontend Integration Points

The frontend should handle these custom event types:

| Event Type | Frontend Action |
|-----------|----------------|
| `holdAndSpinTrigger` | Show H&S transition animation, highlight money symbols |
| `holdAndSpinRespin` | Animate respin, reveal new money symbols, update board |
| `holdAndSpinEnd` | Show total H&S win, return to base game |
| `jackpotAwarded` | Play jackpot animation (MINI/MINOR/MAJOR/GRAND) |
| `moneySymbolReveal` | Animate individual money symbol prize reveal |

---

## 12. Test Results & Validation

### 12.1 Single Spin Tests

| Criteria | Final Win | H&S Triggered | Events Count | Status |
|----------|-----------|---------------|-------------|--------|
| basegame | 2.0x | No | 5 | ✅ |
| freegame | 65.3x | No | 82 | ✅ |
| holdnspin | 88.0x | Yes | 24 | ✅ |

### 12.2 Multi-Spin Tests (100 spins each)

| Criteria | Avg Win | Total Win | Error Count | Status |
|----------|---------|-----------|-------------|--------|
| basegame | 2.05x | 205.40x | 0 | ✅ |
| 0 (zero) | 0.00x | 0.00x | 0 | ✅ |
| freegame | 49.70x | 4,970.30x | 0 | ✅ |
| holdnspin | 196.49x | 19,648.70x | 0 | ✅ |

### 12.3 Buy Bonus Tests (50 spins each)

| Mode | Avg Win | Status |
|------|---------|--------|
| bonus_fs | 767.05x | ✅ |
| bonus_hns | 331.61x | ✅ |

### 12.4 Assertions Verified

- ✅ `basegame_wins + freegame_wins == running_bet_win` (payout mismatch check)
- ✅ `final_win <= wincap (5000x)` (win cap enforcement)
- ✅ `force_holdnspin → holdnspin_triggered` (criteria satisfaction)
- ✅ `force_freegame → triggered_freegame` (criteria satisfaction)

---

## 13. Bugs Encountered & Solutions

### Bug 1: `ModuleNotFoundError: No module named 'zstandard'`

**Cause:** The SDK uses `zstandard` for compressed LUT file handling.  
**Fix:** `pip install zstandard`

---

### Bug 2: `AttributeError: 'Symbol' object has no attribute 'jackpot_type'`

**Cause:** The SDK `Symbol` class uses `__slots__` which restricts attributes to a fixed set. Attempting to set `symbol.jackpot_type = None` failed.

**Fix:** Removed all `symbol.jackpot_type` usage. Instead, jackpot types are tracked in a dictionary on the gamestate:
```python
# In reset_book():
self.jackpot_positions = {}  # (reel, row) → jackpot_type

# In perform_holdnspin_respin():
if jackpot_type is not None:
    self.jackpot_positions[(reel_idx, row_idx)] = jackpot_type
```

---

### Bug 3: `AttributeError: 'Symbol' object has no attribute 'has_prize'`

**Cause:** The SDK only initializes `has_prize` for symbols with `"prize"` in their `special_flags`. Money symbols have `"money"` flag, not `"prize"`.

**Fix:** Two changes:
1. Check `sym.prize is not None` instead of `sym.has_prize`
2. Explicitly set `symbol.has_prize = True` after assigning prizes

---

### Bug 4: `force_special_board` Infinite Loop

**Cause:** The SDK's `force_special_board` runs `while True` trying to match exact scatter count. When reel strips had stacked special symbols (within the 6-row window), the actual count never matched the target.

**Fix:** Three-pronged approach:
1. **Reel strips regenerated** with minimum 7-position spacing between special symbols
2. **Cap scatter count** to `min(num_scatters, config.num_reels)` 
3. **Retry limit** (200 attempts) with fallback to minimum trigger count

```python
max_attempts = 200
for attempt in range(max_attempts):
    self._force_special_board(trigger_symbol, num_scatters)
    if self.count_special_symbols(trigger_symbol) == num_scatters:
        break
else:
    # Fallback to minimum trigger count
    min_trigger = min(self.config.freespin_triggers[self.gametype].keys())
    ...
```

---

### Bug 5: `AssertionError: Base + Free game payout mismatch!`

**Cause:** `win_manager.update_gametype_wins()` was called twice — once before H&S in `run_spin()` and again inside `run_hold_and_spin()`. This double-counted the ways win.

**Fix:** Restructured `run_spin()` to call `update_gametype_wins()` exactly once per spin, positioned after all features complete:

```python
if holdnspin_triggered:
    self.run_hold_and_spin(is_freespin=False)
    self.win_manager.update_gametype_wins(self.gametype)  # After H&S
elif fs_triggered:
    self.win_manager.update_gametype_wins(self.gametype)  # Before FS
    self.run_freespin_from_base()
else:
    self.win_manager.update_gametype_wins(self.gametype)  # Base only
```

Removed `update_gametype_wins` from inside `run_hold_and_spin()`.

---

## 14. How to Run

### 14.1 Prerequisites

```bash
# Python 3.12+
python --version

# Required packages
pip install zstandard

# Rust toolchain (for optimization only)
# Install from https://rustup.rs/
```

### 14.2 Quick Test — Single Spin

```python
import sys
sys.path.insert(0, ".")
sys.path.insert(0, "games/1_0_mining_ways")

from game_config import GameConfig
from gamestate import GameState

config = GameConfig()
gs = GameState(config)
gs.betmode = "base"
gs.criteria = "basegame"
gs.run_spin(0, simulation_seed=42)

print(f"Win: {gs.final_win}x")
print(f"Events: {len(gs.book.events)}")
for e in gs.book.events:
    print(f"  {e['type']}")
```

### 14.3 Multi-Spin Simulation

```python
import sys
sys.path.insert(0, ".")
sys.path.insert(0, "games/1_0_mining_ways")

from game_config import GameConfig
from gamestate import GameState

GameConfig._instance = None  # Reset singleton
config = GameConfig()
gs = GameState(config)
gs.betmode = "base"

total_win = 0
for sim in range(1000):
    gs.criteria = "basegame"
    gs.run_spin(sim, simulation_seed=sim)
    total_win += gs.final_win

print(f"Average win: {total_win / 1000:.4f}x")
```

### 14.4 Full Production Run

```bash
cd games/1_0_mining_ways
python run.py
```

This executes the complete pipeline:
1. **Simulation** — 10K spins per mode (base, bonus_fs, bonus_hns)
2. **Configuration output** — LUT files for RGS
3. **Optimization** — Rust solver tunes reel weights
4. **Analysis** — Statistics spreadsheet
5. **Verification** — RGS format checks

### 14.5 Custom Simulation Count

Edit `run.py`:
```python
num_sim_args = {
    "base": int(1e6),       # 1 million base game sims
    "bonus_fs": int(1e5),   # 100K free spin buy sims
    "bonus_hns": int(1e5),  # 100K H&S buy sims
}
```

### 14.6 Selective Pipeline

```python
run_conditions = {
    "run_sims": True,            # Generate simulation data
    "run_optimization": False,   # Skip optimization (if already done)
    "run_analysis": True,        # Generate statistics
    "run_format_checks": True,   # Verify RGS format
}
```

---

## 15. How to Integrate with Production

### 15.1 Production Integration Overview

```
┌──────────────────────────────────────────────────────────┐
│                    PRODUCTION PIPELINE                     │
│                                                          │
│  Math Engine        RGS Server        Frontend Client    │
│  ──────────        ──────────        ───────────────     │
│  run.py            Reads LUT         Renders events      │
│  ↓                 files             from JSON            │
│  Generates         ↓                 ↓                   │
│  LUT files ──────► Serves game ────► Displays game       │
│  + configs         outcomes          animations           │
└──────────────────────────────────────────────────────────┘
```

### 15.2 Step 1: Generate Production LUT Files

```bash
cd games/1_0_mining_ways

# Set production-grade simulation count
# Edit run.py: num_sim_args = {"base": int(1e7), ...}

python run.py
```

Output files are written to the game's output directory as compressed lookup tables.

### 15.3 Step 2: Upload to RGS

The `uploads/` module handles AWS deployment:

```python
from uploads.aws_upload import upload_game_data

# Upload generated LUT + config files to S3
upload_game_data(config)
```

### 15.4 Step 3: RGS Integration

The RGS (Remote Game Server) reads the LUT files to serve game outcomes:

1. **Client requests spin** → RGS receives bet mode + bet amount
2. **RGS selects outcome** → Reads from compressed LUT based on distribution weights
3. **RGS returns events** → JSON event array sent to frontend
4. **Frontend renders** → Parses event types and plays animations

### 15.5 Step 4: Frontend Event Handling

The frontend must implement handlers for these event types:

```javascript
// Standard events (already in base SDK frontend)
handleEvent("reveal", data)        // Show board
handleEvent("winInfo", data)       // Show win lines/ways
handleEvent("setWin", data)        // Update win display
handleEvent("setTotalWin", data)   // Update total win
handleEvent("finalWin", data)      // End of round

// Free Spins events
handleEvent("freeSpinTrigger", data)
handleEvent("updateFreeSpin", data)
handleEvent("freeSpinEnd", data)

// NEW: Hold & Spin events (custom for this game)
handleEvent("holdAndSpinTrigger", data) {
    // data.moneyPositions - array of {reel, row}
    // data.totalRespins - number
    // data.isFreeSpin - boolean
    showHoldAndSpinTransition();
    highlightMoneySymbols(data.moneyPositions);
}

handleEvent("holdAndSpinRespin", data) {
    // data.board - full board state with locked/prize info
    // data.newMoneyPositions - newly landed money symbols
    // data.respinsRemaining - number
    // data.multiplier - number (optional, FS only)
    animateRespin(data);
    revealNewMoney(data.newMoneyPositions);
    updateRespinCounter(data.respinsRemaining);
}

handleEvent("holdAndSpinEnd", data) {
    // data.totalWin - number (in cents)
    // data.jackpot - string or null ("GRAND", "MAJOR", etc.)
    // data.finalMultiplier - number (optional)
    showTotalWin(data.totalWin / 100);
    if (data.jackpot) showJackpotAnimation(data.jackpot);
}

handleEvent("jackpotAwarded", data) {
    // data.jackpotType - "MINI" | "MINOR" | "MAJOR" | "GRAND"
    // data.jackpotValue - number (in cents)
    showJackpotCelebration(data.jackpotType, data.jackpotValue / 100);
}
```

### 15.6 Step 5: RGS Verification

```python
from utils.rgs_verification import execute_all_tests
execute_all_tests(config)
```

This validates:
- LUT file format correctness
- Event schema compliance
- Win cap enforcement
- Distribution quota accuracy

### 15.7 Configuration Files for RGS

The `generate_configs()` function creates JSON configuration files that the RGS needs:

```json
{
  "game_id": "1_0_mining_ways",
  "bet_modes": [
    {
      "name": "base",
      "cost": 1.0,
      "rtp": 0.96,
      "max_win": 5000,
      "is_buybonus": false
    },
    {
      "name": "bonus_fs",
      "cost": 80.0,
      "rtp": 0.96,
      "max_win": 5000,
      "is_buybonus": true
    },
    {
      "name": "bonus_hns",
      "cost": 100.0,
      "rtp": 0.96,
      "max_win": 5000,
      "is_buybonus": true
    }
  ],
  "paytable": {...},
  "special_symbols": {...}
}
```

---

## 16. Configuration Reference

### 16.1 All Configurable Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `game_id` | `"1_0_mining_ways"` | Unique game identifier |
| `wincap` | `5000` | Maximum win multiplier |
| `win_type` | `"ways"` | Win evaluation method |
| `rtp` | `0.96` | Target return to player |
| `num_reels` | `5` | Number of reels |
| `num_rows` | `[6,6,6,6,6]` | Rows per reel |
| `include_padding` | `True` | Include padding rows in board |
| `holdnspin_trigger_count` | `6` | Minimum money for H&S |
| `holdnspin_initial_respins` | `3` | Starting respins |
| `holdnspin_total_positions` | `30` | Full grid size |
| `holdnspin_money_prob` | `0.10` | Default per-position chance |
| `money_jackpot_prob` | `0.005` | Jackpot chance per M symbol |
| `fs_holdnspin_mult_growth` | `1` | Multiplier growth per round |

### 16.2 Modifying Parameters

To adjust game balance, edit `game_config.py`:

**Change paytable values:**
```python
self.paytable = {
    (5, "DRI"): 10,  # Was 8, now 10x for 5-of-kind
    ...
}
```

**Change H&S trigger count:**
```python
self.holdnspin_trigger_count = 5  # Was 6, now triggers with 5 money
```

**Change money value distribution:**
```python
self.money_values_base = {
    1: 30,   # Reduce 1x weight
    2: 30,   # Increase 2x weight
    3: 20,   # Increase 3x weight
    ...
}
```

**Add new jackpot tier:**
```python
self.jackpot_values["MEGA"] = 500  # New 500x jackpot
self.jackpot_weights["MEGA"] = 5   # 5 weight in selection
```

> ⚠️ After any configuration change, re-run `python run.py` to regenerate simulation data and optimize.

---

## 17. FAQ

### General

**Q: What makes this game different from the standard `0_0_ways` template?**  
A: This game adds three major features not in the template: (1) Hold & Spin with locked money symbols and respins, (2) Fixed Jackpots (MINI/MINOR/MAJOR/GRAND), and (3) Money symbol prize assignment. It also supports Hold & Spin triggering within Free Spins with a growing multiplier mechanic.

**Q: How many total ways to win are there?**  
A: 7,776 ways. With 5 reels and 6 rows per reel: $6^5 = 7,776$ ways.

**Q: What is the maximum possible win?**  
A: 5,000x bet. Capped by `config.wincap = 5000`.

**Q: What is the hit frequency?**  
A: Target ~24% (approximately 1 in 4.1 spins produces a win in base game).

---

### Features

**Q: Can Free Spins and Hold & Spin trigger simultaneously?**  
A: No. In the base game, if both conditions are met (3+ scatters AND 6+ money), Free Spins takes priority. However, Hold & Spin CAN trigger during Free Spins on subsequent spins.

**Q: How does the GRAND jackpot work?**  
A: GRAND (1000x) is awarded only when ALL 30 positions (5×6 grid) are filled with locked money symbols during Hold & Spin. It is NOT part of the random jackpot selection — it's triggered by the full grid condition.

**Q: Can you retrigger Free Spins?**  
A: Yes. Landing 3+ scatters during Free Spins awards additional spins: 3S→+5, 4S→+10, 5S→+15.

**Q: What happens if you hit wincap during Hold & Spin?**  
A: The H&S loop breaks immediately when `running_bet_win >= wincap`.

**Q: How does the growing multiplier work during Free Spin H&S?**  
A: When H&S triggers within Free Spins, the multiplier starts at 1x and increases by +1 each respin round. So round 1=2x, round 2=3x, etc. The final H&S win is multiplied by this accumulated value.

---

### Technical

**Q: Why can't I add attributes to Symbol objects?**  
A: The SDK `Symbol` class uses `__slots__` for performance. Only these attributes exist: `defn`, `explode`, `locked`, `scatter`, `wild`, `has_multiplier`, `multiplier`, `has_prize`, `prize`. Use external dictionaries (like `self.jackpot_positions`) to track additional data.

**Q: Why does the game use a singleton config?**  
A: The `GameConfig._instance` pattern ensures only one config exists per process, matching SDK expectations. Reset with `GameConfig._instance = None` between test runs.

**Q: How does `force_special_board` work?**  
A: The SDK method randomly selects reel stop positions where the target symbol exists, then draws the board from those positions. It's designed for 1 special per reel max. Our game caps scatter forcing to 5 (one per reel) with a retry limit.

**Q: Why are there 4 reel strip files?**  
A: Different game phases need different symbol distributions:
- **BR0** — Balanced for base game (lower special symbol frequency)
- **FR0** — More wilds and money for free game (higher volatility)
- **FRWCAP** — Heavy wilds for wincap scenarios (near-maximum win potential)
- **HR0** — Auxiliary strip for H&S (low symbols + money only)

**Q: How do I change the number of simulations?**  
A: Edit `num_sim_args` in `run.py`. For production: use `int(1e7)` (10 million). For testing: use `int(1e3)` (1,000).

**Q: What is the optimization program?**  
A: A Rust-based solver that tunes reel strip weights to achieve target RTP splits. It reads simulation data, adjusts distribution quotas, and outputs optimized configurations.

---

### Running & Debugging

**Q: I get `ModuleNotFoundError: No module named 'zstandard'`**  
A: Run `pip install zstandard`.

**Q: The game hangs during Free Spin criteria simulation**  
A: This was a known bug with `force_special_board` infinite loops. It's been fixed with retry limits and properly spaced reel strips. Ensure you're using the latest version of `gamestate.py` and the regenerated reel CSVs.

**Q: I see `Base + Free game payout mismatch!` assertion error**  
A: This was caused by double-counting wins. Fixed by calling `update_gametype_wins()` exactly once per spin. Ensure you're using the latest `gamestate.py`.

**Q: How do I test a specific bet mode?**  
A:
```python
gs.betmode = "bonus_fs"   # or "bonus_hns" or "base"
gs.criteria = "freegame"  # must match the mode's distribution criteria
gs.run_spin(0, simulation_seed=42)
```

**Q: Can I run simulations in parallel?**  
A: Yes, the SDK supports multi-threading via `num_threads` in `run.py`. Each thread gets its own gamestate instance.

---

### Production

**Q: How do I deploy this to production?**  
A: See [Section 15](#15-how-to-integrate-with-production). Summary: (1) Run full simulations, (2) Generate LUT files, (3) Upload to RGS via AWS, (4) Frontend handles events.

**Q: What files does the RGS need?**  
A: The RGS needs the compressed LUT files (generated by `create_books()`), the game config JSON (generated by `generate_configs()`), and the reel strip CSVs.

**Q: How do I add a new bet mode?**  
A: Add a new `BetMode()` entry in `game_config.py`'s `self.bet_modes` list with appropriate distributions, then add the mode name to `target_modes` in `run.py`.

**Q: What RTP verification exists?**  
A:
1. **Simulation-level:** `update_final_win()` asserts `base + free == total` every spin
2. **Optimization-level:** Rust solver verifies target RTP achievement
3. **Post-generation:** `execute_all_tests()` validates LUT file format and win distribution

---

## 18. Glossary

| Term | Definition |
|------|-----------|
| **Ways** | Win evaluation where matching symbols on adjacent reels (left-to-right) form wins regardless of row position |
| **LUT** | Look-Up Table — compressed files containing pre-computed game outcomes |
| **RGS** | Remote Game Server — serves game outcomes to frontend clients |
| **RTP** | Return To Player — the percentage of wagered money returned over time |
| **H&S** | Hold & Spin — bonus feature where money symbols lock and respins occur |
| **Wincap** | Maximum win multiplier (5,000x for this game) |
| **Distribution** | A probability bucket that determines what type of outcome a spin produces |
| **Criteria** | The outcome type assigned to a simulation (basegame, freegame, holdnspin, 0, wincap) |
| **BetMode** | A playable mode with its own cost and distribution set (base, bonus_fs, bonus_hns) |
| **Quota** | The probability of a distribution being selected (e.g., freegame = 8% in base mode) |
| **Fence** | Optimization boundary for win bucketing |
| **Symbol Storage** | SDK component that maps symbol names to Symbol class instances |
| **Book** | Data container for a single simulation's events and outcomes |
| **Imprint** | Final step that writes simulation results to the library for LUT generation |

---

*End of Report*
