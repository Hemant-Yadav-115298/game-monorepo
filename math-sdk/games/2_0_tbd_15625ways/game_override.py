"""Game override - custom symbol functions, Hold & Spin logic, money symbol assignment.

Key fixes from 1_0_mining_ways:
- Reduced holdnspin_money_prob (was 0.10-0.15, now 0.04-0.05)
- Reduced jackpot probability (was 0.5%, now 0.3%)
- Capped H&S multiplier growth during free spins
- Added wincap checks during H&S to prevent infinite growth
- Fixed free spin money values to be less generous
"""

import random
from game_executables import GameExecutables
from src.calculations.statistics import get_random_outcome


class GameStateOverride(GameExecutables):
    """
    Overrides and extends universal state.py functions for TBD 15625 Ways game.
    Handles money symbol value assignment, Hold & Spin respin logic, and jackpot evaluation.
    """

    def reset_book(self):
        """Reset global values and Hold & Spin specific state."""
        super().reset_book()
        # Hold & Spin state
        self.holdnspin_board = None
        self.holdnspin_respins = 0
        self.holdnspin_win = 0.0
        self.holdnspin_multiplier = 1
        self.holdnspin_jackpot = None
        self.holdnspin_triggered = False
        self.in_holdnspin = False
        # Track jackpot types by position (reel, row) -> jackpot_type
        self.jackpot_positions = {}

    def assign_special_sym_function(self):
        """Define custom symbol functions for money symbols."""
        self.special_symbol_functions = {
            "M": [self.assign_money_value],
        }

    def assign_money_value(self, symbol):
        """Assign a prize value to a money symbol based on distribution weights.

        Money symbols can award:
        - A multiplier value (1x, 2x, 3x, 5x, 10x, 20x, 50x)
        - A jackpot (MINI=20x, MINOR=50x, MAJOR=200x) with 0.3% chance
        """
        # Determine money values based on current game state
        if hasattr(self, "gametype") and self.gametype == self.config.freegame_type:
            money_values = self.config.money_values_freegame
        else:
            conditions = self.get_current_distribution_conditions()
            money_values = conditions.get("money_values", self.config.money_values_base)

        # Check for jackpot
        if random.random() < self.config.money_jackpot_prob:
            # Award a random jackpot
            jackpot_type = get_random_outcome(self.config.jackpot_weights)
            prize_value = self.config.jackpot_values[jackpot_type]
            symbol.assign_attribute({"prize": prize_value})
            symbol.has_prize = True
        else:
            # Award a regular money value
            prize_value = get_random_outcome(money_values)
            symbol.assign_attribute({"prize": prize_value})
            symbol.has_prize = True

    def assign_money_value_holdnspin(self):
        """Assign money value specifically during Hold & Spin respins.
        Returns (prize_value, jackpot_type_or_None).
        """
        if hasattr(self, "gametype") and self.gametype == self.config.freegame_type:
            money_values = self.config.money_values_freegame
        else:
            conditions = self.get_current_distribution_conditions()
            money_values = conditions.get("money_values", self.config.money_values_base)

        # Check for jackpot
        if random.random() < self.config.money_jackpot_prob:
            jackpot_type = get_random_outcome(self.config.jackpot_weights)
            prize_value = self.config.jackpot_values[jackpot_type]
            return prize_value, jackpot_type
        else:
            prize_value = get_random_outcome(money_values)
            return prize_value, None

    def get_jackpot_type_from_prize(self, prize_value):
        """Determine if a prize value corresponds to a jackpot.
        Returns the jackpot type string or None."""
        for jp_type, jp_value in self.config.jackpot_values.items():
            if prize_value == jp_value:
                return jp_type
        return None

    def perform_holdnspin_respin(self, board, is_freespin=False):
        """Execute a single Hold & Spin respin.

        For each non-locked position, randomly determine if a money symbol appears.
        If it does, lock it and assign a prize value. Returns list of new money positions.

        FIX from 1_0: Uses per-distribution money_prob (reduced from 0.10-0.15 to 0.04-0.05)
        which controls the rate of new money symbols per position per respin.

        Args:
            board: The current Hold & Spin board (list of lists of Symbol objects)
            is_freespin: Whether this is happening during Free Spins

        Returns:
            new_money_positions: List of dicts with reel/row of newly landed money symbols
        """
        conditions = self.get_current_distribution_conditions()
        money_prob = conditions.get("holdnspin_money_prob", self.config.holdnspin_money_prob)
        new_money_positions = []

        for reel_idx, reel in enumerate(board):
            for row_idx, sym in enumerate(reel):
                if not sym.locked:
                    # Check if a money symbol lands on this position
                    if random.random() < money_prob:
                        # Create a new money symbol at this position
                        new_sym = self.symbol_storage.create_symbol("M")
                        prize_value, jackpot_type = self.assign_money_value_holdnspin()
                        new_sym.assign_attribute({"prize": prize_value})
                        new_sym.has_prize = True
                        new_sym.assign_attribute({"locked": True})
                        board[reel_idx][row_idx] = new_sym
                        # Track jackpot position if applicable
                        if jackpot_type is not None:
                            self.jackpot_positions[(reel_idx, row_idx)] = jackpot_type
                        new_money_positions.append({
                            "reel": reel_idx,
                            "row": row_idx,
                            "prize": prize_value,
                            "jackpot_type": jackpot_type,
                        })

        return new_money_positions

    def lock_money_symbols(self, board):
        """Lock all money symbols currently on the board."""
        for reel in board:
            for sym in reel:
                if sym.name == "M":
                    sym.assign_attribute({"locked": True})

    def apply_random_wild_reel(self):
        """During Free Spins, randomly convert an entire reel to wilds (5% chance).
        Only applies to reels that can have wilds (reels 2, 3, 4 = indices 1, 2, 3).
        """
        if random.random() < self.config.fs_wild_reel_chance:
            # Choose a random eligible reel (indices 1, 2, 3)
            wild_reel = random.choice([1, 2, 3])
            for row_idx in range(len(self.board[wild_reel])):
                wild_sym = self.symbol_storage.create_symbol("W")
                self.board[wild_reel][row_idx] = wild_sym
            # Refresh special symbols after board modification
            self.get_special_symbols_on_board()

    def check_game_repeat(self):
        """Verify final simulation outcomes satisfied all distribution/criteria conditions."""
        if self.repeat is False:
            win_criteria = self.get_current_betmode_distributions().get_win_criteria()
            if win_criteria is not None and self.final_win != win_criteria:
                self.repeat = True

        # For Hold & Spin criteria, ensure H&S was actually triggered
        if self.repeat is False:
            conditions = self.get_current_distribution_conditions()
            if conditions.get("force_holdnspin", False) and not self.holdnspin_triggered:
                self.repeat = True
