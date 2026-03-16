# Component Architecture - Detailed Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Core SDK Components (`src/`)](#core-sdk-components-src)
3. [Configuration System](#configuration-system)
4. [State Management](#state-management)
5. [Calculation Engines](#calculation-engines)
6. [Event System](#event-system)
7. [Win Management](#win-management)
8. [Data Pipeline](#data-pipeline)
9. [Optimization System](#optimization-system)
10. [Class Inheritance Hierarchy](#class-inheritance-hierarchy)

---

## Architecture Overview

The Stake Engine Math SDK follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    GAME LAYER                           │
│  (games/0_0_ways/, games/0_0_lines/, etc.)             │
│  - Game-specific configuration                          │
│  - Custom game logic                                    │
│  - Reel strips                                          │
└────────────────────┬────────────────────────────────────┘
                     │ inherits from / uses
┌────────────────────┴────────────────────────────────────┐
│                    FRAMEWORK LAYER                       │
│  (src/)                                                 │
│  - Config, State, Calculations                          │
│  - Events, Win Manager                                  │
│  - Data writing, Books                                  │
└────────────────────┬────────────────────────────────────┘
                     │ uses
┌────────────────────┴────────────────────────────────────┐
│                  OPTIMIZATION LAYER                      │
│  (optimization_program/)                                │
│  - Rust-based optimization engine                       │
│  - Lookup table generation                              │
└────────────────────┬────────────────────────────────────┘
                     │ produces
┌────────────────────┴────────────────────────────────────┐
│                    OUTPUT LAYER                          │
│  (games/*/library/)                                     │
│  - Configuration JSONs                                  │
│  - Lookup tables                                        │
│  - Simulation books                                     │
│  - Statistics                                           │
└─────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Inheritance-Based Customization**: Games inherit from base classes and override specific methods
2. **Separation of Concerns**: Configuration, logic, calculations, and output are separated
3. **Reusability**: Core functionality is shared across all games
4. **Extensibility**: New games can be created without modifying core SDK
5. **Type Safety**: Clear interfaces between components

---

## Core SDK Components (`src/`)

### Directory Structure

```
src/
├── config/              # Configuration management
│   ├── config.py        # Base Config class
│   ├── betmode.py       # Bet mode definitions
│   ├── distributions.py # Distribution system
│   ├── paths.py         # File path management
│   └── output_filenames.py
│
├── state/               # Game state management
│   ├── state.py         # GeneralGameState (master class)
│   ├── state_conditions.py # Condition checking
│   ├── books.py         # Book/record management
│   └── run_sims.py      # Simulation execution
│
├── calculations/        # Win calculation engines
│   ├── ways.py          # Ways-to-win calculations
│   ├── lines.py         # Payline calculations
│   ├── cluster.py       # Cluster pays calculations
│   ├── scatter.py       # Scatter win calculations
│   ├── board.py         # Board manipulation
│   ├── symbol.py        # Symbol management
│   └── statistics.py    # Statistical utilities
│
├── events/              # Event emission system
│   └── events.py        # Event definitions
│
├── executables/         # Execution logic
│   └── executables.py   # Base executable methods
│
├── wins/                # Win tracking and management
│   └── win_manager.py   # WinManager class
│
├── write_data/          # Data output
│   ├── write_data.py    # Core writing functions
│   └── write_configs.py # Config generation
│
└── stakeengine/         # Package metadata
```

---

## Configuration System

### Component: `src/config/config.py`

**Purpose:** Define game parameters, symbols, paytables, and bet modes.

#### Class: `Config`

**Base configuration class** that all games inherit from.

```python
class Config:
    """Sets the default game-values required by the game-state."""
    
    def __init__(self):
        # Game Identity
        self.rtp = 0.97
        self.game_id = "0_0_sample"
        self.provider_name = "sample_provider"
        self.provider_number = 1
        self.game_name = "sample_game"
        self.wincap = 5000
        self.win_type = "lines"  # or "ways", "cluster", etc.
        
        # Game Dimensions
        self.num_reels = 5
        self.num_rows = [3] * self.num_reels
        
        # Symbols
        self.paytable = {}
        self.special_symbols = {None: []}
        
        # Freespin Configuration
        self.freespin_triggers = {}
        self.anticipation_triggers = {}
        
        # Reels
        self.reels = {}
        self.padding_reels = {}
        
        # Bet Modes
        self.bet_modes = []
        
        # Optimization Parameters
        self.opt_params = {None: None}
        
        # Win Levels
        self.win_levels = {...}
```

**Key Methods:**

- **`get_win_level(win_amount, winlevel_key)`**: Determine win tier
- **`get_special_symbol_names()`**: Extract all special symbol names
- **`get_paying_symbols()`**: Extract all paying symbol names
- **`read_reels_csv(file_path)`**: Load reel strips from CSV
- **`construct_paths()`**: Set up directory structure

**Usage in Games:**

```python
# games/0_0_ways/game_config.py
from src.config.config import Config

class GameConfig(Config):
    def __init__(self):
        super().__init__()
        self.game_id = "0_0_ways"
        self.win_type = "ways"
        self.paytable = {(5, "H1"): 10, ...}
        # ... custom configuration
```

---

### Component: `src/config/betmode.py`

**Purpose:** Define different betting modes (base game, bonus buy, etc.).

#### Class: `BetMode`

```python
class BetMode:
    """Defines a betting mode with cost, RTP, and distributions."""
    
    def __init__(self, name, cost, rtp, max_win, distributions, ...):
        self.name = name                  # e.g., "base", "bonus"
        self.cost = cost                  # Bet cost (1.0, 100.0, etc.)
        self.rtp = rtp                    # Target RTP (0.97)
        self.max_win = max_win            # Max win cap (5000)
        self.distributions = distributions  # List of Distribution objects
        self.auto_close_disabled = False
        self.is_feature = True
        self.is_buybonus = False
```

**Methods:**

- **`get_name()`**: Return mode name
- **`get_cost()`**: Return bet cost
- **`get_wincap()`**: Return max win
- **`get_distributions()`**: Return list of distributions

---

### Component: `src/config/distributions.py`

**Purpose:** Define outcome distributions for optimization.

#### Class: `Distribution`

```python
class Distribution:
    """Defines a segment of outcomes with specific criteria."""
    
    def __init__(self, criteria, quota, win_criteria=None, conditions={}):
        self.criteria = criteria          # "wincap", "freegame", "basegame", "0"
        self.quota = quota                # Percentage of outcomes (0.001 = 0.1%)
        self.win_criteria = win_criteria  # Specific win value (e.g., 5000)
        self.conditions = conditions      # Custom conditions dict
```

**Conditions Dictionary:**

```python
conditions = {
    "reel_weights": {
        "basegame": {"BR0": 0.7, "BR1": 0.3},
        "freegame": {"FR0": 1.0}
    },
    "force_wincap": True,
    "force_freegame": False,
    "scatter_triggers": {3: 100, 4: 20, 5: 5},
    "mult_values": {1: 200, 2: 100, 3: 80, 4: 50, 5: 20}
}
```

---

## State Management

### Component: `src/state/state.py`

**Purpose:** Master game state class that manages simulation flow.

#### Class: `GeneralGameState`

**The foundation of all games.** All game logic ultimately inherits from this class.

```python
class GeneralGameState(ABC):
    """Master gamestate which other classes inherit from."""
    
    def __init__(self, config):
        self.config = config
        self.win_manager = WinManager(...)
        self.symbol_storage = SymbolStorage(...)
        self.library = {}              # Stores simulation results
        self.recorded_events = {}      # Stores events for output
        self.board = [[...], [...]]    # Current symbol board
        self.sim = 0                   # Current simulation number
        self.criteria = ""             # Current distribution criteria
        self.book = Book(...)          # Current book/record
        self.repeat = True             # Repeat flag for condition checking
        self.win_data = {...}          # Current win information
        self.gametype = "basegame"     # Current game type
        self.fs = 0                    # Current free spin count
        self.tot_fs = 0                # Total free spins awarded
```

**Core Methods:**

##### 1. Initialization

```python
def create_symbol_map(self) -> None:
    """Construct all valid symbols from config file."""
    # Extracts symbols from paytable and special_symbols
    # Creates SymbolStorage object

def reset_seed(self, sim: int = 0, seed_override=None) -> None:
    """Reset RNG seed to simulation number for reproducibility."""
    random.seed(sim + 1)
    self.sim = sim
```

##### 2. Book Management

```python
def reset_book(self) -> None:
    """Reset global simulation variables for new spin."""
    self.board = [[[] for _ in range(...)] for _ in range(...)]
    self.book = Book(self.book_id, self.criteria)
    self.win_data = {"totalWin": 0, "wins": []}
    self.win_manager.reset_end_round_wins()
    self.final_win = 0
    self.gametype = self.config.basegame_type
    # ... reset all spin-specific variables
```

##### 3. Board Drawing

```python
def draw_board(self, emit_event=True) -> None:
    """Populate board with symbols from reel strips."""
    reel_weights = self.get_current_distribution_conditions().get("reel_weights", {})
    selected_reels = self.select_reel_strips(reel_weights[self.gametype])
    
    for reel_idx in range(self.config.num_reels):
        reel = selected_reels[reel_idx]
        stop_position = random.randint(0, len(reel) - 1)
        
        for row_idx in range(self.config.num_rows[reel_idx]):
            symbol_name = reel[(stop_position + row_idx) % len(reel)]
            symbol_obj = self.symbol_storage.get_symbol(symbol_name)
            self.apply_special_symbol_functions(symbol_obj)
            self.board[reel_idx][row_idx] = symbol_obj
    
    if emit_event:
        self.emit_board_event()
```

##### 4. Freespin Management

```python
def check_fs_condition(self) -> bool:
    """Check if scatter count triggers freespins."""
    scatter_count = self.count_special_symbols("scatter")
    return scatter_count in self.config.freespin_triggers[self.gametype]

def run_freespin_from_base(self) -> None:
    """Initialize and execute freespin feature."""
    self.tot_fs = self.get_freespin_count()
    self.gametype = self.config.freegame_type
    self.run_freespin()

def update_fs_retrigger_amt(self) -> None:
    """Add additional freespins from retrigger."""
    additional_spins = self.get_freespin_count()
    self.tot_fs += additional_spins
```

##### 5. Win Management

```python
def evaluate_finalwin(self) -> None:
    """Calculate final win including wincap check."""
    self.final_win = self.win_manager.get_final_win()
    if self.final_win > self.config.wincap:
        self.final_win = self.config.wincap
        self.wincap_triggered = True

def imprint_wins(self) -> None:
    """Record simulation result to library."""
    self.library[self.sim] = {
        "bookID": self.book_id,
        "finalWin": self.final_win,
        "criteria": self.criteria,
        "board": self.board_to_dict(),
        "events": self.recorded_events,
        # ... additional data
    }
```

##### 6. Repeat Logic

```python
def check_repeat(self) -> None:
    """Verify distribution conditions are satisfied."""
    self.check_game_repeat()
    
    if self.repeat:
        self.repeat_count += 1
        if self.repeat_count > 1000:
            raise RuntimeError("Infinite repeat loop detected")

@abstractmethod
def check_game_repeat(self):
    """Game-specific repeat logic (defined in game_override.py)."""
    pass
```

---

### Component: `src/state/state_conditions.py`

**Purpose:** Condition checking utilities.

#### Class: `Conditions`

```python
class Conditions(GeneralGameState):
    """Provides condition checking methods."""
    
    def check_freespin_entry(self) -> bool:
        """Check if should enter freespin based on distribution."""
        force_freegame = self.get_current_distribution_conditions().get("force_freegame", False)
        return force_freegame or (not self.distribution_forces_no_freegame())
    
    def count_special_symbols(self, symbol_type: str) -> int:
        """Count special symbols on board."""
        count = 0
        for reel in self.board:
            for symbol in reel:
                if symbol.has_type(symbol_type):
                    count += 1
        return count
```

---

### Component: `src/state/books.py`

**Purpose:** Manage individual simulation records (books).

#### Class: `Book`

```python
class Book:
    """Stores data for a single simulation."""
    
    def __init__(self, book_id, criteria):
        self.book_id = book_id
        self.criteria = criteria
        self.board = []
        self.events = []
        self.final_win = 0.0
        self.freespin_data = {}
    
    def add_event(self, event_type, event_data):
        """Record an event."""
        self.events.append({
            "type": event_type,
            "data": event_data
        })
```

---

### Component: `src/state/run_sims.py`

**Purpose:** Execute simulations in parallel.

#### Function: `create_books()`

```python
def create_books(gamestate, config, num_sim_args, batching_size, num_threads, ...):
    """Run simulations for all bet modes."""
    
    for bet_mode in config.bet_modes:
        mode_name = bet_mode.get_name()
        num_sims = num_sim_args[mode_name]
        
        # Run simulations in batches
        for batch_start in range(0, num_sims, batching_size):
            batch_end = min(batch_start + batching_size, num_sims)
            
            # Parallel execution
            with ThreadPoolExecutor(max_workers=num_threads) as executor:
                futures = []
                for sim_id in range(batch_start, batch_end):
                    future = executor.submit(run_single_sim, gamestate, sim_id)
                    futures.append(future)
                
                for future in futures:
                    future.result()
        
        # Write books to file
        write_books(gamestate, mode_name, compression)
```

---

## Calculation Engines

### Component: `src/calculations/ways.py`

**Purpose:** Calculate wins for "ways-to-win" games.

#### Class: `Ways`

```python
class Ways:
    """Ways-to-win calculation engine."""
    
    @staticmethod
    def get_ways_data(config, board):
        """Calculate all ways wins on board."""
        wins = []
        total_win = 0
        
        # Start from leftmost reel
        for row_idx in range(config.num_rows[0]):
            symbol = board[0][row_idx]
            if not symbol.is_paying():
                continue
            
            # Track consecutive reels with matching symbol
            ways_count = 1
            multipliers = []
            
            for reel_idx in range(1, config.num_reels):
                matching_symbols = []
                for row in board[reel_idx]:
                    if row.matches(symbol) or row.is_wild():
                        matching_symbols.append(row)
                
                if not matching_symbols:
                    break
                
                ways_count *= len(matching_symbols)
                
                # Collect multipliers
                for sym in matching_symbols:
                    if sym.has_multiplier():
                        multipliers.append(sym.get_multiplier())
                
                reel_count = reel_idx + 1
            
            # Calculate win if 3+ reels
            if reel_count >= 3:
                paytable_value = config.paytable.get((reel_count, symbol.name), 0)
                multiplier_total = Ways.calculate_multiplier(multipliers)
                win_amount = paytable_value * ways_count * multiplier_total
                
                wins.append({
                    "symbol": symbol.name,
                    "count": reel_count,
                    "ways": ways_count,
                    "multiplier": multiplier_total,
                    "win": win_amount
                })
                
                total_win += win_amount
        
        return {"totalWin": total_win, "wins": wins}
    
    @staticmethod
    def calculate_multiplier(multipliers):
        """Compound multipliers multiplicatively."""
        if not multipliers:
            return 1
        result = 1
        for mult in multipliers:
            result *= mult
        return result
```

---

### Component: `src/calculations/lines.py`

**Purpose:** Calculate wins for payline games.

#### Class: `Lines`

```python
class Lines:
    """Payline calculation engine."""
    
    @staticmethod
    def get_line_wins(config, board, line_definitions):
        """Calculate wins for all paylines."""
        wins = []
        total_win = 0
        
        for line_idx, line in enumerate(line_definitions):
            # line = [0, 1, 2, 1, 0] (row positions for each reel)
            line_symbols = [board[reel][line[reel]] for reel in range(len(line))]
            
            # Count consecutive matching symbols
            base_symbol = line_symbols[0]
            count = 1
            
            for reel in range(1, len(line_symbols)):
                if line_symbols[reel].matches(base_symbol) or line_symbols[reel].is_wild():
                    count += 1
                else:
                    break
            
            # Check paytable
            if count >= 3:
                paytable_value = config.paytable.get((count, base_symbol.name), 0)
                if paytable_value > 0:
                    wins.append({
                        "line": line_idx,
                        "symbol": base_symbol.name,
                        "count": count,
                        "win": paytable_value
                    })
                    total_win += paytable_value
        
        return {"totalWin": total_win, "wins": wins}
```

---

### Component: `src/calculations/cluster.py`

**Purpose:** Calculate wins for cluster-pay games.

#### Class: `Cluster`

```python
class Cluster:
    """Cluster pays calculation engine."""
    
    @staticmethod
    def find_clusters(board):
        """Find all connected clusters of matching symbols."""
        visited = set()
        clusters = []
        
        for reel in range(len(board)):
            for row in range(len(board[reel])):
                if (reel, row) in visited:
                    continue
                
                symbol = board[reel][row]
                if not symbol.is_paying():
                    continue
                
                # BFS to find connected cluster
                cluster = Cluster.bfs_cluster(board, reel, row, symbol, visited)
                
                if len(cluster) >= 5:  # Minimum cluster size
                    clusters.append(cluster)
        
        return clusters
```

---

### Component: `src/calculations/symbol.py`

**Purpose:** Symbol object management.

#### Class: `Symbol`

```python
class Symbol:
    """Represents a single symbol on the board."""
    
    def __init__(self, name, symbol_types):
        self.name = name                    # "H1", "W", "S", etc.
        self.types = symbol_types           # ["paying"], ["wild"], ["scatter"]
        self.attributes = {}                # {"multiplier": 3}
    
    def is_paying(self) -> bool:
        return "paying" in self.types
    
    def is_wild(self) -> bool:
        return "wild" in self.types
    
    def is_scatter(self) -> bool:
        return "scatter" in self.types
    
    def matches(self, other_symbol) -> bool:
        """Check if this symbol matches another."""
        return self.name == other_symbol.name
    
    def has_multiplier(self) -> bool:
        return "multiplier" in self.attributes
    
    def get_multiplier(self) -> int:
        return self.attributes.get("multiplier", 1)
    
    def assign_attribute(self, attribute_dict):
        """Assign custom attributes (e.g., multipliers)."""
        self.attributes.update(attribute_dict)
```

#### Class: `SymbolStorage`

```python
class SymbolStorage:
    """Manages symbol objects for a game."""
    
    def __init__(self, config, all_symbols):
        self.config = config
        self.symbol_map = {}
        
        for symbol_name in all_symbols:
            types = self.determine_symbol_types(symbol_name)
            self.symbol_map[symbol_name] = Symbol(symbol_name, types)
    
    def get_symbol(self, symbol_name):
        """Get a copy of a symbol."""
        base_symbol = self.symbol_map[symbol_name]
        return Symbol(base_symbol.name, base_symbol.types.copy())
```

---

## Event System

### Component: `src/events/events.py`

**Purpose:** Define and emit game events for frontend.

#### Event Types

```python
class EventTypes:
    BOARD_POPULATED = "boardPopulated"
    WIN_OCCURRED = "winOccurred"
    FREESPIN_TRIGGERED = "freespinTriggered"
    FREESPIN_RETRIGGER = "freespinRetrigger"
    FREESPIN_END = "freespinEnd"
    ANTICIPATION = "anticipation"
    WINCAP_TRIGGERED = "wincapTriggered"
```

#### Event Emission

```python
def emit_win_event(gamestate, win_data):
    """Emit a win event."""
    event = {
        "type": EventTypes.WIN_OCCURRED,
        "data": {
            "totalWin": win_data["totalWin"],
            "wins": win_data["wins"],
            "winLevel": gamestate.config.get_win_level(win_data["totalWin"], "standard")
        }
    }
    gamestate.book.add_event(event["type"], event["data"])
```

---

## Win Management

### Component: `src/wins/win_manager.py`

**Purpose:** Track and manage wins across game types.

#### Class: `WinManager`

```python
class WinManager:
    """Manages win tracking for basegame and freegame."""
    
    def __init__(self, basegame_type, freegame_type, wincap):
        self.basegame_type = basegame_type
        self.freegame_type = freegame_type
        self.wincap = wincap
        
        self.basegame_wins = 0.0
        self.freegame_wins = 0.0
        self.current_spin_win = 0.0
    
    def update_spinwin(self, win_amount):
        """Update current spin win."""
        self.current_spin_win += win_amount
    
    def update_gametype_wins(self, gametype):
        """Add spin win to appropriate game type total."""
        if gametype == self.basegame_type:
            self.basegame_wins += self.current_spin_win
        elif gametype == self.freegame_type:
            self.freegame_wins += self.current_spin_win
        
        self.current_spin_win = 0.0
    
    def get_final_win(self):
        """Get total win with wincap applied."""
        total = self.basegame_wins + self.freegame_wins
        return min(total, self.wincap)
    
    def reset_end_round_wins(self):
        """Reset for new simulation."""
        self.basegame_wins = 0.0
        self.freegame_wins = 0.0
        self.current_spin_win = 0.0
```

---

## Data Pipeline

### Component: `src/write_data/write_data.py`

**Purpose:** Write simulation results to files.

#### Key Functions

```python
def write_books(gamestate, mode_name, compression=True):
    """Write simulation books to file."""
    output_file = f"library/books/books_{mode_name}.jsonl"
    
    if compression:
        output_file += ".zst"
        compressor = zstd.ZstdCompressor()
        with open(output_file, 'wb') as f:
            with compressor.stream_writer(f) as writer:
                for book_id, book_data in gamestate.library.items():
                    json_line = json.dumps(book_data) + "\n"
                    writer.write(json_line.encode('utf-8'))
    else:
        with open(output_file, 'w') as f:
            for book_data in gamestate.library.values():
                f.write(json.dumps(book_data) + "\n")
```

```python
def make_lookup_tables(optimization_results, mode_name):
    """Generate lookup tables from optimization results."""
    output_file = f"library/lookup_tables/lookUpTable_{mode_name}.csv"
    
    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["index", "bookID", "RTP", "HR", "average_win"])
        
        for idx, result in enumerate(optimization_results):
            writer.writerow([
                idx,
                result['bookID'],
                result['rtp'],
                result['hit_rate'],
                result['average_win']
            ])
```

---

### Component: `src/write_data/write_configs.py`

**Purpose:** Generate configuration JSON files.

#### Function: `generate_configs()`

```python
def generate_configs(gamestate):
    """Generate all configuration files."""
    config = gamestate.config
    
    # Main config.json
    config_data = {
        "gameID": config.game_id,
        "workingName": config.working_name,
        "rtp": config.rtp * 100,  # Convert to percentage
        "wincap": config.wincap,
        "providerNumber": config.provider_number,
        "bookShelfConfig": []
    }
    
    for bet_mode in config.bet_modes:
        mode_config = {
            "name": bet_mode.get_name(),
            "cost": bet_mode.get_cost(),
            "rtp": bet_mode.rtp,
            "maxWin": bet_mode.get_wincap(),
            "feature": bet_mode.is_feature,
            "buyBonus": bet_mode.is_buybonus,
            "tables": generate_table_references(bet_mode),
            "booksFile": {"file": f"books_{bet_mode.get_name()}.jsonl.zst"},
        }
        config_data["bookShelfConfig"].append(mode_config)
    
    # Write to file
    with open("library/configs/config.json", 'w') as f:
        json.dump(config_data, f, indent=2)
```

---

## Optimization System

### Component: `optimization_program/`

**Purpose:** Rust-based optimization engine for finding optimal game configurations.

#### Architecture

```
optimization_program/
├── Cargo.toml                   # Rust dependencies
├── optimization_config.py       # Python configuration classes
├── run_script.py                # Python orchestration
└── src/                         # Rust source
    ├── main.rs                  # Entry point
    ├── optimizer.rs             # Optimization algorithm
    ├── fitness.rs               # Fitness evaluation
    └── lookup_table.rs          # Lookup table generation
```

#### Python Configuration Classes

```python
class ConstructConditions:
    """Define optimization constraints for a distribution."""
    
    def __init__(self, rtp=None, hr=None, av_win=None, search_conditions=None):
        self.rtp = rtp              # Target RTP contribution
        self.hr = hr                # Target hit rate
        self.av_win = av_win        # Average win target
        self.search_conditions = search_conditions
    
    def return_dict(self):
        return {
            "rtp": self.rtp,
            "hit_rate": self.hr,
            "average_win": self.av_win,
            "search": self.search_conditions
        }
```

```python
class ConstructParameters:
    """Define optimization algorithm parameters."""
    
    def __init__(self, num_show, num_per_fence, min_m2m, max_m2m, 
                 pmb_rtp, sim_trials, test_spins, test_weights, score_type):
        self.num_show = num_show              # Candidates to show per generation
        self.num_per_fence = num_per_fence    # Population size per zone
        self.min_m2m = min_m2m                # Minimum match-to-match distance
        self.max_m2m = max_m2m                # Maximum match-to-match distance
        self.pmb_rtp = pmb_rtp                # PMB RTP target
        self.sim_trials = sim_trials          # Simulations per candidate
        self.test_spins = test_spins          # Test spin counts
        self.test_weights = test_weights      # Weights for test spins
        self.score_type = score_type          # "rtp" or "variance"
```

#### Optimization Flow

```
1. Load simulation books
   ↓
2. Segment books by distribution criteria
   ↓
3. For each distribution:
   a. Initialize population of lookup table candidates
   b. Evaluate fitness (how close to target RTP/HR)
   c. Select best candidates
   d. Mutate and crossover
   e. Repeat until convergence
   ↓
4. Combine optimized distributions into final lookup table
   ↓
5. Write lookup table CSV
```

---

## Class Inheritance Hierarchy

### Game State Inheritance Chain

```
ABC (Python Abstract Base Class)
  ↓
GeneralGameState (src/state/state.py)
  ├── Core methods: reset_seed(), reset_book(), draw_board()
  ├── Abstract methods: assign_special_sym_function()
  ↓
Conditions (src/state/state_conditions.py)
  ├── Adds: check_fs_condition(), check_freespin_entry()
  ↓
Executables (src/executables/executables.py)
  ├── Adds: run_spin(), run_freespin(), evaluate_finalwin()
  ↓
GameCalculations (games/*/game_calculations.py)
  ├── Game-specific calculation extensions
  ↓
GameExecutables (games/*/game_executables.py)
  ├── Adds: evaluate_ways_board() or evaluate_lines()
  ↓
GameStateOverride (games/*/game_override.py)
  ├── Adds: assign_mult_property(), check_game_repeat()
  ↓
GameState (games/*/gamestate.py)
  └── Implements: run_spin(), run_freespin() with game logic
```

### Config Inheritance Chain

```
Config (src/config/config.py)
  ├── Base configuration
  ↓
GameConfig (games/*/game_config.py)
  └── Game-specific configuration
```

### Execution Flow

```
run.py
  ├── Creates: GameConfig()
  ├── Creates: GameState(config)
  │    └── Inherits full chain: GeneralGameState → ... → GameState
  │
  ├── Calls: create_books(gamestate, ...)
  │    └── For each sim: gamestate.run_spin(sim)
  │         └── Calls methods up the inheritance chain
  │
  ├── Calls: generate_configs(gamestate)
  │
  ├── Calls: OptimizationExecution().run_all_modes(...)
  │
  └── Calls: create_stat_sheet(gamestate, ...)
```

---

## Summary

The Stake Engine Math SDK architecture provides:

1. **Layered Design**: Clear separation between framework and game-specific code
2. **Inheritance-Based Customization**: Games extend base classes with minimal code
3. **Modular Calculations**: Pluggable win calculation engines (ways, lines, cluster)
4. **Flexible Configuration**: Distribution-based outcome segmentation
5. **High-Performance Optimization**: Rust-based algorithm for RTP targeting
6. **Complete Data Pipeline**: From configuration → simulation → optimization → output

This architecture enables rapid game development while maintaining mathematical rigor and production-quality output.

---

For specific implementation examples, see:
- **[0_0_WAYS_GAME_DETAILED.md](./0_0_WAYS_GAME_DETAILED.md)** - Complete game walkthrough
- **[REPOSITORY_OVERVIEW.md](./REPOSITORY_OVERVIEW.md)** - High-level overview
