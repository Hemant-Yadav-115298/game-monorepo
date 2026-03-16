# Workflow and Data Pipeline - Complete Guide

## Table of Contents
1. [Pipeline Overview](#pipeline-overview)
2. [Configuration Phase](#configuration-phase)
3. [Simulation Phase](#simulation-phase)
4. [Optimization Phase](#optimization-phase)
5. [Analysis Phase](#analysis-phase)
6. [Validation Phase](#validation-phase)
7. [Output Phase](#output-phase)
8. [Data Flow Diagrams](#data-flow-diagrams)
9. [File Dependencies](#file-dependencies)
10. [Performance Considerations](#performance-considerations)
11. [Troubleshooting Guide](#troubleshooting-guide)

---

## Pipeline Overview

The Stake Engine Math SDK follows a **multi-phase pipeline** that transforms game configuration into production-ready output files:

```
┌──────────────────────────────────────────────────────────────┐
│                    COMPLETE PIPELINE                         │
└──────────────────────────────────────────────────────────────┘

1. CONFIGURATION PHASE
   ↓ Game parameters, reels, paytables, distributions
   
2. SIMULATION PHASE
   ↓ Millions of game rounds → Books (compressed outcomes)
   
3. OPTIMIZATION PHASE
   ↓ Rust optimizer → Lookup tables (RTP-optimized mappings)
   
4. ANALYSIS PHASE
   ↓ Statistical summaries, hit rates, RTP verification
   
5. VALIDATION PHASE
   ↓ RGS compliance checks, format validation
   
6. OUTPUT PHASE
   ↓ Production-ready files for deployment
```

### Typical Runtime (0_0_ways example)

| Phase | Duration | Output Size |
|-------|----------|-------------|
| Configuration | < 1 second | KB |
| Simulation (10K books) | 30-60 seconds | 50-100 MB compressed |
| Optimization | 2-5 minutes | MB |
| Analysis | 10-30 seconds | KB |
| Validation | 5-10 seconds | KB |
| **Total** | **3-7 minutes** | **50-100 MB** |

*Note: Times vary based on hardware, simulation count, and complexity*

---

## Configuration Phase

### Inputs
- Game developer's decisions
- Mathematical requirements (RTP, volatility)
- Regulatory constraints

### Process

#### 1. Define Game Parameters

**File: `games/0_0_ways/game_config.py`**

```python
class GameConfig(Config):
    def __init__(self):
        super().__init__()
        # Identity
        self.game_id = "0_0_ways"
        self.rtp = 0.97
        self.wincap = 5000
        
        # Dimensions
        self.num_reels = 5
        self.num_rows = [3, 3, 3, 3, 3]
        
        # Paytable
        self.paytable = {
            (5, "H1"): 10,
            # ... more symbols
        }
        
        # Special Symbols
        self.special_symbols = {
            "wild": ["W"],
            "scatter": ["S"]
        }
```

#### 2. Create Reel Strips

**Files: `games/0_0_ways/reels/*.csv`**

```csv
# BR0.csv (Basegame Reel)
H4,H3,H4,L1,L3
H4,H3,H4,L1,L3
H2,L1,H2,L3,H2
...
```

**Considerations:**
- Symbol frequencies determine base hit rates
- Wilds placement affects substitution opportunities
- Scatter distribution controls feature trigger rates

#### 3. Configure Bet Modes

```python
self.bet_modes = [
    BetMode(
        name="base",
        cost=1.0,
        rtp=0.97,
        max_win=5000,
        distributions=[...]
    ),
    BetMode(
        name="bonus",
        cost=100.0,
        rtp=0.97,
        max_win=5000,
        distributions=[...]
    )
]
```

#### 4. Define Distributions

```python
Distribution(
    criteria="wincap",
    quota=0.001,        # 0.1% of all outcomes
    win_criteria=5000,  # Must win exactly 5000x
    conditions={
        "reel_weights": {...},
        "force_wincap": True,
        "mult_values": {1: 20, 2: 50, 3: 80, 4: 100, 5: 20}
    }
)
```

#### 5. Set Optimization Parameters

**File: `games/0_0_ways/game_optimization.py`**

```python
"conditions": {
    "wincap": ConstructConditions(
        rtp=0.01,           # Target RTP contribution
        av_win=5000,        # Average win
        search_conditions=5000
    ),
    "freegame": ConstructConditions(
        rtp=0.37,
        hr=200              # Hit rate (1 in 200)
    ),
    # ... more conditions
}
```

### Outputs
- Configuration objects in memory
- Paths established for output files

### Validation Checks
- ✓ All symbols in paytable exist in reels
- ✓ Distribution quotas sum to 1.0
- ✓ Target RTPs are achievable
- ✓ Reel strips are valid CSV format

---

## Simulation Phase

### Purpose
Generate a large dataset of game outcomes under various conditions.

### Inputs
- `GameConfig` object
- `GameState` object
- Simulation parameters (`num_sim_args`, `num_threads`, `batching_size`)

### Process

#### 1. Initialize Simulation

**File: `games/0_0_ways/run.py`**

```python
num_sim_args = {
    "base": int(1e4),    # 10,000 simulations for base mode
    "bonus": int(1e4)    # 10,000 simulations for bonus mode
}

create_books(
    gamestate,
    config,
    num_sim_args,
    batching_size=50000,
    num_threads=10,
    compression=True
)
```

#### 2. Parallel Simulation Execution

**File: `src/state/run_sims.py`**

```
For each bet mode:
    For each distribution (wincap, freegame, basegame, 0):
        quota_count = num_sims × distribution.quota
        
        For batch in range(0, quota_count, batching_size):
            ┌─────────────────────────────────────┐
            │  Thread Pool (10 parallel threads)  │
            │                                     │
            │  Thread 1: Sim 0                    │
            │  Thread 2: Sim 1                    │
            │  ...                                │
            │  Thread 10: Sim 9                   │
            └─────────────────────────────────────┘
            
            Each thread:
                1. gamestate.set_distribution(distribution)
                2. gamestate.run_spin(sim_id)
                3. Store result in gamestate.library[sim_id]
            
            Wait for all threads to complete
        
        Write batch to disk (compressed JSONL)
```

#### 3. Individual Simulation Flow

```
run_spin(sim_id):
    reset_seed(sim_id)          # Set RNG seed for reproducibility
    repeat = True
    repeat_count = 0
    
    while repeat:
        reset_book()            # Clear previous attempt
        
        # BASEGAME
        draw_board()            # Spin reels
        evaluate_ways_board()   # Calculate wins
        
        # FREESPIN CHECK
        if check_fs_condition() and check_freespin_entry():
            run_freespin():
                while fs < tot_fs:
                    draw_board()
                    evaluate_ways_board()
                    if check_fs_condition():
                        update_fs_retrigger_amt()
        
        evaluate_finalwin()     # Apply wincap
        check_repeat()          # Verify distribution conditions
        
        repeat_count += 1
        if repeat_count > 1000:
            raise Error("Infinite loop")
    
    imprint_wins()              # Save to library
```

#### 4. Book Creation

Each simulation produces a "book" (record):

```json
{
    "bookID": 4523,
    "criteria": "freegame",
    "board": [
        [{"name": "H1", "row": 0}, {"name": "L2", "row": 1}, ...],
        [...],
        ...
    ],
    "events": [
        {"type": "boardPopulated", "data": {...}},
        {"type": "winOccurred", "data": {"totalWin": 15.5, ...}},
        {"type": "freespinTriggered", "data": {"count": 10}}
    ],
    "wins": {
        "basegame": 0,
        "freegame": 15.5
    },
    "finalWin": 15.5,
    "freespinData": {
        "triggered": true,
        "totalSpins": 10,
        "retriggered": false
    }
}
```

#### 5. Compression and Storage

**File: `src/write_data/write_data.py`**

```python
def write_books(gamestate, mode_name, compression=True):
    output_file = f"library/books/books_{mode_name}.jsonl.zst"
    
    with zstd.ZstdCompressor() as compressor:
        with compressor.stream_writer(open(output_file, 'wb')) as writer:
            for book_id, book_data in gamestate.library.items():
                json_line = json.dumps(book_data) + "\n"
                writer.write(json_line.encode('utf-8'))
```

**Compression Ratios:**
- Uncompressed: ~500 MB (10K books)
- Zstandard: ~50 MB (10x compression)

### Outputs

**Directory: `games/0_0_ways/library/books/`**

- `books_base.jsonl.zst` (compressed simulation results for base mode)
- `books_bonus.jsonl.zst` (compressed simulation results for bonus mode)

### Validation Checks
- ✓ All simulations completed without errors
- ✓ Distribution quotas met (e.g., 0.1% wincap, 10% freegame)
- ✓ All books have valid structure
- ✓ Final wins respect wincap

---

## Optimization Phase

### Purpose
Find optimal mappings between bet outcomes and simulation results to hit target RTPs.

### Inputs
- Simulation books (`.jsonl.zst`)
- Optimization parameters (`game_optimization.py`)
- Target RTP, hit rate, average win constraints

### Process

#### 1. Load and Segment Books

```
Read books_base.jsonl.zst
    ↓
Segment by criteria:
    - wincap_books = [books where criteria == "wincap"]
    - freegame_books = [books where criteria == "freegame"]
    - basegame_books = [books where criteria == "basegame"]
    - zero_books = [books where criteria == "0"]
```

#### 2. Initialize Optimization Algorithm

**File: `optimization_program/run_script.py`**

```python
class OptimizationExecution:
    def run_all_modes(self, config, target_modes, rust_threads):
        for mode in target_modes:
            self.run_optimization(config, mode, rust_threads)
    
    def run_optimization(self, config, mode, threads):
        # Call Rust binary
        subprocess.run([
            "./optimization_program/target/release/optimizer",
            "--config", f"configs/math_config.json",
            "--mode", mode,
            "--threads", str(threads)
        ])
```

#### 3. Rust Optimization Algorithm

**Conceptual Flow:**

```
Input: Segmented books, target constraints

Initialize population (1000 candidates):
    Each candidate = lookup table mapping indices to book IDs
    
    Example candidate:
    [book_1234, book_5678, book_2341, ..., book_9999]
    indices: [0, 1, 2, ..., 9999]

For generation in 1..max_generations:
    
    # EVALUATE FITNESS
    For each candidate:
        Simulate 5000 random bets using this lookup table
        Calculate:
            - Actual RTP
            - Hit rate
            - Average win
            - Standard deviation
        
        Fitness score = how close to target constraints
        
        Example:
            Target RTP: 97%
            Actual RTP: 96.8%
            Score: penalty for 0.2% deviation
    
    # SELECT BEST
    Sort candidates by fitness
    Keep top 50% (500 candidates)
    
    # CROSSOVER & MUTATION
    For i in 1..500:
        parent1 = select_parent()
        parent2 = select_parent()
        
        child = crossover(parent1, parent2)
        mutate(child, mutation_rate=0.01)
        
        Add child to population
    
    If best_fitness converged:
        break

Output: Optimized lookup table
```

#### 4. Lookup Table Generation

**Output Format: `lookUpTable_base.csv`**

```csv
index,bookID,RTP,HR,average_win
0,4523,0.0,0,0.0
1,7821,0.95,1,0.95
2,1234,1.50,1,1.50
3,8765,0.0,0,0.0
...
9999,2222,75.5,1,75.5
```

**Meaning:**
- When backend receives bet with index 0 → return book 4523 (zero win)
- When backend receives bet with index 1 → return book 7821 (0.95x win)
- When backend receives bet with index 9999 → return book 2222 (75.5x win)

**Index Selection:**
Backend uses RNG to select index:
```
index = random.randint(0, 9999)
result = lookup_table[index]
return books[result.bookID]
```

#### 5. Segmented Optimization

The optimizer works on each distribution separately, then combines:

```
Optimize wincap distribution (0.1%):
    Target: RTP=0.01, av_win=5000
    Result: 10 indices mapped to high-win books
    
Optimize freegame distribution (10%):
    Target: RTP=0.37, hr=200 (0.5%)
    Result: 1000 indices mapped to freegame books
    
Optimize basegame distribution (50%):
    Target: RTP=0.59, hr=3.5 (28.6%)
    Result: 5000 indices mapped to basegame books
    
Optimize zero distribution (40%):
    Target: RTP=0, av_win=0
    Result: 4000 indices mapped to zero books

Combine into final lookup table (10,000 indices)
```

### Outputs

**Directory: `games/0_0_ways/library/lookup_tables/`**

- `lookUpTable_base.csv`
- `lookUpTable_bonus.csv`
- `lookUpTableSegmented_base.csv` (detailed breakdown)
- `lookUpTableSegmented_bonus.csv`

**Directory: `games/0_0_ways/library/optimization_files/`**

- `base_0_1.csv` through `base_0_10.csv` (per-distribution results)
- `bonus_0_1.csv` (bonus mode results)
- `trial_results/` (optimization iteration logs)

### Validation Checks
- ✓ Lookup table RTP within 0.1% of target (e.g., 96.9%-97.1%)
- ✓ Hit rates match targets
- ✓ All book IDs reference valid books
- ✓ Index distribution matches quota percentages

---

## Analysis Phase

### Purpose
Generate statistical summaries and verify mathematical correctness.

### Inputs
- Simulation books
- Lookup tables
- Game configuration

### Process

**File: `utils/game_analytics/run_analysis.py`**

```python
def create_stat_sheet(gamestate, custom_keys=[]):
    """Generate comprehensive statistics."""
    
    for mode in gamestate.config.bet_modes:
        mode_name = mode.get_name()
        books = load_books(f"library/books/books_{mode_name}.jsonl.zst")
        lookup_table = load_lookup_table(f"library/lookup_tables/lookUpTable_{mode_name}.csv")
        
        stats = {
            "mode": mode_name,
            "total_books": len(books),
            "rtp": calculate_rtp(books, lookup_table),
            "hit_rate": calculate_hit_rate(books, lookup_table),
            "std_dev": calculate_std_dev(books, lookup_table),
            "max_win": max([book["finalWin"] for book in books]),
            "min_win": min([book["finalWin"] for book in books]),
            "distribution_breakdown": {},
            "symbol_statistics": {}
        }
        
        # Distribution breakdown
        for dist in mode.distributions:
            dist_books = [b for b in books if b["criteria"] == dist.criteria]
            stats["distribution_breakdown"][dist.criteria] = {
                "count": len(dist_books),
                "quota": dist.quota,
                "rtp": calculate_rtp(dist_books, lookup_table),
                "hit_rate": calculate_hit_rate(dist_books, lookup_table),
                "avg_win": calculate_avg_win(dist_books)
            }
        
        # Symbol-specific statistics
        for custom_key in custom_keys:
            symbol = custom_key["symbol"]
            symbol_books = filter_books_by_symbol(books, symbol)
            stats["symbol_statistics"][symbol] = {
                "frequency": len(symbol_books) / len(books),
                "avg_win": calculate_avg_win(symbol_books)
            }
        
        write_stats(stats, f"library/statistics_summary.json")
```

### Output Example

**File: `library/statistics_summary.json`**

```json
{
    "base": {
        "mode": "base",
        "total_books": 10000,
        "rtp": 97.02,
        "hit_rate": 0.286,
        "std_dev": 11.19,
        "max_win": 5000,
        "min_win": 0,
        "distribution_breakdown": {
            "wincap": {
                "count": 10,
                "quota": 0.001,
                "rtp": 1.01,
                "hit_rate": 1.0,
                "avg_win": 5000
            },
            "freegame": {
                "count": 1050,
                "quota": 0.1,
                "rtp": 37.15,
                "hit_rate": 0.005,
                "avg_win": 74.2
            },
            "basegame": {
                "count": 5000,
                "quota": 0.5,
                "rtp": 58.86,
                "hit_rate": 0.286,
                "avg_win": 2.06
            },
            "0": {
                "count": 4000,
                "quota": 0.4,
                "rtp": 0.0,
                "hit_rate": 0.0,
                "avg_win": 0.0
            }
        },
        "symbol_statistics": {
            "scatter": {
                "frequency": 0.005,
                "avg_win": 74.2,
                "trigger_rate": 0.005,
                "avg_spins_awarded": 12.3
            }
        },
        "win_distribution": {
            "0x": 0.714,
            "0-1x": 0.15,
            "1-5x": 0.10,
            "5-20x": 0.025,
            "20-100x": 0.008,
            "100-500x": 0.002,
            "500-5000x": 0.001
        }
    },
    "bonus": {
        "mode": "bonus",
        "total_books": 10000,
        "rtp": 97.05,
        "hit_rate": 1.0,
        "std_dev": 15.23,
        "max_win": 5000,
        "min_win": 5.2,
        "distribution_breakdown": {
            "freegame": {
                "count": 10000,
                "quota": 1.0,
                "rtp": 97.05,
                "hit_rate": 1.0,
                "avg_win": 97.05
            }
        }
    }
}
```

### Outputs
- `library/statistics_summary.json`
- `library/stats_summary.json` (alternative format)

### Validation Checks
- ✓ RTP matches target (±0.5%)
- ✓ Hit rates are reasonable
- ✓ Distribution quotas met
- ✓ Max win equals wincap

---

## Validation Phase

### Purpose
Ensure all output files meet RGS (Remote Game Server) specifications and format requirements.

### Inputs
- All generated files
- Game configuration

### Process

**File: `utils/rgs_verification.py`**

```python
def execute_all_tests(config):
    """Run all validation tests."""
    
    results = {
        "config_validation": validate_config_files(config),
        "lookup_table_validation": validate_lookup_tables(config),
        "books_validation": validate_books(config),
        "rtp_verification": verify_rtp_accuracy(config),
        "event_validation": validate_events(config),
        "force_file_validation": validate_force_files(config)
    }
    
    if all(results.values()):
        print("✓ All validation tests passed")
    else:
        print("✗ Validation failures detected")
        for test, passed in results.items():
            if not passed:
                print(f"  - {test} FAILED")
```

#### Test Categories

**1. Config Validation**
```python
def validate_config_files(config):
    """Verify config.json structure and values."""
    checks = [
        check_required_fields_present(),
        check_rtp_values_valid(),
        check_bookshelf_config_complete(),
        check_file_references_exist(),
        check_sha256_hashes_correct()
    ]
    return all(checks)
```

**2. Lookup Table Validation**
```python
def validate_lookup_tables(config):
    """Verify lookup table format and references."""
    checks = [
        check_csv_format_valid(),
        check_all_book_ids_exist(),
        check_index_continuity(),
        check_rtp_column_accuracy(),
        check_no_duplicate_indices()
    ]
    return all(checks)
```

**3. Books Validation**
```python
def validate_books(config):
    """Verify simulation books structure."""
    checks = [
        check_jsonl_format(),
        check_compression_valid(),
        check_all_required_fields(),
        check_board_dimensions(),
        check_event_sequence_valid(),
        check_win_calculations_correct()
    ]
    return all(checks)
```

**4. RTP Verification**
```python
def verify_rtp_accuracy(config):
    """Simulate 1M bets and verify RTP."""
    total_wagered = 0
    total_returned = 0
    
    for _ in range(1_000_000):
        bet_amount = 1.0
        index = random.randint(0, len(lookup_table) - 1)
        book_id = lookup_table[index]["bookID"]
        result = books[book_id]
        
        total_wagered += bet_amount
        total_returned += result["finalWin"] * bet_amount
    
    actual_rtp = (total_returned / total_wagered) * 100
    target_rtp = config.rtp * 100
    
    # Pass if within 0.5%
    return abs(actual_rtp - target_rtp) < 0.5
```

**5. Event Validation**
```python
def validate_events(config):
    """Verify event structure and sequence."""
    checks = [
        check_event_types_valid(),
        check_event_sequence_logical(),
        check_event_data_complete(),
        check_no_orphaned_events()
    ]
    return all(checks)
```

### Outputs
- Console report of validation results
- Error logs if validation fails

### Validation Checks
- ✓ All config files valid JSON
- ✓ All file references exist
- ✓ SHA256 hashes match
- ✓ Lookup tables reference valid books
- ✓ RTP within tolerance
- ✓ Events properly sequenced

---

## Output Phase

### Purpose
Organize and prepare final files for production deployment.

### Process

**File: `src/write_data/write_configs.py`**

```python
def generate_configs(gamestate):
    """Generate all configuration files."""
    
    # 1. Main config.json
    write_main_config(gamestate)
    
    # 2. Event configs (per bet mode)
    for bet_mode in gamestate.config.bet_modes:
        write_event_config(gamestate, bet_mode)
    
    # 3. Math config (optimization parameters)
    write_math_config(gamestate)
    
    # 4. Force files (deterministic testing)
    write_force_files(gamestate)
    
    # 5. Frontend config
    write_frontend_config(gamestate)
    
    # 6. Move files to publish directory
    prepare_publish_files(gamestate)
```

### Final Directory Structure

```
games/0_0_ways/library/
│
├── configs/
│   ├── config.json                      # Main game configuration
│   ├── config_fe_0_0_ways.json          # Frontend-specific config
│   ├── event_config_base.json           # Base mode events
│   ├── event_config_bonus.json          # Bonus mode events
│   └── math_config.json                 # Mathematical model
│
├── lookup_tables/
│   ├── lookUpTable_base.csv             # Base mode lookup table
│   ├── lookUpTable_bonus.csv            # Bonus mode lookup table
│   ├── lookUpTableSegmented_base.csv    # Segmented view (base)
│   └── lookUpTableSegmented_bonus.csv   # Segmented view (bonus)
│
├── books/
│   ├── books_base.jsonl.zst             # Compressed books (base)
│   └── books_bonus.jsonl.zst            # Compressed books (bonus)
│
├── forces/
│   ├── force.json                       # Force configuration
│   ├── force_record_base.json           # Base mode force records
│   └── force_record_bonus.json          # Bonus mode force records
│
├── optimization_files/
│   ├── base_0_1.csv through base_0_10.csv
│   ├── bonus_0_1.csv
│   └── trial_results/                   # Optimization logs
│
├── publish_files/                       # PRODUCTION-READY
│   ├── index.json                       # Master index
│   ├── lookUpTable_base_0.csv           # Published lookup table
│   ├── lookUpTable_bonus_0.csv
│   ├── books_base.jsonl.zst             # Published books
│   └── books_bonus.jsonl.zst
│
├── statistics_summary.json              # Statistical analysis
└── stats_summary.json                   # Alternative format
```

### Production Deployment Files

The `publish_files/` directory contains **deployment-ready** files:

**1. index.json**
```json
{
    "gameID": "0_0_ways",
    "version": "1.0.0",
    "timestamp": "2026-02-25T10:30:00Z",
    "files": [
        {"name": "lookUpTable_base_0.csv", "sha256": "5feb364..."},
        {"name": "lookUpTable_bonus_0.csv", "sha256": "3475e0f..."},
        {"name": "books_base.jsonl.zst", "sha256": "e6726cb..."},
        {"name": "books_bonus.jsonl.zst", "sha256": "11d937c..."}
    ]
}
```

**2. Lookup Tables**
- `lookUpTable_base_0.csv`: Indexed lookup for base mode
- `lookUpTable_bonus_0.csv`: Indexed lookup for bonus mode

**3. Books**
- `books_base.jsonl.zst`: All simulation results for base mode
- `books_bonus.jsonl.zst`: All simulation results for bonus mode

### Outputs
- `publish_files/` directory with production files
- SHA256 checksums for integrity verification
- Version-controlled index.json

---

## Data Flow Diagrams

### High-Level Flow

```
┌─────────────┐
│ game_config │
└──────┬──────┘
       │
       ├─────────┐
       │         │
       ▼         ▼
  ┌─────────┐ ┌─────┐
  │ gamestate││reels│
  └────┬─────┘ └──┬──┘
       │          │
       └──────┬───┘
              │
              ▼
       ┌──────────────┐
       │ run_sims     │
       │ (10K books)  │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │ books/*.zst  │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │ optimization │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │ lookup_tables│
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │ analysis     │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │ validation   │
       └──────┬───────┘
              │
              ▼
       ┌──────────────┐
       │publish_files │
       └──────────────┘
```

### Detailed Simulation Flow

```
┌───────────────────────────────────────────────┐
│ FOR EACH BET MODE                             │
│   FOR EACH DISTRIBUTION                       │
│     FOR EACH SIMULATION (parallel)            │
│                                               │
│       ┌────────────────────────────┐          │
│       │ 1. Reset seed (sim_id)     │          │
│       └────────┬───────────────────┘          │
│                │                              │
│       ┌────────▼───────────────────┐          │
│       │ 2. Select distribution     │          │
│       │    conditions              │          │
│       └────────┬───────────────────┘          │
│                │                              │
│       ┌────────▼───────────────────┐          │
│       │ 3. Draw board (reels)      │          │
│       └────────┬───────────────────┘          │
│                │                              │
│       ┌────────▼───────────────────┐          │
│       │ 4. Evaluate wins           │          │
│       └────────┬───────────────────┘          │
│                │                              │
│       ┌────────▼───────────────────┐          │
│       │ 5. Check freespin trigger  │          │
│       └────────┬───────────────────┘          │
│                │                              │
│             Yes│? No                          │
│       ┌────────▼───────────────────┐          │
│       │ 6. Run freespin loop       │          │
│       │    (if triggered)          │          │
│       └────────┬───────────────────┘          │
│                │                              │
│       ┌────────▼───────────────────┐          │
│       │ 7. Apply wincap            │          │
│       └────────┬───────────────────┘          │
│                │                              │
│       ┌────────▼───────────────────┐          │
│       │ 8. Check repeat condition  │          │
│       └────────┬───────────────────┘          │
│                │                              │
│         Satisfied? No → Loop back to step 3  │
│                │                              │
│               Yes                             │
│       ┌────────▼───────────────────┐          │
│       │ 9. Imprint to library      │          │
│       └────────────────────────────┘          │
│                                               │
│     END SIMULATION                            │
│   END DISTRIBUTION                            │
│ END BET MODE                                  │
└───────────────────────────────────────────────┘
```

---

## File Dependencies

### Critical Dependencies

```
game_config.py
  ↓ requires
reels/*.csv
  ↓ used by
gamestate.py
  ↓ executes
run.py → create_books() → books/*.jsonl.zst
                           ↓ required by
                  optimization → lookUpTable_*.csv
                                 ↓ required by
                            analysis → statistics_summary.json
                                       ↓ verified by
                                  validation → ✓ or ✗
                                               ↓ published as
                                          publish_files/
```

### Configuration File Dependencies

```
config.json
  ├─ references → lookUpTable_base_0.csv
  ├─ references → lookUpTable_bonus_0.csv
  ├─ references → books_base.jsonl.zst
  ├─ references → books_bonus.jsonl.zst
  ├─ includes SHA256 → all referenced files
  └─ links to → event_config_base.json
                event_config_bonus.json
```

---

## Performance Considerations

### Simulation Phase

**Bottlenecks:**
- Board drawing (RNG calls)
- Ways calculation (symbol matching)
- Event emission (JSON serialization)

**Optimization Strategies:**
1. **Parallel Threads**: Use 10-20 threads for simulation
2. **Batching**: Process 50K sims per batch to limit memory
3. **Compression**: Use Zstandard for 10x file size reduction
4. **Profiling**: Enable profiling to identify hotspots

**Memory Usage:**
- ~100 MB per 10K books (before compression)
- ~10 MB per 10K books (after compression)
- Peak memory: ~500 MB (with 10 threads)

### Optimization Phase

**Bottlenecks:**
- Fitness evaluation (5K simulations per candidate)
- Book loading (decompression)
- Crossover & mutation operations

**Optimization Strategies:**
1. **Rust Implementation**: 10-100x faster than Python
2. **Thread Pool**: Use all CPU cores (20 threads recommended)
3. **Early Termination**: Stop when converged (within 0.1% of target)
4. **Caching**: Cache book data in memory

**Runtime Estimates:**
- Small games (10K books): 2-3 minutes
- Medium games (100K books): 10-15 minutes
- Large games (1M books): 30-60 minutes

### File I/O

**Best Practices:**
1. Use compression for books (Zstandard)
2. Use CSV for lookup tables (fast parsing)
3. Stream large files (don't load all in memory)
4. Generate SHA256 hashes incrementally

---

## Troubleshooting Guide

### Issue: Simulations Taking Too Long

**Symptoms:** Simulation phase exceeds 10 minutes for 10K books

**Solutions:**
1. Reduce `num_threads` if CPU-limited (context switching overhead)
2. Increase `batching_size` to reduce overhead
3. Disable `profiling` if enabled
4. Check for infinite repeat loops (increase logging)

### Issue: Optimization Not Converging

**Symptoms:** RTP far from target after optimization

**Solutions:**
1. Increase `sim_trials` in optimization parameters
2. Check distribution RTPs sum to target RTP
3. Verify reel strips have sufficient symbol variety
4. Reduce `min_m2m` and increase `max_m2m` for more flexibility

### Issue: File Corruption

**Symptoms:** Cannot read `.jsonl.zst` files

**Solutions:**
1. Check disk space during simulation
2. Verify Zstandard library version
3. Re-run simulations with `compression=False` to test
4. Check for write permission errors

### Issue: RTP Validation Failure

**Symptoms:** RTP verification test fails (outside ±0.5%)

**Solutions:**
1. Increase simulation count (1e4 → 1e5)
2. Check lookup table references valid book IDs
3. Verify optimization completed successfully
4. Review distribution RTP targets

### Issue: Memory Overflow

**Symptoms:** Process killed, out of memory errors

**Solutions:**
1. Reduce `batching_size` (50K → 25K)
2. Reduce `num_threads` (10 → 5)
3. Enable compression earlier
4. Clear library between distributions

---

## Conclusion

The Stake Engine Math SDK pipeline provides a **complete, automated workflow** from game concept to production-ready files:

1. **Configure** game parameters and constraints
2. **Simulate** millions of outcomes
3. **Optimize** for target RTP/volatility
4. **Analyze** statistical properties
5. **Validate** compliance and correctness
6. **Output** production files

Each phase builds on the previous, with clear inputs, processes, and outputs. The modular design allows iteration on any phase without restarting from scratch.

For more details, see:
- **[REPOSITORY_OVERVIEW.md](./REPOSITORY_OVERVIEW.md)** - System architecture
- **[0_0_WAYS_GAME_DETAILED.md](./0_0_WAYS_GAME_DETAILED.md)** - Game implementation
- **[COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md)** - Component details
