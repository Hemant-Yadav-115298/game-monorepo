"""Game events - imports standard events and defines Hold & Spin specific events."""

from src.events.events import *
from copy import deepcopy


def holdnspin_trigger_event(gamestate, money_positions, is_freespin=False):
    """Emit event indicating Hold & Spin feature has been triggered."""
    positions = []
    for pos in money_positions:
        row_offset = 1 if gamestate.config.include_padding else 0
        positions.append({"reel": pos["reel"], "row": pos["row"] + row_offset})

    event = {
        "index": len(gamestate.book.events),
        "type": "holdAndSpinTrigger",
        "totalRespins": gamestate.holdnspin_respins,
        "moneyPositions": positions,
        "isFreeSpin": is_freespin,
    }
    gamestate.book.add_event(event)


def holdnspin_respin_event(gamestate, respin_num, respins_remaining, new_money_positions, board):
    """Emit event for each Hold & Spin respin showing the updated board state."""
    special_attributes = list(gamestate.config.special_symbols.keys())
    board_client = []
    for reel_idx, reel in enumerate(board):
        board_client.append([])
        for sym in reel:
            sym_dict = {"name": sym.name}
            if sym.locked:
                sym_dict["locked"] = True
            if sym.prize is not None:
                sym_dict["prize"] = sym.prize
            board_client[reel_idx].append(sym_dict)

    new_positions = []
    row_offset = 1 if gamestate.config.include_padding else 0
    for pos in new_money_positions:
        new_positions.append({"reel": pos["reel"], "row": pos["row"] + row_offset})

    event = {
        "index": len(gamestate.book.events),
        "type": "holdAndSpinRespin",
        "respinNumber": respin_num,
        "respinsRemaining": respins_remaining,
        "board": board_client,
        "newMoneyPositions": new_positions,
    }

    if hasattr(gamestate, "holdnspin_multiplier") and gamestate.holdnspin_multiplier > 1:
        event["multiplier"] = gamestate.holdnspin_multiplier

    gamestate.book.add_event(event)


def holdnspin_end_event(gamestate, total_win, jackpot_type=None):
    """Emit event indicating Hold & Spin feature has ended with total win."""
    event = {
        "index": len(gamestate.book.events),
        "type": "holdAndSpinEnd",
        "totalWin": int(round(min(total_win, gamestate.config.wincap) * 100, 0)),
    }
    if jackpot_type is not None:
        event["jackpot"] = jackpot_type
    if hasattr(gamestate, "holdnspin_multiplier") and gamestate.holdnspin_multiplier > 1:
        event["finalMultiplier"] = gamestate.holdnspin_multiplier

    gamestate.book.add_event(event)


def jackpot_event(gamestate, jackpot_type, jackpot_value):
    """Emit event for jackpot award."""
    event = {
        "index": len(gamestate.book.events),
        "type": "jackpotAwarded",
        "jackpotType": jackpot_type,
        "jackpotValue": int(round(jackpot_value * 100, 0)),
    }
    gamestate.book.add_event(event)


def money_symbol_event(gamestate, reel, row, prize_value, is_jackpot=False, jackpot_type=None):
    """Emit event for individual money symbol reveal."""
    row_offset = 1 if gamestate.config.include_padding else 0
    event = {
        "index": len(gamestate.book.events),
        "type": "moneySymbolReveal",
        "position": {"reel": reel, "row": row + row_offset},
        "prizeValue": int(round(prize_value * 100, 0)),
        "isJackpot": is_jackpot,
    }
    if is_jackpot and jackpot_type is not None:
        event["jackpotType"] = jackpot_type

    gamestate.book.add_event(event)
