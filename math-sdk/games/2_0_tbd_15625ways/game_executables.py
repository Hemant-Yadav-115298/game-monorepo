"""Game executables - ways evaluation and Hold & Spin board evaluation."""

from game_calculations import GameCalculations
from src.calculations.ways import Ways


class GameExecutables(GameCalculations):
    """Executable actions for TBD 15625 Ways game: ways wins + Hold & Spin evaluation."""

    def evaluate_ways_board(self):
        """Populate win-data, record wins, transmit events for ways wins."""
        self.win_data = Ways.get_ways_data(self.config, self.board)
        if self.win_data["totalWin"] > 0:
            Ways.record_ways_wins(self)
            self.win_manager.update_spinwin(self.win_data["totalWin"])
        Ways.emit_wayswin_events(self)

    def _resolve_symbol_names(self, symbol_key_or_name: str):
        """Return the symbol names for a special symbol key or a direct symbol name."""
        if symbol_key_or_name in self.config.special_symbols:
            return self.config.special_symbols[symbol_key_or_name]
        return [symbol_key_or_name]

    def count_left_to_right_reels_with_symbol(self, symbol_key_or_name: str, board=None) -> int:
        """Count consecutive reels from the left that contain the target symbol."""
        if board is None:
            board = self.board
        symbol_names = self._resolve_symbol_names(symbol_key_or_name)
        consecutive_reels = 0
        for reel in board:
            if any(sym.name in symbol_names for sym in reel):
                consecutive_reels += 1
            else:
                break
        return consecutive_reels

    def _get_scatter_trigger_reel_count(self, scatter_key: str = "scatter") -> int:
        """Return the left-to-right scatter reel count capped to the trigger table."""
        scatter_reels = self.count_left_to_right_reels_with_symbol(scatter_key)
        max_trigger = max(self.config.freespin_triggers[self.gametype].keys())
        return min(scatter_reels, max_trigger)

    def check_holdnspin_trigger(self):
        """Check if enough money symbols are on board to trigger Hold & Spin."""
        money_count = self.count_money_symbols()
        if money_count < self.config.holdnspin_trigger_count:
            return False
        return (
            self.count_left_to_right_reels_with_symbol("money")
            >= self.config.holdnspin_trigger_count
        )

    def check_fs_condition(self, scatter_key: str = "scatter") -> bool:
        """Check if there are enough adjacent scatters to trigger fs."""
        min_trigger = min(self.config.freespin_triggers[self.gametype].keys())
        if self._get_scatter_trigger_reel_count(scatter_key) >= min_trigger and not (self.repeat):
            return True
        return False

    def run_freespin_from_base(self, scatter_key: str = "scatter") -> None:
        """Trigger the freespin function and update total fs amount."""
        scatter_reels = self._get_scatter_trigger_reel_count(scatter_key)
        self.record(
            {
                "kind": scatter_reels,
                "symbol": scatter_key,
                "gametype": self.gametype,
            }
        )
        self.update_freespin_amount(scatter_key)
        self.run_freespin()

    def update_freespin_amount(self, scatter_key: str = "scatter") -> None:
        """Set initial number of spins for a freegame and transmit event."""
        scatter_reels = self._get_scatter_trigger_reel_count(scatter_key)
        self.tot_fs = self.config.freespin_triggers[self.gametype][scatter_reels]
        if self.gametype == self.config.basegame_type:
            basegame_trigger, freegame_trigger = True, False
        else:
            basegame_trigger, freegame_trigger = False, True
        from src.events.events import fs_trigger_event
        fs_trigger_event(self, basegame_trigger=basegame_trigger, freegame_trigger=freegame_trigger)

    def update_fs_retrigger_amt(self, scatter_key: str = "scatter") -> None:
        """Update total freespin amount on retrigger."""
        scatter_reels = self._get_scatter_trigger_reel_count(scatter_key)
        self.tot_fs += self.config.freespin_triggers[self.gametype][scatter_reels]
        from src.events.events import fs_trigger_event
        fs_trigger_event(self, freegame_trigger=True, basegame_trigger=False)

    def get_money_positions(self, board=None):
        """Get all positions where money symbols are located."""
        if board is None:
            board = self.board
        positions = []
        for reel_idx, reel in enumerate(board):
            for row_idx, sym in enumerate(reel):
                if sym.name == "M":
                    positions.append({"reel": reel_idx, "row": row_idx})
        return positions

    def get_locked_positions(self, board):
        """Get all locked symbol positions on the board."""
        positions = []
        for reel_idx, reel in enumerate(board):
            for row_idx, sym in enumerate(reel):
                if sym.locked:
                    positions.append({"reel": reel_idx, "row": row_idx})
        return positions

    def get_unlocked_positions(self, board):
        """Get all non-locked positions on the board."""
        positions = []
        for reel_idx, reel in enumerate(board):
            for row_idx, sym in enumerate(reel):
                if not sym.locked:
                    positions.append({"reel": reel_idx, "row": row_idx})
        return positions
