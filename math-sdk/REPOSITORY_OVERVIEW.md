# Stake Engine Math SDK - Complete Repository Overview

## Table of Contents
1. [Introduction](#introduction)
2. [Repository Purpose](#repository-purpose)
3. [Core Technologies](#core-technologies)
4. [Project Structure](#project-structure)
5. [Essential Components](#essential-components)
6. [Workflow Pipeline](#workflow-pipeline)
7. [Key Concepts](#key-concepts)

---

## Introduction

The **Stake Engine Math SDK** is a sophisticated Python-based framework designed for defining, simulating, and optimizing slot game mathematics. It serves as a comprehensive toolkit for game mathematicians and developers to create, test, and verify slot game mechanics with rigorous statistical validation.

### What Does It Do?

- **Defines Game Rules**: Establishes mathematical models for slot game behavior
- **Simulates Outcomes**: Runs millions of game rounds to validate game mathematics
- **Optimizes Distributions**: Uses advanced algorithms to optimize win distributions for target RTPs
- **Generates Backend Files**: Produces all configuration files, lookup tables, and game books needed for production
- **Validates RGS Compliance**: Ensures games meet regulatory and platform requirements

---

## Repository Purpose

This SDK is designed to:

1. **Accelerate Game Development**: Provide a reusable framework for creating slot games with different mechanics (lines, ways, cluster, scatter, etc.)
2. **Ensure Mathematical Accuracy**: Validate that games hit target RTPs and volatility profiles
3. **Enable Optimization**: Find optimal reel configurations and symbol distributions
4. **Generate Production Assets**: Create all files needed for backend integration
5. **Maintain Consistency**: Standardize game math across multiple game titles

---

## Core Technologies

### Languages & Frameworks
- **Python 3.12+**: Primary development language
- **Rust/Cargo**: High-performance optimization algorithms
- **MkDocs**: Documentation generation

### Key Libraries
- **NumPy/Pandas**: Statistical calculations and data manipulation
- **Zstandard**: Compression for simulation results
- **JSON/CSV**: Configuration and data file formats

---

## Project Structure

```
Stake-Slots-Math/
│
├── src/                          # Core SDK framework (reusable across all games)
│   ├── config/                   # Base configuration system
│   ├── state/                    # Core game state management
│   ├── calculations/             # Win calculation engines (lines, ways, cluster, etc.)
│   ├── events/                   # Event emission system
│   ├── executables/              # Execution logic
│   ├── wins/                     # Win management system
│   └── write_data/               # Data output and file generation
│
├── games/                        # Individual game implementations
│   ├── 0_0_ways/                 # Sample "ways" game (FOCUS EXAMPLE)
│   ├── 0_0_lines/                # Sample "lines" game
│   ├── 0_0_cluster/              # Sample "cluster" game
│   ├── 0_0_scatter/              # Sample "scatter" game
│   └── template/                 # Game template for new games
│
├── optimization_program/         # Rust-based optimization engine
│   ├── src/                      # Rust source code
│   ├── Cargo.toml                # Rust dependencies
│   └── optimization_config.py    # Python optimization configuration
│
├── utils/                        # Utility tools
│   ├── game_analytics/           # Statistical analysis tools
│   ├── analysis/                 # Data analysis utilities
│   ├── search_tool/              # Code search utilities
│   └── rgs_verification.py       # RGS compliance validation
│
├── uploads/                      # AWS upload functionality
├── tests/                        # Test suites
└── docs/                         # Documentation (MkDocs)
```

---

## Essential Components

### 1. **Core SDK (`src/` directory)**

The heart of the system - provides reusable, game-agnostic functionality:

#### **`src/config/`** - Configuration System
- **`config.py`**: Base configuration class with default values
- **`betmode.py`**: Defines bet modes and their properties
- **`distributions.py`**: Distribution configurations for optimization
- **`paths.py`**: File path management

#### **`src/state/`** - Game State Management
- **`state.py`**: Master `GeneralGameState` class - the foundation of all games
- **`state_conditions.py`**: Condition checking (freespin triggers, etc.)
- **`books.py`**: Book (simulation record) management
- **`run_sims.py`**: Simulation execution engine

#### **`src/calculations/`** - Win Calculation Engines
- **`ways.py`**: Ways-to-win calculation logic
- **`lines.py`**: Paylines calculation logic
- **`cluster.py`**: Cluster pays calculation logic
- **`scatter.py`**: Scatter symbol logic
- **`board.py`**: Board manipulation utilities
- **`symbol.py`**: Symbol management and properties
- **`statistics.py`**: Statistical utilities

#### **`src/write_data/`** - Output Generation
- **`write_data.py`**: Core data writing functions
- **`write_configs.py`**: Configuration file generation
- Generates lookup tables, books, and configuration JSON files

### 2. **Game Implementations (`games/` directory)**

Each game folder contains a complete game implementation:

#### Required Files (Every Game Must Have)
1. **`game_config.py`**: Game-specific configuration (inherits from `src.config.config.Config`)
2. **`gamestate.py`**: Game-specific logic (inherits from `GameStateOverride`)
3. **`game_executables.py`**: Win evaluation implementations
4. **`game_calculations.py`**: Custom calculation methods
5. **`game_events.py`**: Event definitions
6. **`game_override.py`**: Game-specific state overrides
7. **`game_optimization.py`**: Optimization parameters
8. **`run.py`**: Main execution script
9. **`reels/`**: CSV files containing reel strip definitions

#### Optional Directories
- **`library/`**: Generated output files (configs, lookup tables, books)
- **`readme.txt`**: Game description

### 3. **Optimization Program (`optimization_program/`)**

Rust-based high-performance optimization engine:

- **Purpose**: Find optimal game configurations to hit target RTPs
- **Input**: Game simulation data, target constraints
- **Output**: Optimized lookup tables mapping bet outcomes
- **Language**: Rust (for computational efficiency)

### 4. **Utilities (`utils/`)**

Support tools:

- **`game_analytics/`**: Generate statistical summaries
- **`rgs_verification.py`**: Validate game compliance
- **`format_books_json.py`**: Format output files
- **`analysis/`**: Data analysis notebooks/scripts

### 5. **Documentation (`docs/`)**

MkDocs-based documentation:

- **`math_docs/`**: Math SDK documentation
- **`fe_docs/`**: Frontend integration docs
- **`rgs_docs/`**: RGS specification docs

---

## Workflow Pipeline

### Phase 1: Configuration
1. Define game in `game_config.py` (reels, paytable, symbols, RTP target)
2. Set up optimization parameters in `game_optimization.py`
3. Create reel strips in `reels/*.csv`

### Phase 2: Simulation
1. Run `run.py` with `"run_sims": True`
2. System generates millions of game rounds
3. Stores results in compressed "books" (`.jsonl.zst` files)

### Phase 3: Optimization
1. Run with `"run_optimization": True`
2. Rust optimization engine processes simulation data
3. Generates lookup tables mapping outcomes to bet indices
4. Iteratively adjusts until target RTP/HR constraints are met

### Phase 4: Analysis
1. Run with `"run_analysis": True`
2. Statistical analysis of results
3. Generate summary reports (`statistics_summary.json`)

### Phase 5: Validation
1. Run with `"run_format_checks": True`
2. Validate RGS compliance
3. Check file formats and integrity

### Phase 6: Output
Generated files in `library/` directory:
- **`configs/config.json`**: Main game configuration
- **`lookup_tables/*.csv`**: Bet outcome mapping tables
- **`books/*.jsonl.zst`**: Compressed simulation results
- **`publish_files/`**: Production-ready files for deployment

---

## Key Concepts

### RTP (Return to Player)
The percentage of all wagered money that a slot game pays back to players over time. Example: 97% RTP means for every $100 wagered, $97 is returned on average.

### Hit Rate (HR)
The percentage of spins that result in a win. Affects game volatility and player experience.

### Bet Modes
Different ways to play the game (e.g., base mode, bonus buy mode). Each has its own cost, RTP, and max win.

### Distributions
Segmented outcome categories used for optimization:
- **Wincap Distribution**: High wins at the wincap threshold
- **Freegame Distribution**: Rounds triggering bonus features
- **Basegame Distribution**: Regular wins
- **Zero Distribution**: Non-winning spins

### Books
Records of individual game simulations, stored in compressed JSON format. Each "book" contains:
- Board configuration (reel positions)
- Events triggered
- Wins awarded
- Final outcome

### Lookup Tables
CSV files mapping simulation outcomes to bet indices. Used by the backend to determine which pre-calculated result to return for a given bet.

### Game Types
- **Basegame**: Normal game play
- **Freegame**: Bonus/free spin mode
- **Superspin**: Additional special features

### Symbol Types
- **Paying Symbols**: Award wins (H1-H5 for high-value, L1-L4 for low-value)
- **Wild Symbols**: Substitute for paying symbols
- **Scatter Symbols**: Trigger features (often freespins)
- **Multiplier Symbols**: Multiply wins

### Win Calculation Methods
- **Lines**: Traditional payline wins
- **Ways**: All-ways wins (left-to-right adjacent symbols)
- **Cluster**: Group of adjacent matching symbols
- **Scatter**: Symbol count anywhere on board

---

## Getting Started

### Prerequisites
- Python 3.12+
- Rust/Cargo (for optimization)
- Make (optional, recommended)

### Quick Start
```bash
# Setup environment
make setup

# Run a game (e.g., 0_0_ways)
make run GAME=0_0_ways

# Or manually
python games/0_0_ways/run.py
```

### Creating a New Game
1. Copy `games/template/` to `games/<your_game>/`
2. Modify `game_config.py` with your game parameters
3. Create/modify reel strips in `reels/`
4. Customize game logic in `gamestate.py`
5. Run simulations and optimizations

---

## Next Steps

- See **[0_0_WAYS_GAME_DETAILED.md](./0_0_WAYS_GAME_DETAILED.md)** for an in-depth walkthrough of the ways game
- See **[COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md)** for detailed component documentation
- See **[WORKFLOW_AND_DATA_PIPELINE.md](./WORKFLOW_AND_DATA_PIPELINE.md)** for data flow details

---

## Support & Documentation

- **Full Docs**: [https://stakeengine.github.io/math-sdk/](https://stakeengine.github.io/math-sdk/)
- **Engine**: [https://engine.stake.com/](https://engine.stake.com/)
