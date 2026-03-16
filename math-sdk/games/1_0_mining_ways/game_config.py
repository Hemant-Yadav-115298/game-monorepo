"""Game-specific configuration for Mining Ways Hold & Spin slot game."""

import os
from src.config.config import Config
from src.config.distributions import Distribution
from src.config.betmode import BetMode


class GameConfig(Config):
    """Mining-themed 5x6 Ways game with Hold & Spin, Free Spins, and Fixed Jackpots."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        super().__init__()
        self.game_id = "1_0_mining_ways"
        self.provider_number = 1
        self.working_name = "mining ways hold and spin"
        self.wincap = 5000
        self.win_type = "ways"
        self.rtp = 0.96
        self.construct_paths()

        # ---------------------
        # Game Dimensions
        # ---------------------
        self.num_reels = 5
        self.num_rows = [6] * self.num_reels  # 5 reels x 6 rows = 7,776 ways

        # ---------------------
        # Paytable (ways pay)
        # ---------------------
        # High symbols: DRI (Drill Machine), DIA (Diamond Cluster), GCA (Gold Cart)
        # Mid symbols:  TNT, PIC (Pickaxe), HEL (Helmet), LAN (Lantern)
        # Low symbols:  A, K, Q, J, 10
        self.paytable = {
            # High 3 - Drill Machine (highest)
            (5, "DRI"): 8,
            (4, "DRI"): 4,
            (3, "DRI"): 2,
            # High 2 - Diamond Cluster
            (5, "DIA"): 6,
            (4, "DIA"): 3,
            (3, "DIA"): 1.5,
            # High 1 - Gold Cart
            (5, "GCA"): 5,
            (4, "GCA"): 2,
            (3, "GCA"): 1,
            # Mid 4 - TNT
            (5, "TNT"): 2,
            (4, "TNT"): 1,
            (3, "TNT"): 0.5,
            # Mid 3 - Pickaxe
            (5, "PIC"): 2,
            (4, "PIC"): 1,
            (3, "PIC"): 0.5,
            # Mid 2 - Helmet
            (5, "HEL"): 2,
            (4, "HEL"): 1,
            (3, "HEL"): 0.5,
            # Mid 1 - Lantern
            (5, "LAN"): 2,
            (4, "LAN"): 1,
            (3, "LAN"): 0.5,
            # Low 5 - Ace
            (5, "A"): 1,
            (4, "A"): 0.4,
            (3, "A"): 0.2,
            # Low 4 - King
            (5, "K"): 1,
            (4, "K"): 0.4,
            (3, "K"): 0.2,
            # Low 3 - Queen
            (5, "Q"): 1,
            (4, "Q"): 0.4,
            (3, "Q"): 0.2,
            # Low 2 - Jack
            (5, "J"): 1,
            (4, "J"): 0.4,
            (3, "J"): 0.2,
            # Low 1 - Ten
            (5, "10"): 1,
            (4, "10"): 0.4,
            (3, "10"): 0.2,
        }

        self.include_padding = True

        # ---------------------
        # Special Symbols
        # ---------------------
        # Wild (W): reels 2-4 only, substitutes for all except Scatter and Money
        # Scatter (S): triggers Free Spins
        # Money (M): carries prize values, triggers Hold & Spin
        self.special_symbols = {
            "wild": ["W"],
            "scatter": ["S"],
            "money": ["M"],
            "multiplier": [],
        }

        # ---------------------
        # Freespin Triggers
        # ---------------------
        self.freespin_triggers = {
            self.basegame_type: {3: 10, 4: 15, 5: 20},
            self.freegame_type: {3: 5, 4: 10, 5: 15},
        }
        self.anticipation_triggers = {self.basegame_type: 2, self.freegame_type: 2}

        # ---------------------
        # Hold & Spin Configuration
        # ---------------------
        self.holdnspin_trigger_count = 6       # Minimum money symbols to trigger Hold & Spin
        self.holdnspin_initial_respins = 3     # Starting number of respins
        self.holdnspin_total_positions = 30    # 5 reels x 6 rows = full grid for GRAND jackpot

        # Hold & Spin game type identifier
        self.holdnspin_type = "holdnspin"

        # Money symbol prize value weights (basegame)
        self.money_values_base = {
            1: 40,
            2: 25,
            3: 15,
            5: 10,
            10: 6,
            20: 2,
            50: 0.5,
        }

        # Money symbol prize value weights (freegame - minimum 2x)
        self.money_values_freegame = {
            2: 40,
            3: 25,
            5: 15,
            10: 10,
            20: 6,
            50: 2,
        }

        # Jackpot probability: chance that a money symbol is a jackpot instead of a value
        self.money_jackpot_prob = 0.005  # 0.5% of money symbols are jackpots

        # Jackpot types and their multiplier values
        self.jackpot_values = {
            "MINI": 20,
            "MINOR": 50,
            "MAJOR": 200,
            "GRAND": 1000,
        }

        # Jackpot selection weights (when a jackpot IS awarded, which type)
        # GRAND is only awarded for full grid, not through random selection
        self.jackpot_weights = {
            "MINI": 60,
            "MINOR": 30,
            "MAJOR": 10,
        }

        # Hold & Spin respin probability of money symbol per position
        self.holdnspin_money_prob = 0.10  # 10% chance per empty position per respin

        # Free spin Hold & Spin multiplier growth per respin round
        self.fs_holdnspin_mult_growth = 1  # +1 multiplier per respin round

        # ---------------------
        # Reels
        # ---------------------
        reels = {
            "BR0": "BR0.csv",
            "FR0": "FR0.csv",
            "FRWCAP": "FRWCAP.csv",
            "HR0": "HR0.csv",
        }
        self.reels = {}
        for r, f in reels.items():
            self.reels[r] = self.read_reels_csv(os.path.join(self.reels_path, f))

        # ---------------------
        # Max wins per mode
        # ---------------------
        mode_maxwins = {
            "base": 5000,
            "bonus_fs": 5000,
            "bonus_hns": 5000,
        }

        # ---------------------
        # Bet Modes
        # ---------------------
        self.bet_modes = [
            # ---- BASE MODE ----
            BetMode(
                name="base",
                cost=1.0,
                rtp=self.rtp,
                max_win=mode_maxwins["base"],
                auto_close_disabled=False,
                is_feature=True,
                is_buybonus=False,
                distributions=[
                    Distribution(
                        criteria="freegame",
                        quota=0.08,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"FR0": 1},
                                self.holdnspin_type: {"HR0": 1},
                            },
                            "force_wincap": False,
                            "force_freegame": True,
                            "scatter_triggers": {3: 100, 4: 20, 5: 5},
                            "money_values": self.money_values_base,
                            "holdnspin_money_prob": 0.10,
                        },
                    ),
                    Distribution(
                        criteria="holdnspin",
                        quota=0.05,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"FR0": 1},
                                self.holdnspin_type: {"HR0": 1},
                            },
                            "force_wincap": False,
                            "force_freegame": False,
                            "force_holdnspin": True,
                            "money_values": self.money_values_base,
                            "holdnspin_money_prob": 0.12,
                        },
                    ),
                    Distribution(
                        criteria="0",
                        quota=0.35,
                        win_criteria=0.0,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                            },
                            "force_wincap": False,
                            "force_freegame": False,
                            "money_values": self.money_values_base,
                            "holdnspin_money_prob": 0.10,
                        },
                    ),
                    Distribution(
                        criteria="basegame",
                        quota=0.521,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                            },
                            "force_wincap": False,
                            "force_freegame": False,
                            "money_values": self.money_values_base,
                            "holdnspin_money_prob": 0.10,
                        },
                    ),
                ],
            ),
            # ---- FREE SPINS BUY BONUS ----
            BetMode(
                name="bonus_fs",
                cost=80.0,
                rtp=self.rtp,
                max_win=mode_maxwins["bonus_fs"],
                auto_close_disabled=False,
                is_feature=False,
                is_buybonus=True,
                distributions=[
                    Distribution(
                        criteria="freegame",
                        quota=1.0,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.freegame_type: {"FR0": 1, "FRWCAP": 5},
                                self.holdnspin_type: {"HR0": 1},
                            },
                            "force_wincap": False,
                            "force_freegame": True,
                            "scatter_triggers": {3: 100, 4: 20, 5: 5},
                            "money_values": self.money_values_freegame,
                            "holdnspin_money_prob": 0.12,
                        },
                    ),
                ],
            ),
            # ---- HOLD & SPIN BUY BONUS ----
            BetMode(
                name="bonus_hns",
                cost=100.0,
                rtp=self.rtp,
                max_win=mode_maxwins["bonus_hns"],
                auto_close_disabled=False,
                is_feature=False,
                is_buybonus=True,
                distributions=[
                    Distribution(
                        criteria="holdnspin",
                        quota=1.0,
                        conditions={
                            "reel_weights": {
                                self.basegame_type: {"BR0": 1},
                                self.holdnspin_type: {"HR0": 1},
                            },
                            "force_wincap": False,
                            "force_freegame": False,
                            "force_holdnspin": True,
                            "money_values": self.money_values_base,
                            "holdnspin_money_prob": 0.15,
                        },
                    ),
                ],
            ),
        ]
