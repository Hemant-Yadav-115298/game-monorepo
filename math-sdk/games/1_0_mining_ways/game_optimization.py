"""Set conditions/parameters for optimization program for Mining Ways Hold & Spin game.

RTP Split Targets (96%):
- Base game:  58% of total RTP
- Free Spins: 20% of total RTP
- Hold & Spin: 15% of total RTP
- Jackpot:     3% of total RTP
"""

from optimization_program.optimization_config import (
    ConstructScaling,
    ConstructParameters,
    ConstructConditions,
    ConstructFenceBias,
    verify_optimization_input,
)


class OptimizationSetup:
    """Game specific optimization setup for Mining Ways Hold & Spin.

    Configures the optimization algorithm with:
    - Target RTPs per distribution criteria
    - Win scaling factors for balancing distributions
    - Optimization parameters for the Rust solver
    """

    def __init__(self, game_config):
        self.game_config = game_config
        wincaps = {}
        for bm in game_config.bet_modes:
            wincaps[bm.get_name()] = bm.get_wincap()

        self.game_config.opt_params = {
            # ========== BASE MODE ==========
            "base": {
                "conditions": {
                    # Zero-win criteria
                    "0": ConstructConditions(
                        rtp=0,
                        av_win=0,
                        search_conditions=0,
                    ).return_dict(),
                    # Free game criteria - target 20% RTP allocation
                    "freegame": ConstructConditions(
                        rtp=0.20,
                        hr=200,
                        search_conditions={"symbol": "scatter"},
                    ).return_dict(),
                    # Hold & Spin criteria - target 15% RTP allocation
                    "holdnspin": ConstructConditions(
                        rtp=0.15,
                        hr=300,
                        search_conditions={"symbol": "money", "feature": "holdnspin"},
                    ).return_dict(),
                    # Base game criteria - 61% RTP (includes jackpot + max win allocation)
                    "basegame": ConstructConditions(
                        hr=4.1,
                        rtp=0.61,
                    ).return_dict(),
                },
                "scaling": ConstructScaling(
                    [
                        {
                            "criteria": "basegame",
                            "scale_factor": 1.2,
                            "win_range": (1, 2),
                            "probability": 1.0,
                        },
                        {
                            "criteria": "basegame",
                            "scale_factor": 1.5,
                            "win_range": (10, 20),
                            "probability": 1.0,
                        },
                        {
                            "criteria": "freegame",
                            "scale_factor": 0.8,
                            "win_range": (500, 1000),
                            "probability": 1.0,
                        },
                        {
                            "criteria": "freegame",
                            "scale_factor": 1.2,
                            "win_range": (2000, 3500),
                            "probability": 1.0,
                        },
                        {
                            "criteria": "holdnspin",
                            "scale_factor": 0.9,
                            "win_range": (50, 200),
                            "probability": 1.0,
                        },
                        {
                            "criteria": "holdnspin",
                            "scale_factor": 1.3,
                            "win_range": (500, 2000),
                            "probability": 1.0,
                        },
                    ]
                ).return_dict(),
                "parameters": ConstructParameters(
                    num_show=5000,
                    num_per_fence=10000,
                    min_m2m=4,
                    max_m2m=8,
                    pmb_rtp=1.0,
                    sim_trials=5000,
                    test_spins=[50, 100, 200],
                    test_weights=[0.3, 0.4, 0.3],
                    score_type="rtp",
                ).return_dict(),
                "distribution_bias": ConstructFenceBias(
                    applied_criteria=["basegame"],
                    bias_ranges=[(1.5, 3.5)],
                    bias_weights=[0.4],
                ).return_dict(),
            },
            # ========== FREE SPINS BUY BONUS ==========
            "bonus_fs": {
                "conditions": {
                    "freegame": ConstructConditions(
                        rtp=0.96,
                        hr="x",
                    ).return_dict(),
                },
                "scaling": ConstructScaling(
                    [
                        {
                            "criteria": "freegame",
                            "scale_factor": 0.9,
                            "win_range": (20, 50),
                            "probability": 1.0,
                        },
                        {
                            "criteria": "freegame",
                            "scale_factor": 0.8,
                            "win_range": (1000, 2000),
                            "probability": 1.0,
                        },
                        {
                            "criteria": "freegame",
                            "scale_factor": 1.2,
                            "win_range": (3000, 4500),
                            "probability": 1.0,
                        },
                    ]
                ).return_dict(),
                "parameters": ConstructParameters(
                    num_show=5000,
                    num_per_fence=10000,
                    min_m2m=4,
                    max_m2m=8,
                    pmb_rtp=1.0,
                    sim_trials=5000,
                    test_spins=[10, 20, 50],
                    test_weights=[0.6, 0.2, 0.2],
                    score_type="rtp",
                ).return_dict(),
            },
            # ========== HOLD & SPIN BUY BONUS ==========
            "bonus_hns": {
                "conditions": {
                    "holdnspin": ConstructConditions(
                        rtp=0.96,
                        hr="x",
                        search_conditions={"symbol": "money", "feature": "holdnspin"},
                    ).return_dict(),
                },
                "scaling": ConstructScaling(
                    [
                        {
                            "criteria": "holdnspin",
                            "scale_factor": 0.9,
                            "win_range": (20, 100),
                            "probability": 1.0,
                        },
                        {
                            "criteria": "holdnspin",
                            "scale_factor": 1.2,
                            "win_range": (500, 2000),
                            "probability": 1.0,
                        },
                        {
                            "criteria": "holdnspin",
                            "scale_factor": 1.5,
                            "win_range": (3000, 4500),
                            "probability": 1.0,
                        },
                    ]
                ).return_dict(),
                "parameters": ConstructParameters(
                    num_show=5000,
                    num_per_fence=10000,
                    min_m2m=4,
                    max_m2m=8,
                    pmb_rtp=1.0,
                    sim_trials=5000,
                    test_spins=[10, 20, 50],
                    test_weights=[0.6, 0.2, 0.2],
                    score_type="rtp",
                ).return_dict(),
            },
        }

        verify_optimization_input(self.game_config, self.game_config.opt_params)
