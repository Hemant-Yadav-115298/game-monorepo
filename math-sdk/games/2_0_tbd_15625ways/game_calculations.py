"""Game calculations - extends base Executables with Hold & Spin win tracking."""

from src.executables.executables import Executables


class GameCalculations(Executables):
    """Additional calculation helpers for TBD 15625 Ways game."""

    def calculate_holdnspin_win(self, board):
        """Sum all money symbol prize values on the board."""
        total_prize = 0.0
        for reel in board:
            for sym in reel:
                if sym.prize is not None and sym.prize > 0:
                    total_prize += sym.prize
        return total_prize

    def check_holdnspin_full_grid(self, board):
        """Check if all positions on the board are locked money symbols (GRAND jackpot)."""
        locked_count = 0
        for reel in board:
            for sym in reel:
                if sym.locked:
                    locked_count += 1
        return locked_count >= self.config.holdnspin_total_positions

    def count_money_symbols(self, board=None):
        """Count money symbols currently on the board."""
        if board is None:
            board = self.board
        count = 0
        for reel in board:
            for sym in reel:
                if sym.name == "M":
                    count += 1
        return count
