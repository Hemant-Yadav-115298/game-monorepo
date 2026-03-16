"""Game logic and event emission for TBD 15625 Ways Hold & Spin game.

Features:
- 6 reels × 5 rows ways game (15,625 ways = 5^6)
- Hold & Spin: triggered by 6+ money symbols
- Free Spins: triggered by 3+ scatter symbols
- Fixed Jackpots: MINI (20x), MINOR (50x), MAJOR (200x), GRAND (1000x full grid)
- Hold & Spin can trigger within Free Spins (with growing multiplier)
- Random wild reel during Free Spins (5% chance)

Key fixes from 1_0_mining_ways:
- H&S money probability reduced to prevent RTP inflation
- FRWCAP reel usage balanced (FR0:FRWCAP = 3:1 vs old 1:5)
- Wincap checks added mid-H&S to prevent runaway wins
- Multiplier growth capped during FS Hold & Spin
"""

from copy import deepcopy
from game_override import GameStateOverride
from game_events import (
    holdnspin_trigger_event,
    holdnspin_respin_event,
    holdnspin_end_event,
    jackpot_event,
    set_win_event,
    set_total_event,
)


class GameState(GameStateOverride):
    """Handle basegame, freegame, and hold & spin logic."""

    def run_spin(self, sim: int, simulation_seed=None) -> None:
        """Execute a single base game spin with potential feature triggers."""
        self.reset_seed(sim)
        self.repeat = True
        while self.repeat:
            self.reset_book()
            self.draw_board(emit_event=True)

            # Evaluate ways wins on the base game board
            self.evaluate_ways_board()

            # Check for Hold & Spin trigger (6+ money symbols)
            holdnspin_triggered = self.check_holdnspin_trigger()

            # Check for Free Spin trigger (3+ scatters)
            fs_triggered = self.check_fs_condition() and self.check_freespin_entry()

            if holdnspin_triggered and not fs_triggered:
                # Hold & Spin takes priority when no free spins
                self.run_hold_and_spin(is_freespin=False)
                # Track combined base game + H&S wins
                self.win_manager.update_gametype_wins(self.gametype)
            elif fs_triggered:
                # Track base game ways win before entering free spins
                self.win_manager.update_gametype_wins(self.gametype)
                # Free Spins (Hold & Spin can trigger within)
                self.run_freespin_from_base()
            else:
                # Standard base game - track ways win
                self.win_manager.update_gametype_wins(self.gametype)
                # Check Hold & Spin criteria satisfaction
                conditions = self.get_current_distribution_conditions()
                if conditions.get("force_holdnspin", False):
                    self.repeat = True

            self.evaluate_finalwin()
            self.check_repeat()

            # Additional check: if force_holdnspin, H&S must have triggered
            if self.repeat is False:
                conditions = self.get_current_distribution_conditions()
                if conditions.get("force_holdnspin", False) and not self.holdnspin_triggered:
                    self.repeat = True

        self.imprint_wins()

    def run_freespin(self) -> None:
        """Execute the free spins feature.

        During free spins:
        - Money symbols have minimum 2x value
        - Hold & Spin can trigger within if 6+ money symbols land
        - Growing multiplier during Hold & Spin respins (+1 per round)
        - 5% chance of random fully wild reel per spin
        """
        self.reset_fs_spin()

        while self.fs < self.tot_fs:
            self.update_freespin()
            self.draw_board(emit_event=True)

            # Apply random wild reel chance (5% per spec)
            self.apply_random_wild_reel()

            # Evaluate ways wins
            self.evaluate_ways_board()

            # Check for Hold & Spin trigger within free spins
            if self.check_holdnspin_trigger():
                self.run_hold_and_spin(is_freespin=True)

            # Check for free spin retrigger
            if self.check_fs_condition():
                self.update_fs_retrigger_amt()

            self.win_manager.update_gametype_wins(self.gametype)

            # FIX: Check wincap during free spins to prevent runaway
            if self.win_manager.running_bet_win >= self.config.wincap:
                break

        self.end_freespin()

    def run_hold_and_spin(self, is_freespin=False) -> None:
        """Execute the Hold & Spin feature.

        Hold & Spin flow:
        1. Lock all money symbols on the board
        2. Start with 3 respins
        3. Each respin: for each non-locked position, check if money symbol lands
        4. New money symbol: lock it, reset respins to 3
        5. No new money: decrement respins
        6. Continue until respins = 0
        7. If full grid (30 symbols locked): award GRAND jackpot (1000x)
        8. Sum all money prizes as Hold & Spin win

        Args:
            is_freespin: If True, applies Free Spin enhancements
                        (higher money values, growing multiplier)
        """
        self.holdnspin_triggered = True
        self.in_holdnspin = True

        # Record Hold & Spin trigger for statistics
        self.record({
            "kind": self.count_money_symbols(),
            "symbol": "money",
            "gametype": self.gametype,
            "feature": "holdnspin",
        })

        # Create a working copy of the board for Hold & Spin
        self.holdnspin_board = deepcopy(self.board)

        # Lock all existing money symbols
        self.lock_money_symbols(self.holdnspin_board)

        # Initialize respins
        self.holdnspin_respins = self.config.holdnspin_initial_respins
        self.holdnspin_multiplier = 1
        respin_count = 0

        # Get initial money positions for trigger event
        money_positions = self.get_money_positions(self.holdnspin_board)
        holdnspin_trigger_event(self, money_positions, is_freespin)

        # FIX: Cap maximum multiplier growth during FS H&S to prevent RTP runaway
        max_fs_multiplier = 10

        # Hold & Spin respin loop
        while self.holdnspin_respins > 0:
            respin_count += 1

            # If in free spins, grow multiplier each round (capped)
            if is_freespin and self.holdnspin_multiplier < max_fs_multiplier:
                self.holdnspin_multiplier += self.config.fs_holdnspin_mult_growth

            # Perform respin: check each unlocked position for new money symbol
            new_money = self.perform_holdnspin_respin(self.holdnspin_board, is_freespin)

            if len(new_money) > 0:
                # New money symbol(s) landed - reset respins
                self.holdnspin_respins = self.config.holdnspin_initial_respins
            else:
                # No new money - decrement respins
                self.holdnspin_respins -= 1

            # Emit respin event
            holdnspin_respin_event(
                self,
                respin_num=respin_count,
                respins_remaining=self.holdnspin_respins,
                new_money_positions=new_money,
                board=self.holdnspin_board,
            )

            # FIX: Check for wincap during Hold & Spin
            current_prize = self.calculate_holdnspin_win(self.holdnspin_board)
            if (self.win_manager.running_bet_win + current_prize * self.holdnspin_multiplier) >= self.config.wincap:
                break

        # Calculate Hold & Spin total win
        holdnspin_prize_sum = self.calculate_holdnspin_win(self.holdnspin_board)

        # Check for GRAND jackpot (full grid)
        jackpot_awarded = None
        if self.check_holdnspin_full_grid(self.holdnspin_board):
            jackpot_awarded = "GRAND"
            holdnspin_prize_sum += self.config.jackpot_values["GRAND"]
            jackpot_event(self, "GRAND", self.config.jackpot_values["GRAND"])

        # Apply Free Spin multiplier if applicable
        holdnspin_final_win = holdnspin_prize_sum * self.holdnspin_multiplier

        # Cap at wincap - running win
        remaining_cap = max(0, self.config.wincap - self.win_manager.running_bet_win)
        holdnspin_final_win = min(holdnspin_final_win, remaining_cap)

        # Update win manager
        self.win_manager.update_spinwin(holdnspin_final_win)

        # Emit Hold & Spin end event
        holdnspin_end_event(self, holdnspin_final_win, jackpot_awarded)

        # Update set_total for running total
        set_total_event(self)

        self.in_holdnspin = False
        self.holdnspin_win = holdnspin_final_win

    def check_freespin_entry(self, scatter_key: str = "scatter") -> bool:
        """Override to handle Hold & Spin criteria that shouldn't force free spins."""
        conditions = self.get_current_distribution_conditions()

        # If this is a Hold & Spin forced distribution, don't allow free spins
        if conditions.get("force_holdnspin", False) and not conditions.get("force_freegame", False):
            return False

        # Standard free spin entry check
        if conditions.get("force_freegame", False) and self.count_special_symbols(scatter_key) >= min(
            self.config.freespin_triggers[self.gametype].keys()
        ):
            return True

        # Not a forced distribution but scatters landed naturally
        if not conditions.get("force_freegame", False) and self.count_special_symbols(scatter_key) >= min(
            self.config.freespin_triggers[self.gametype].keys()
        ):
            return True

        if conditions.get("force_freegame", False):
            self.repeat = True
        return False

    def _force_money_on_board(self, target_count):
        """Force additional money symbols onto the board to reach target_count.

        Draws a board, then replaces random non-special positions with M symbols
        until the board has at least target_count money symbols.
        """
        import random as rng
        self.create_board_reelstrips()

        # Remove any scatter symbols that would trigger free spins
        conditions = self.get_current_distribution_conditions()
        if not conditions.get("force_freegame", False):
            for reel_idx, reel in enumerate(self.board):
                for row_idx, sym in enumerate(reel):
                    if sym.name == "S":
                        replacement = rng.choice(["A", "K", "Q", "J", "10"])
                        self.board[reel_idx][row_idx] = self.create_symbol(replacement)

        # Count current money symbols
        current_money = self.count_money_symbols()

        if current_money >= target_count:
            self.get_special_symbols_on_board()
            return

        # Find positions that are not money/wild/scatter
        available_positions = []
        for reel_idx, reel in enumerate(self.board):
            for row_idx, sym in enumerate(reel):
                if sym.name not in ("M", "W", "S"):
                    available_positions.append((reel_idx, row_idx))

        # Randomly select positions to place money symbols
        needed = target_count - current_money
        if needed > len(available_positions):
            needed = len(available_positions)

        rng.shuffle(available_positions)
        for i in range(needed):
            reel_idx, row_idx = available_positions[i]
            new_sym = self.create_symbol("M")
            self.board[reel_idx][row_idx] = new_sym

        # Refresh special symbol tracking
        self.get_special_symbols_on_board()

    def draw_board(self, emit_event: bool = True, trigger_symbol: str = "scatter") -> None:
        """Override draw_board to handle Hold & Spin forced distributions.

        For 'force_holdnspin' criteria, ensure enough money symbols land on the board.
        """
        conditions = self.get_current_distribution_conditions()

        if conditions.get("force_holdnspin", False) and self.gametype == self.config.basegame_type:
            # Force a board with enough money symbols for Hold & Spin
            self._force_money_on_board(self.config.holdnspin_trigger_count)

            if emit_event:
                from src.events.events import reveal_event
                reveal_event(self)
        elif (
            conditions.get("force_freegame", False)
            and self.gametype == self.config.basegame_type
        ):
            # Standard forced scatter behavior with safety cap
            from src.calculations.statistics import get_random_outcome
            num_scatters = get_random_outcome(conditions["scatter_triggers"])
            # Cap to num_reels - force_special_board can only place 1 per reel
            num_scatters = min(num_scatters, self.config.num_reels)

            # Use retry limit to avoid infinite loop from stacked specials
            max_attempts = 200
            for attempt in range(max_attempts):
                self._force_special_board(trigger_symbol, num_scatters)
                if self.count_special_symbols(trigger_symbol) == num_scatters:
                    break
            else:
                # Fallback: just make sure we have at least minimum trigger count
                min_trigger = min(self.config.freespin_triggers[self.gametype].keys())
                for attempt in range(max_attempts):
                    self._force_special_board(trigger_symbol, min_trigger)
                    if self.count_special_symbols(trigger_symbol) >= min_trigger:
                        break

            if emit_event:
                from src.events.events import reveal_event
                reveal_event(self)
        elif (
            not conditions.get("force_freegame", False)
            and not conditions.get("force_holdnspin", False)
            and self.gametype == self.config.basegame_type
        ):
            # Normal basegame: ensure no scatter trigger and no H&S trigger for non-feature criteria
            self.create_board_reelstrips()
            while self.count_special_symbols(trigger_symbol) >= min(
                self.config.freespin_triggers[self.gametype].keys()
            ):
                self.create_board_reelstrips()

            # FIX: For non-H&S criteria, also ensure we don't accidentally trigger H&S
            if not conditions.get("force_holdnspin", False):
                retry_count = 0
                while self.count_money_symbols() >= self.config.holdnspin_trigger_count and retry_count < 100:
                    self.create_board_reelstrips()
                    while self.count_special_symbols(trigger_symbol) >= min(
                        self.config.freespin_triggers[self.gametype].keys()
                    ):
                        self.create_board_reelstrips()
                    retry_count += 1

            if emit_event:
                from src.events.events import reveal_event
                reveal_event(self)
        else:
            # During freegame or other game types
            self.create_board_reelstrips()
            if emit_event:
                from src.events.events import reveal_event
                reveal_event(self)
