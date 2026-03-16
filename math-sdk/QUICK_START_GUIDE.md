# Quick Start Guide - 0_0_Ways Game

## Introduction

This is a practical, hands-on guide to get you up and running with the **0_0_ways** game. Follow these steps to understand, run, and modify the game.

---

## Prerequisites

Ensure you have these installed:

- **Python 3.12+**
- **Rust/Cargo** (for optimization)
- **Make** (optional, but recommended)

### Quick Setup

```bash
# Navigate to repository
cd c:\Codes\Stake-Slots-Math

# Setup environment (with Make)
make setup

# OR manually
python -m venv env
env\Scripts\activate
python -m pip install -r requirements.txt
python -m pip install -e .
```

---

## 5-Minute Walkthrough

### Step 1: Understand What the Game Is

**0_0_ways** is a **5-reel × 3-row slot game** with **243 ways to win**.

- **9 paying symbols**: H1-H5 (high), L1-L4 (low)  
- **Wild symbol** (W): Substitutes for paying symbols  
- **Scatter symbol** (S): Triggers free spins  
- **Multiplier wilds**: In free game, wilds carry 1x-5x multipliers  
- **Win cap**: 5,000x bet  
- **Target RTP**: 97%

### Step 2: Run the Game

```bash
# Using Make
make run GAME=0_0_ways

# OR manually
python games/0_0_ways/run.py
```

**What happens:**
1. Simulates 10,000 basegame rounds
2. Simulates 10,000 bonus rounds
3. Optimizes lookup tables for 97% RTP
4. Generates statistical analysis
5. Validates all outputs

**Expected runtime:** 3-7 minutes

### Step 3: Review the Output

After running, check these files:

```
games/0_0_ways/library/
├── configs/
│   └── config.json              ← Main configuration
├── lookup_tables/
│   └── lookUpTable_base.csv     ← Bet outcome mappings
├── books/
│   └── books_base.jsonl.zst     ← Compressed simulation results
└── statistics_summary.json      ← Statistical analysis
```

**Key file to review:**

**`statistics_summary.json`** - Shows achieved RTP, hit rates, distribution breakdown:

```json
{
  "base": {
    "rtp": 97.02,          // ✓ Hit target 97%!
    "hit_rate": 0.286,     // 28.6% of spins win
    "std_dev": 11.19,      // Volatility measure
    "max_win": 5000        // Confirmed wincap
  }
}
```

---

## Understanding Key Files

### 1. `game_config.py` - The Game Definition

**What it does:** Defines all game parameters.

**Key sections:**

```python
# Game identity
self.game_id = "0_0_ways"
self.rtp = 0.97
self.wincap = 5000

# Board setup
self.num_reels = 5
self.num_rows = [3, 3, 3, 3, 3]

# Paytable
self.paytable = {
    (5, "H1"): 10,  # 5 H1 symbols = 10x bet
    (4, "H1"): 5,   # 4 H1 symbols = 5x bet
    (3, "H1"): 3,   # 3 H1 symbols = 3x bet
    # ... more symbols
}

# Special symbols
self.special_symbols = {
    "wild": ["W"],
    "scatter": ["S"]
}

# Free spin triggers
self.freespin_triggers = {
    self.basegame_type: {3: 10, 4: 15, 5: 20},  # 3/4/5 scatters -> 10/15/20 spins
}
```

**To modify:** Edit these values to change game behavior.

---

### 2. `gamestate.py` - The Game Logic

**What it does:** Controls how the game runs (basegame and freespin flow).

**Key methods:**

```python
def run_spin(self, sim):
    """Main basegame loop."""
    self.draw_board()           # Spin reels
    self.evaluate_ways_board()  # Calculate wins
    if self.check_fs_condition():  # 3+ scatters?
        self.run_freespin()        # Enter free spins

def run_freespin(self):
    """Free spin loop."""
    while self.fs < self.tot_fs:
        self.draw_board()           # Spin free game reels
        self.evaluate_ways_board()  # Calculate wins with multipliers
```

**To modify:** Override methods to add custom game logic.

---

### 3. `reels/*.csv` - The Reel Strips

**What it does:** Defines symbol sequences on each reel.

**Example:** [BR0.csv](games/0_0_ways/reels/BR0.csv)

```csv
H4,H3,H4,L1,L3    ← Row 1
H4,H3,H4,L1,L3    ← Row 2
H2,L1,H2,L3,H2    ← Row 3
...
[251 rows total]
```

Each column = one reel (5 columns = 5 reels)

**To modify:** 
- Add/remove rows to change reel length
- Change symbols to adjust frequencies
- Create new CSV files for different reel profiles

---

### 4. `game_optimization.py` - RTP Targets

**What it does:** Defines constraints for the optimization algorithm.

**Key section:**

```python
"conditions": {
    "wincap": ConstructConditions(
        rtp=0.01,        # 1% RTP from wincap hits
        av_win=5000      # Average win = 5000x
    ),
    "freegame": ConstructConditions(
        rtp=0.37,        # 37% RTP from free games
        hr=200           # Hit rate = 1 in 200
    ),
    "basegame": ConstructConditions(
        rtp=0.59,        # 59% RTP from basegame
        hr=3.5           # Hit rate = 1 in 3.5
    )
}
```

**Total RTP:** 0.01 + 0.37 + 0.59 = **0.97 (97%)**

**To modify:** Adjust RTP values (must sum to target RTP).

---

### 5. `run.py` - The Main Executor

**What it does:** Orchestrates the entire pipeline.

**Key parameters:**

```python
num_threads = 10          # Parallel simulation threads
num_sim_args = {
    "base": int(1e4),     # 10,000 simulations
    "bonus": int(1e4)
}

run_conditions = {
    "run_sims": True,           # Run simulations?
    "run_optimization": True,    # Run optimization?
    "run_analysis": True,        # Generate stats?
    "run_format_checks": True,   # Validate outputs?
}
```

**To modify:**
- Increase `num_sim_args` for more accuracy (e.g., `1e5` = 100K)
- Set `run_conditions` to skip phases (e.g., `"run_sims": False` to only re-optimize)

---

## Common Modifications

### Change Target RTP

**1. Edit `game_config.py`:**
```python
self.rtp = 0.95  # Change from 0.97 to 0.95
```

**2. Edit `game_optimization.py`:**
Adjust distribution RTPs to sum to 0.95:
```python
"freegame": ConstructConditions(rtp=0.35, ...),  # Reduced from 0.37
"basegame": ConstructConditions(rtp=0.59, ...),  # Keep same
```

**3. Re-run:**
```bash
python games/0_0_ways/run.py
```

---

### Change Paytable

**Edit `game_config.py`:**
```python
self.paytable = {
    (5, "H1"): 15,  # Increased from 10
    (4, "H1"): 7,   # Increased from 5
    (3, "H1"): 4,   # Increased from 3
    # ... adjust other symbols
}
```

**Note:** Changing paytable will change RTP. You'll need to re-optimize.

---

### Add a New Reel Strip

**1. Create new CSV file:**
```bash
# Copy existing reel
cp games/0_0_ways/reels/BR0.csv games/0_0_ways/reels/BR1.csv
```

**2. Edit `BR1.csv`** to change symbol distribution

**3. Register in `game_config.py`:**
```python
reels = {
    "BR0": "BR0.csv",
    "BR1": "BR1.csv",  # New reel
    "FR0": "FR0.csv",
    "FRWCAP": "FRWCAP.csv"
}
```

**4. Use in distributions:**
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

---

### Increase Simulation Count

**Edit `run.py`:**
```python
num_sim_args = {
    "base": int(1e5),   # Increased from 1e4 to 1e5 (100,000)
    "bonus": int(1e5)
}
```

**Trade-off:**
- **More sims** = more accurate RTP, longer runtime
- **Fewer sims** = faster testing, less accurate

**Recommended:**
- Testing: 1e3 (1,000) - fast iteration
- Development: 1e4 (10,000) - balanced
- Production: 1e6 (1,000,000) - high accuracy

---

### Change Win Cap

**Edit `game_config.py`:**
```python
self.wincap = 10000  # Change from 5000 to 10000
```

**Also update in bet modes:**
```python
BetMode(
    name="base",
    max_win=10000,  # Update here too
    # ...
)
```

**Re-run simulations and optimization.**

---

## Testing Your Changes

### Run Only Simulations

**Edit `run.py`:**
```python
run_conditions = {
    "run_sims": True,
    "run_optimization": False,  # Skip optimization
    "run_analysis": False,      # Skip analysis
    "run_format_checks": False  # Skip validation
}
```

This is useful for quickly testing game logic changes.

---

### Run Only Optimization

**Edit `run.py`:**
```python
run_conditions = {
    "run_sims": False,          # Use existing books
    "run_optimization": True,   # Re-optimize
    "run_analysis": True,       # Update stats
    "run_format_checks": True   # Validate
}
```

This is useful when you've only changed optimization parameters.

---

### Check RTP Accuracy

After running, review `statistics_summary.json`:

```json
{
  "base": {
    "rtp": 97.02,  // Target: 97.00, Actual: 97.02, Deviation: +0.02 ✓
    "distribution_breakdown": {
      "wincap": {"rtp": 1.01, "count": 10},      // Target: 1.00
      "freegame": {"rtp": 37.15, "count": 1050}, // Target: 37.00
      "basegame": {"rtp": 58.86, "count": 5000}  // Target: 59.00
    }
  }
}
```

**Acceptable deviation:** ±0.5%

**If deviation too large:**
1. Increase simulation count (`1e4` → `1e5`)
2. Adjust optimization parameters (increase `sim_trials`)
3. Check reel strips have sufficient variety

---

## Output Files Explained

### `config.json` - Backend Configuration

Used by the backend server to run the game.

**Key fields:**
```json
{
  "gameID": "0_0_ways",
  "rtp": 97.0,
  "wincap": 5000,
  "bookShelfConfig": [
    {
      "name": "base",
      "cost": 1.0,
      "tables": [{"file": "lookUpTable_base_0.csv"}],
      "booksFile": {"file": "books_base.jsonl.zst"}
    }
  ]
}
```

---

### `lookUpTable_base.csv` - Bet Outcome Mapping

Maps bet indices to simulation results.

**Format:**
```csv
index,bookID,RTP,HR,average_win
0,4523,0.0,0,0.0          ← Bet index 0 → Book 4523 (no win)
1,7821,0.95,1,0.95        ← Bet index 1 → Book 7821 (0.95x win)
2,1234,1.50,1,1.50        ← Bet index 2 → Book 1234 (1.50x win)
...
9999,2222,75.5,1,75.5     ← Bet index 9999 → Book 2222 (75.5x win)
```

**How it's used:**
```
Player bets → Backend selects random index (0-9999)
           → Looks up bookID in table
           → Returns that book's result
```

---

### `books_base.jsonl.zst` - Simulation Results

Compressed file containing all simulation outcomes.

**Each line is a JSON object:**
```json
{
  "bookID": 1234,
  "finalWin": 1.5,
  "board": [[{"name":"H1"}, {"name":"L2"}, ...], ...],
  "events": [
    {"type": "boardPopulated", "data": {...}},
    {"type": "winOccurred", "data": {"totalWin": 1.5}}
  ]
}
```

**To view:**
```bash
# Decompress
zstd -d games/0_0_ways/library/books/books_base.jsonl.zst

# View first 10 lines
head -10 games/0_0_ways/library/books/books_base.jsonl
```

---

### `statistics_summary.json` - Analysis Report

Statistical summary of simulation results.

**Key metrics:**
- **RTP**: Return to player percentage
- **Hit Rate**: Percentage of winning spins
- **Standard Deviation**: Volatility measure
- **Max/Min Wins**: Win range
- **Distribution Breakdown**: Per-distribution metrics

---

## Troubleshooting

### Issue: Script Runs Too Long

**Problem:** Simulation takes more than 10 minutes

**Solutions:**
1. Reduce simulation count: `int(1e4)` → `int(1e3)`
2. Reduce threads: `num_threads = 10` → `num_threads = 5`
3. Disable profiling: `profiling = False`

---

### Issue: RTP Not Matching Target

**Problem:** Statistics show RTP = 95% when target is 97%

**Solutions:**
1. Check distribution RTPs sum to target (0.97):
   ```python
   0.01 (wincap) + 0.37 (freegame) + 0.59 (basegame) = 0.97 ✓
   ```
2. Increase simulation count for accuracy
3. Verify optimization completed successfully
4. Check reel strips have correct symbols

---

### Issue: File Not Found Errors

**Problem:** Cannot find `books_base.jsonl.zst` or other files

**Solutions:**
1. Ensure simulations ran successfully (check console output)
2. Check `library/` directory exists
3. Run with `"run_sims": True` to generate books
4. Verify file paths in `game_config.py`

---

### Issue: Infinite Loop / Hangs

**Problem:** Script hangs during simulation

**Solutions:**
1. Check for infinite repeat loops (distribution conditions too strict)
2. Review `check_game_repeat()` in `game_override.py`
3. Enable debug logging to identify problem simulation
4. Reduce `force_wincap` requirements if too restrictive

---

## Next Steps

### Learn More

- **[REPOSITORY_OVERVIEW.md](../REPOSITORY_OVERVIEW.md)** - Understand the full system
- **[0_0_WAYS_GAME_DETAILED.md](../0_0_WAYS_GAME_DETAILED.md)** - Deep dive into game components
- **[COMPONENT_ARCHITECTURE.md](../COMPONENT_ARCHITECTURE.md)** - Learn about core SDK
- **[WORKFLOW_AND_DATA_PIPELINE.md](../WORKFLOW_AND_DATA_PIPELINE.md)** - Understand data flow

### Create Your Own Game

1. **Copy template:**
   ```bash
   cp -r games/template games/my_new_game
   ```

2. **Modify `game_config.py`:**
   - Set game ID, RTP, wincap
   - Define paytable
   - Configure reels

3. **Create reel strips:**
   - Edit `reels/*.csv` files
   - Set symbol distributions

4. **Customize game logic:**
   - Edit `gamestate.py` for custom flow
   - Edit `game_override.py` for custom behaviors

5. **Run and iterate:**
   ```bash
   python games/my_new_game/run.py
   ```

### Explore Other Game Types

- **Lines game:** `games/0_0_lines/` - Traditional payline game
- **Cluster game:** `games/0_0_cluster/` - Cluster pays
- **Scatter game:** `games/0_0_scatter/` - Scatter-based wins

---

## Quick Reference

### Run Commands

```bash
# Full pipeline
python games/0_0_ways/run.py

# With Make
make run GAME=0_0_ways

# Only simulations
# Edit run.py: run_conditions = {"run_sims": True, others: False}

# Only optimization
# Edit run.py: run_conditions = {"run_optimization": True, others: False}
```

### Key Files to Edit

| File | Purpose |
|------|---------|
| `game_config.py` | Game parameters, paytable, RTP |
| `gamestate.py` | Game logic flow |
| `game_override.py` | Custom behaviors |
| `game_optimization.py` | RTP targets, optimization |
| `reels/*.csv` | Symbol sequences |
| `run.py` | Execution parameters |

### Important Directories

| Directory | Contents |
|-----------|----------|
| `library/configs/` | Configuration JSONs |
| `library/lookup_tables/` | Bet mappings |
| `library/books/` | Simulation results |
| `library/publish_files/` | Production files |

---

## Get Help

- **Documentation**: [https://stakeengine.github.io/math-sdk/](https://stakeengine.github.io/math-sdk/)
- **Engine**: [https://engine.stake.com/](https://engine.stake.com/)

---

Happy game development! 🎰
