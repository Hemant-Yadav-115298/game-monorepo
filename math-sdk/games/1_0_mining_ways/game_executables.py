"""Game executables - ways evaluation and Hold & Spin board evaluation."""

from game_calculations import GameCalculations
from src.calculations.ways import Ways


class GameExecutables(GameCalculations):
    """Executable actions for Mining Ways game: ways wins + Hold & Spin evaluation."""

    def evaluate_ways_board(self):
        """Populate win-data, record wins, transmit events for ways wins."""
        self.win_data = Ways.get_ways_data(self.config, self.board)
        if self.win_data["totalWin"] > 0:
            Ways.record_ways_wins(self)
            self.win_manager.update_spinwin(self.win_data["totalWin"])
        Ways.emit_wayswin_events(self)

    def check_holdnspin_trigger(self):
        """Check if enough money symbols are on board to trigger Hold & Spin."""
        money_count = self.count_money_symbols()
        return money_count >= self.config.holdnspin_trigger_count

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
