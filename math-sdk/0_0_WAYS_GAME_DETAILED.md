# 0_0_Ways Game - Comprehensive Technical Documentation

## Table of Contents
1. [Game Overview](#game-overview)
2. [Game Specifications](#game-specifications)
3. [File Structure](#file-structure)
4. [Component Deep Dive](#component-deep-dive)
5. [Game Flow & Logic](#game-flow--logic)
6. [Configuration Details](#configuration-details)
7. [Reel Strip Analysis](#reel-strip-analysis)
8. [Optimization Setup](#optimization-setup)
9. [Output Files](#output-files)
10. [How to Modify & Extend](#how-to-modify--extend)

---

## Game Overview

**0_0_ways** is a sample "ways-to-win" slot game that demonstrates the core functionality of the Stake Engine Math SDK. It serves as a reference implementation and template for creating ways-based slot games.

### Core Features
- **5 reels × 3 rows** (243 ways to win)
- **9 paying symbols**: H1-H5 (high-value), L1-L4 (low-value)
- **1 Wild symbol**: W (substitutes for paying symbols)
- **1 Scatter symbol**: S (triggers freespins)
- **Freespin feature**: Triggered by 3+ scatters
- **Multiplier wilds**: In freegame only, multipliers on wilds (1x-5x)
- **Win cap**: 5000x bet

### Game Modes
1. **Base Mode** (cost: 1.0, RTP: 97%)
   - Standard gameplay with freespin triggers
   
2. **Bonus Mode** (cost: 100.0, RTP: 97%)
   - "Buy bonus" - direct entry to freegame

---

## Game Specifications

### Symbols

#### Paying Symbols Paytable
| Symbol | 5-of-a-kind | 4-of-a-kind | 3-of-a-kind |
|--------|-------------|-------------|-------------|
| H1     | 10.0x       | 5.0x        | 3.0x        |
| H2     | 8.0x        | 4.0x        | 2.0x        |
| H3     | 5.0x        | 2.0x        | 1.0x        |
| H4     | 3.0x        | 1.0x        | 0.5x        |
| H5     | 2.0x        | 0.8x        | 0.4x        |
| L1     | 2.0x        | 0.8x        | 0.4x        |
| L2     | 1.5x        | 0.5x        | 0.2x        |
| L3     | 1.5x        | 0.5x        | 0.2x        |
| L4     | 1.0x        | 0.3x        | 0.1x        |

#### Special Symbols
- **Wild (W)**:
  - Substitutes for all paying symbols
  - Does NOT appear on reel 1 in basegame
  - In freegame: carries multipliers (1x-5x)
  - Multipliers compound multiplicatively
  
- **Scatter (S)**:
  - Triggers freespin feature
  - Maximum 1 scatter per reel
  - Counts anywhere on reels (not position-dependent)

### Freespin Triggers

**From Basegame:**
- 3 Scatters → 10 free spins
- 4 Scatters → 15 free spins
- 5 Scatters → 20 free spins

**From Freegame (retrigger):**
- 2 Scatters → 4 additional free spins
- 3 Scatters → 6 additional free spins
- 4 Scatters → 8 additional free spins
- 5 Scatters → 10 additional free spins

### Anticipation Triggers
- **Basegame**: 2 scatters triggers anticipation effect
- **Freegame**: 1 scatter triggers anticipation effect

---

## File Structure

```
games/0_0_ways/
│
├── game_config.py              # Game configuration (reels, paytable, RTP, etc.)
├── gamestate.py                # Main game logic (spin flow, freespin flow)
├── game_executables.py         # Win evaluation (ways calculation)
├── game_calculations.py        # Custom calculations (extends base)
├── game_events.py              # Event definitions (imports from src)
├── game_override.py            # Game-specific overrides (multipliers, etc.)
├── game_optimization.py        # Optimization constraints and parameters
├── run.py                      # Main execution script
├── readme.txt                  # Game description
│
├── reels/                      # Reel strip definitions
│   ├── BR0.csv                 # Basegame reel (251 stops)
│   ├── FR0.csv                 # Freegame reel (183 stops)
│   └── FRWCAP.csv              # Freegame wincap-focused reel
│
└── library/                    # Generated output files
    ├── configs/                # Configuration JSON files
    ├── lookup_tables/          # Bet mapping tables (CSV)
    ├── books/                  # Compressed simulation results
    ├── optimization_files/     # Optimization results
    ├── publish_files/          # Production-ready files
    └── statistics_summary.json # Statistical analysis
```

---

## Component Deep Dive

### 1. `game_config.py` - Game Configuration

This is the central configuration file that defines all game parameters.

#### Key Components:

```python
class GameConfig(Config):
    """Game specific configuration class."""
    
    def __init__(self):
        super().__init__()
        # Game Identity
        self.game_id = "0_0_ways"
        self.provider_number = 0
        self.working_name = "sample ways game"
        self.wincap = 5000
        self.win_type = "ways"
        self.rtp = 0.97
```

**Inheritance Chain:**
`GameConfig` → `Config` (from `src/config/config.py`)

**What It Defines:**
1. **Game Identity**: ID, name, provider information
2. **Game Dimensions**: Number of reels (5), rows per reel ([3,3,3,3,3])
3. **Paytable**: All symbol payouts
4. **Special Symbols**: Wild, scatter, multiplier definitions
5. **Freespin Triggers**: Scatter counts needed for feature entry
6. **Reel Strips**: Loaded from CSV files
7. **Bet Modes**: Base and bonus mode configurations
8. **Distributions**: Segmented outcome categories for optimization

#### Bet Modes Configuration:

**Base Mode:**
```python
BetMode(
    name="base",
    cost=1.0,
    rtp=self.rtp,
    max_win=5000,
    distributions=[...]
)
```

Has 4 distributions:
1. **Wincap Distribution** (0.1% quota):
   - Forces high wins at wincap
   - Uses wincap-focused freegame reel (FRWCAP)
   - Higher multiplier values (up to 5x)

2. **Freegame Distribution** (10% quota):
   - Forces freegame entry
   - Normal freegame reel (FR0)
   - Balanced multiplier distribution

3. **Zero Distribution** (40% quota):
   - Non-winning spins
   - Basegame reel only
   - No multipliers (value locked to 1)

4. **Basegame Distribution** (50% quota):
   - Regular basegame wins
   - May or may not trigger freegame naturally

**Bonus Mode:**
```python
BetMode(
    name="bonus",
    cost=100.0,
    rtp=self.rtp,
    max_win=5000,
    is_buybonus=True,
    distributions=[
        Distribution(criteria="freegame", quota=1)
    ]
)
```

Has 1 distribution:
- **100% freegame**: Direct entry to bonus feature

---

### 2. `gamestate.py` - Game Logic Flow

This file defines the game's execution flow.

```python
class GameState(GameStateOverride):
    """Handle basegame and freegame logic."""
    
    def run_spin(self, sim: int, simulation_seed=None) -> None:
        """Main basegame spin logic."""
        self.reset_seed(sim)
        self.repeat = True
        
        while self.repeat:
            self.reset_book()
            self.draw_board(emit_event=True)      # Draw symbols on reels
            self.evaluate_ways_board()             # Calculate wins
            self.win_manager.update_gametype_wins(self.gametype)
            
            # Check for freespin trigger
            if self.check_fs_condition() and self.check_freespin_entry():
                self.run_freespin_from_base()
            
            self.evaluate_finalwin()
            self.check_repeat()  # Verify distribution conditions met
        
        self.imprint_wins()  # Record to library
    
    def run_freespin(self) -> None:
        """Freegame spin logic."""
        self.reset_fs_spin()
        
        while self.fs < self.tot_fs:
            self.update_freespin()
            self.draw_board(emit_event=True)
            self.evaluate_ways_board()
            
            # Check for retrigger
            if self.check_fs_condition():
                self.update_fs_retrigger_amt()
            
            self.win_manager.update_gametype_wins(self.gametype)
        
        self.end_freespin()
```

**Inheritance Chain:**
`GameState` → `GameStateOverride` → `GameExecutables` → `GameCalculations` → `Executables` → `Conditions` → `GeneralGameState`

**Key Methods:**
- `run_spin()`: Main basegame loop
- `run_freespin()`: Freespin feature loop
- `draw_board()`: Populates board with symbols from reels
- `evaluate_ways_board()`: Calculates ways-to-win wins
- `check_fs_condition()`: Checks scatter count for freespin trigger
- `check_repeat()`: Ensures distribution constraints are satisfied

---

### 3. `game_executables.py` - Win Evaluation

```python
class GameExecutables(GameCalculations):
    """Events specific to 'ways' wins"""
    
    def evaluate_ways_board(self):
        """Populate win-data, record wins, transmit events"""
        # Calculate ways wins using src/calculations/ways.py
        self.win_data = Ways.get_ways_data(self.config, self.board)
        
        if self.win_data["totalWin"] > 0:
            Ways.record_ways_wins(self)
            self.win_manager.update_spinwin(self.win_data["totalWin"])
        
        Ways.emit_wayswin_events(self)
```

**Purpose:**
- Interfaces with `src/calculations/ways.py` to calculate wins
- Records wins to book
- Emits events for frontend

**Ways Calculation Flow:**
1. `Ways.get_ways_data()` scans board left-to-right
2. For each paying symbol, counts "ways" (adjacent occurrences)
3. Considers wilds as substitutes
4. Applies multipliers (in freegame)
5. Returns total win and win details

---

### 4. `game_override.py` - Custom Game Behavior

```python
class GameStateOverride(GameExecutables):
    """Override or extend universal state.py functions."""
    
    def assign_special_sym_function(self):
        """Define what happens when special symbols are drawn."""
        self.special_symbol_functions = {"W": [self.assign_mult_property]}
    
    def assign_mult_property(self, symbol):
        """Assign multiplier to wild symbols using distribution probabilities."""
        multiplier_value = get_random_outcome(
            self.get_current_distribution_conditions()["mult_values"]
        )
        symbol.assign_attribute({"multiplier": multiplier_value})
    
    def check_game_repeat(self):
        """Verify simulation satisfied distribution conditions."""
        if self.repeat is False:
            win_criteria = self.get_current_betmode_distributions().get_win_criteria()
            if win_criteria is not None and self.final_win != win_criteria:
                self.repeat = True
```

**Purpose:**
- Defines custom symbol behaviors (multiplier assignment)
- Implements game-specific validation logic
- Overrides base class methods when needed

**Key Customizations:**
- **Multiplier Assignment**: Wild symbols get random multipliers based on distribution's `mult_values`
- **Repeat Logic**: Ensures wincap distributions actually produce wincap wins

---

### 5. `game_optimization.py` - Optimization Configuration

This defines the constraints and parameters for the optimization algorithm.

```python
class OptimizationSetup:
    def __init__(self, game_config):
        self.game_config = game_config
        self.game_config.opt_params = {
            "base": {
                "conditions": {
                    "wincap": ConstructConditions(
                        rtp=0.01,           # 1% RTP from wincap hits
                        av_win=5000,        # Average win of 5000x
                        search_conditions=5000
                    ),
                    "freegame": ConstructConditions(
                        rtp=0.37,           # 37% RTP from freegame
                        hr=200,             # Hit rate of 1/200 (0.5%)
                        search_conditions={"symbol": "scatter"}
                    ),
                    "basegame": ConstructConditions(
                        hr=3.5,             # Hit rate of ~28.6%
                        rtp=0.59            # 59% RTP from basegame
                    ),
                    "0": ConstructConditions(
                        rtp=0,
                        av_win=0,
                        search_conditions=0
                    )
                },
                "scaling": [...],
                "parameters": {...},
                "distribution_bias": {...}
            },
            "bonus": {...}
        }
```

**Key Concepts:**

1. **Conditions**: Target RTP/HR for each distribution
2. **Scaling**: Bias towards/away from specific win ranges
3. **Parameters**: Algorithm tuning (iterations, population size, etc.)
4. **Distribution Bias**: Weight towards certain outcome ranges

**Optimization Goals:**
- **Total RTP**: 97% (sum of all distribution RTPs)
- **Wincap**: 1% RTP, very rare, high wins
- **Freegame**: 37% RTP, rare (1/200), average ~74x
- **Basegame**: 59% RTP, common win rate (28.6%)
- **Zero**: 0% RTP, losing spins

---

### 6. `run.py` - Main Execution Script

```python
if __name__ == "__main__":
    num_threads = 10
    rust_threads = 20
    batching_size = 50000
    compression = True
    
    num_sim_args = {
        "base": int(1e4),    # 10,000 simulations for base mode
        "bonus": int(1e4),   # 10,000 simulations for bonus mode
    }
    
    run_conditions = {
        "run_sims": True,           # Run simulations
        "run_optimization": True,    # Run optimization
        "run_analysis": True,        # Generate statistics
        "run_format_checks": True,   # Validate output
    }
    
    config = GameConfig()
    gamestate = GameState(config)
    
    # Phase 1: Simulation
    if run_conditions["run_sims"]:
        create_books(gamestate, config, num_sim_args, ...)
    
    # Phase 2: Generate Configs
    generate_configs(gamestate)
    
    # Phase 3: Optimization
    if run_conditions["run_optimization"]:
        OptimizationExecution().run_all_modes(config, target_modes, ...)
    
    # Phase 4: Analysis
    if run_conditions["run_analysis"]:
        create_stat_sheet(gamestate, custom_keys=[{"symbol": "scatter"}])
    
    # Phase 5: Validation
    if run_conditions["run_format_checks"]:
        execute_all_tests(config)
```

**Execution Flow:**
1. **Initialize**: Create config and gamestate objects
2. **Simulate**: Generate books of game outcomes
3. **Configure**: Write configuration files
4. **Optimize**: Find optimal lookup table mappings
5. **Analyze**: Generate statistical summaries
6. **Validate**: Check RGS compliance

---

## Game Flow & Logic

### Basegame Flow

```
START
  ↓
Reset seed & book
  ↓
┌─────────────────┐
│ REPEAT LOOP     │ ← Ensures distribution conditions met
│                 │
│ 1. Reset book   │
│ 2. Draw board   │ ← Spin reels
│ 3. Evaluate wins│ ← Calculate ways wins
│ 4. Check scatter│
│    ↓            │
│    If 3+ → FS   │ ── → RUN FREESPIN LOOP
│    ↓            │       ↓
│ 5. Final win    │    ← Return
│ 6. Check repeat │
│    conditions   │
└─────────────────┘
  ↓
Imprint wins to library
  ↓
END
```

### Freespin Flow

```
START FREESPIN
  ↓
Set tot_fs (from trigger count)
  ↓
┌──────────────────────┐
│ WHILE fs < tot_fs    │
│                      │
│ 1. Update spin count │
│ 2. Draw board        │ ← Spin freegame reels
│ 3. Evaluate wins     │ ← Calculate ways wins
│ 4. Check scatter     │
│    ↓                 │
│    If 2+ → Retrigger │ ← Add more free spins
│    ↓                 │
│ 5. Update total wins │
└──────────────────────┘
  ↓
End freespin
  ↓
RETURN TO BASEGAME
```

### Symbol Drawing Process

```
draw_board():
1. Get reel weights from distribution conditions
2. Select reel strip (BR0, FR0, or FRWCAP)
3. For each reel (0 to 4):
   a. Choose random stop position
   b. Extract num_rows symbols from that position
   c. Create Symbol objects
   d. Apply special symbol functions (e.g., assign multipliers)
4. Populate self.board[reel][row] with Symbol objects
5. Emit boardPopulated event
```

### Ways Win Calculation

```
evaluate_ways_board():
1. Call Ways.get_ways_data(config, board)
   a. Scan left-to-right (reel 0 → 4)
   b. For each symbol on reel 0:
      - Count consecutive reels with matching symbol or wild
      - If 3+ reels → Calculate ways count
      - ways = product of symbol counts on each reel
      - win = paytable_value × ways × multipliers
   c. Sum all wins
2. If totalWin > 0:
   - Record wins to book
   - Update spin win
3. Emit win events
```

---

## Configuration Details

### Distribution System

The game uses a **distribution system** to segment outcomes into categories for optimization:

**Base Mode Distributions:**

| Distribution | Quota | Description | Conditions |
|-------------|-------|-------------|-----------|
| wincap | 0.1% | High wins at wincap threshold | force_wincap=True, FRWCAP reel, high mult values |
| freegame | 10% | Rounds triggering freespin | force_freegame=True, FR0 reel, balanced mults |
| 0 | 40% | Non-winning spins | force_wincap=False, force_freegame=False, mult=1 |
| basegame | 50% | Regular basegame wins | force_wincap=False, force_freegame=False |

**Distribution Conditions:**

Each distribution can specify:
- **reel_weights**: Which reel strip to use (and probabilities if multiple)
- **force_wincap**: Force outcome to be exactly wincap (5000x)
- **force_freegame**: Force scatter trigger
- **scatter_triggers**: Weighted probabilities for 3/4/5 scatters
- **mult_values**: Weighted probabilities for multiplier values

Example:
```python
"mult_values": {1: 200, 2: 100, 3: 80, 4: 50, 5: 20}
# 200 chances for 1x, 100 for 2x, 80 for 3x, 50 for 4x, 20 for 5x
# Total: 450, so P(1x) = 200/450 = 44.4%, etc.
```

---

## Reel Strip Analysis

### BR0.csv (Basegame Reel) - 251 stops

**Symbol Distribution:**

| Symbol | Reel 1 | Reel 2 | Reel 3 | Reel 4 | Reel 5 |
|--------|--------|--------|--------|--------|--------|
| H1     | 4      | 10     | 8      | 7      | 8      |
| H2     | 11     | 9      | 14     | 13     | 13     |
| H3     | 14     | 14     | 15     | 14     | 14     |
| H4     | 18     | 18     | 16     | 16     | 16     |
| H5     | 22     | 21     | 22     | 22     | 21     |
| L1     | 35     | 33     | 33     | 33     | 35     |
| L2     | 34     | 34     | 36     | 35     | 34     |
| L3     | 38     | 38     | 37     | 36     | 37     |
| L4     | 39     | 38     | 36     | 38     | 39     |
| W      | 0      | 10     | 11     | 11     | 10     |
| S      | 36     | 26     | 23     | 26     | 24     |

**Key Characteristics:**
- **No wilds on reel 1** (standard ways game practice)
- **Balanced scatter distribution** across all reels
- **Higher frequency of low-value symbols** (L1-L4)
- **Progressive rarity**: H1 rarest, L4 most common

### FR0.csv (Freegame Reel) - 183 stops

**Changes from BR0:**
- **Wilds appear on reel 2** at positions [9, 10, 11, 18, 37] = 5 out of 183
- **Wilds get multipliers** (1x-5x) assigned dynamically
- **Same basic symbol distribution** (proportionally adjusted)
- **Scatter frequency maintained** for retrigger potential

### FRWCAP.csv (Wincap-Focused Freegame Reel)

Used specifically for the wincap distribution:
- **Increased high-value symbols** (H1, H2, H3)
- **More wilds** on reels 2-5
- **Higher multiplier probabilities** (1: 20, 2: 50, 3: 80, 4: 100, 5: 20)
- **Designed to produce wins near wincap threshold**

---

## Optimization Setup

### Target RTP Breakdown

**Total RTP: 97%**

Contribution by distribution:
- Wincap: 1% RTP (0.01)
- Freegame: 37% RTP (0.37)
- Basegame: 59% RTP (0.59)
- Zero: 0% RTP (0.00)

### Hit Rates

- **Basegame wins**: ~28.6% (HR = 3.5 means 1 in 3.5 spins)
- **Freegame trigger**: ~0.5% (HR = 200 means 1 in 200 spins)

### Scaling Factors

The optimization can bias towards/away from win ranges:

**Basegame Scaling:**
```python
{"criteria": "basegame", "scale_factor": 1.2, "win_range": (1, 2)}
# Increase probability of 1x-2x wins by 20%

{"criteria": "basegame", "scale_factor": 1.5, "win_range": (10, 20)}
# Increase probability of 10x-20x wins by 50%
```

**Freegame Scaling:**
```python
{"criteria": "freegame", "scale_factor": 0.8, "win_range": (1000, 2000)}
# Decrease probability of 1000x-2000x wins by 20%

{"criteria": "freegame", "scale_factor": 1.2, "win_range": (3000, 4000)}
# Increase probability of 3000x-4000x wins by 20%
```

### Optimization Parameters

```python
ConstructParameters(
    num_show=5000,          # Show top 5000 candidates per generation
    num_per_fence=10000,    # 10,000 candidates per fence zone
    min_m2m=4,              # Minimum match-to-match distance
    max_m2m=8,              # Maximum match-to-match distance
    pmb_rtp=1.0,            # PMB RTP target
    sim_trials=5000,        # Simulation trials per candidate
    test_spins=[50, 100, 200],
    test_weights=[0.3, 0.4, 0.3],
    score_type="rtp"        # Optimize for RTP accuracy
)
```

---

## Output Files

After running simulations and optimization, the `library/` directory contains:

### 1. Configuration Files (`configs/`)

**config.json**: Main game configuration
```json
{
    "gameID": "0_0_ways",
    "rtp": 97.0,
    "wincap": 5000,
    "bookShelfConfig": [
        {
            "name": "base",
            "cost": 1.0,
            "maxWin": 5000,
            "bookLength": 10000,
            "tables": [...],
            "booksFile": "books_base.jsonl.zst"
        },
        {
            "name": "bonus",
            "cost": 100.0,
            ...
        }
    ]
}
```

**event_config_base.json**: Event definitions for basegame
**event_config_bonus.json**: Event definitions for bonus mode
**math_config.json**: Mathematical model configuration

### 2. Lookup Tables (`lookup_tables/`)

**lookUpTable_base.csv**: Maps spin outcomes to book indices for base mode
**lookUpTable_bonus.csv**: Maps spin outcomes to book indices for bonus mode

Format:
```
index,bookID,RTP,HR,average_win
0,4523,0.0,0,0.0
1,7821,0.95,1,0.95
2,1234,1.50,1,1.50
...
```

### 3. Books (`books/` and `publish_files/`)

**books_base.jsonl.zst**: Compressed simulation results (base mode)
**books_bonus.jsonl.zst**: Compressed simulation results (bonus mode)

Each book entry contains:
```json
{
    "bookID": 1234,
    "board": [[...], [...], ...],
    "events": [...],
    "finalWin": 15.5,
    "freespinData": {...}
}
```

### 4. Optimization Files (`optimization_files/`)

**base_0_1.csv** through **base_0_10.csv**: Optimization results per distribution
**trial_results/**: Detailed optimization trial data

### 5. Statistics (`statistics_summary.json`)

```json
{
    "base": {
        "rtp": 97.02,
        "hit_rate": 0.286,
        "std_dev": 11.19,
        "max_win": 5000,
        "distribution_breakdown": {
            "wincap": {"rtp": 1.01, "count": 10},
            "freegame": {"rtp": 37.15, "count": 1050},
            ...
        },
        "symbol_statistics": {
            "scatter": {"frequency": 0.005, "avg_win": 74.2}
        }
    }
}
```

---

## How to Modify & Extend

### Change RTP Target

**In `game_config.py`:**
```python
self.rtp = 0.95  # Change from 0.97 to 0.95 (95% RTP)
```

**In `game_optimization.py`:**
Adjust distribution RTPs to sum to new target:
```python
"wincap": ConstructConditions(rtp=0.01, ...),
"freegame": ConstructConditions(rtp=0.35, ...),  # Reduced from 0.37
"basegame": ConstructConditions(rtp=0.59, ...),
```

### Modify Paytable

**In `game_config.py`:**
```python
self.paytable = {
    (5, "H1"): 15,  # Increased from 10
    (4, "H1"): 7,   # Increased from 5
    (3, "H1"): 4,   # Increased from 3
    # ... adjust other symbols
}
```

**Note:** After changing paytable, you must:
1. Re-run simulations
2. Re-run optimization (to hit new RTP targets)

### Add New Reel Strip

**1. Create CSV file in `reels/` directory:**
```csv
# reels/BR1.csv
H1,L1,L2,L3,L4
H2,L2,L3,L4,L1
...
```

**2. Register in `game_config.py`:**
```python
reels = {
    "BR0": "BR0.csv",
    "BR1": "BR1.csv",  # New reel
    "FR0": "FR0.csv",
    "FRWCAP": "FRWCAP.csv"
}
```

**3. Use in distributions:**
```python
Distribution(
    criteria="basegame",
    conditions={
        "reel_weights": {
            self.basegame_type: {"BR0": 0.7, "BR1": 0.3}  # 70/30 split
        }
    }
)
```

### Adjust Multiplier Distribution

**In `game_config.py`, within distribution conditions:**
```python
"mult_values": {1: 100, 2: 80, 3: 60, 4: 40, 5: 20}
# Changed from {1: 200, 2: 100, 3: 80, 4: 50, 5: 20}
# Now more biased towards higher multipliers
```

### Change Freespin Triggers

**In `game_config.py`:**
```python
self.freespin_triggers = {
    self.basegame_type: {3: 12, 4: 18, 5: 25},  # Increased spin counts
    self.freegame_type: {2: 5, 3: 8, 4: 10, 5: 15},
}
```

### Add Custom Game Logic

**In `game_override.py`:**
```python
def custom_win_modifier(self):
    """Example: Double all wins during certain conditions."""
    if self.fs > 5:  # After 5 free spins
        self.win_data["totalWin"] *= 2
```

Call in `gamestate.py`:
```python
def run_freespin(self):
    # ... existing code ...
    self.evaluate_ways_board()
    self.custom_win_modifier()  # Add custom logic
    # ... rest of code ...
```

### Change Simulation Count

**In `run.py`:**
```python
num_sim_args = {
    "base": int(1e5),    # Increased from 1e4 to 1e5 (100,000 sims)
    "bonus": int(1e5),
}
```

**Note:** More simulations = more accurate statistics but longer runtime

### Adjust Optimization Parameters

**In `game_optimization.py`:**
```python
"parameters": ConstructParameters(
    num_show=10000,       # Increased from 5000
    num_per_fence=20000,  # Increased from 10000
    min_m2m=3,            # Reduced from 4
    max_m2m=10,           # Increased from 8
    sim_trials=10000,     # Increased from 5000
    score_type="rtp"
)
```

---

## Best Practices

1. **Always re-run full pipeline** after config changes:
   - Simulations → Optimization → Analysis → Validation

2. **Test incrementally**:
   - Start with small simulation counts (1e3) for testing
   - Increase to production levels (1e6+) once validated

3. **Verify RTP targets**:
   - Check `statistics_summary.json` after optimization
   - Ensure distribution RTPs sum to target

4. **Monitor hit rates**:
   - Ensure game is playable (not too volatile or boring)
   - Basegame HR typically 20-40%

5. **Document changes**:
   - Update `readme.txt` with game changes
   - Version control configurations

---

## Troubleshooting

### Issue: RTP Not Converging

**Symptoms:** After optimization, RTP is far from target (e.g., 95% instead of 97%)

**Solutions:**
1. Check that distribution RTPs sum to target RTP
2. Increase `sim_trials` in optimization parameters
3. Verify reel strips have sufficient symbol variety
4. Check paytable values are reasonable

### Issue: High Wins Not Appearing

**Symptoms:** No wins near wincap in output

**Solutions:**
1. Verify wincap distribution has correct conditions:
   - `force_wincap: True`
   - FRWCAP reel selected
   - High multiplier values configured
2. Increase wincap distribution quota (from 0.001 to 0.002)
3. Check FRWCAP reel has high-value symbols

### Issue: Freespin Not Triggering

**Symptoms:** Freegame distribution has 0 or very few entries

**Solutions:**
1. Check scatter symbols present on all reels
2. Verify `freespin_triggers` configured correctly
3. Ensure `force_freegame: True` in freegame distribution
4. Check `scatter_triggers` weighting in distribution conditions

### Issue: Books File Corrupted

**Symptoms:** Cannot decompress `.jsonl.zst` files

**Solutions:**
1. Re-run simulations with `compression=True`
2. Check disk space during simulation
3. Verify zstandard library installed correctly

---

## Conclusion

The **0_0_ways** game demonstrates a complete, production-ready slot game implementation using the Stake Engine Math SDK. It showcases:

- **Flexible configuration** through `game_config.py`
- **Clean game logic** with state inheritance
- **Powerful optimization** with distribution-based RTP targeting
- **Comprehensive output** with all necessary files for deployment

Use this as a reference when creating new games. The modular architecture allows you to:
- Swap win calculation engines (ways → lines → cluster)
- Add custom features and mechanics
- Tune volatility and payout profiles
- Generate production-ready files

For more details, see:
- **[REPOSITORY_OVERVIEW.md](./REPOSITORY_OVERVIEW.md)** for system architecture
- **[COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md)** for detailed component docs
- **Official Docs**: [https://stakeengine.github.io/math-sdk/](https://stakeengine.github.io/math-sdk/)
