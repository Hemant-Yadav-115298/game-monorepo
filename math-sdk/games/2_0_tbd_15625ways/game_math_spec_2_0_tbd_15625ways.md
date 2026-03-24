# Math Specification – 2_0_tbd_15625ways (TBD 15625 Ways – Hold & Spin)

This document describes the math of the TBD 15625 Ways Hold & Spin game from scratch: grid geometry, symbols and paytable, feature rules, money/jackpot behaviour, and RTP allocation. It is based on:

- Runtime config: [game_config.py](game_config.py)
- FE math config: [library/configs/math_config.json](library/configs/math_config.json)
- FE game config: [library/configs/config_fe_2_0_tbd_15625ways.json](library/configs/config_fe_2_0_tbd_15625ways.json)
- Design summary: [readme.txt](readme.txt)

---

## 1. Geometry & Ways Model

- Grid: 6 reels × 5 rows.
- Ways: 5^6 = 15,625 ways (fixed, no lines).
- Ways pay:
  - Wins are evaluated left-to-right.
  - A symbol pays if it appears on at least 3 consecutive reels, starting from reel 1.
  - Number of ways for a symbol is the product of its hit-count per reel across all qualifying reels.

Payout for a symbol X over k reels is:

- base_win(X, k) = paytable[(k, X)] × bet_per_spin
- ways_win(X, k) = base_win(X, k) × ways_count(X, k)

where `paytable` is configured in [game_config.py](game_config.py#L48-L78) and `ways_count` is computed in the shared Ways engine.

---

## 2. Bet Modes & RTP Targets

### 2.1 Bet Modes

From [game_config.py](game_config.py#L216-L220) and [library/configs/math_config.json](library/configs/math_config.json#L1-L31):

- `base` mode
  - Cost: 1.0x bet.
  - RTP: 96%.
  - Max win: 5,000x.
  - Features: natural base game with Free Spins and Hold & Spin triggers.

- `bonus_fs` (Free Spins Buy)
  - Cost: 80x bet.
  - RTP: 96%.
  - Max win: 5,000x.
  - Always enters Free Spins feature.

- `bonus_hns` (Hold & Spin Buy)
  - Cost: 100x bet.
  - RTP: 96%.
  - Max win: 5,000x.
  - Always enters Hold & Spin feature.

### 2.2 RTP Split (Base Mode)

From [library/configs/math_config.json](library/configs/math_config.json#L32-L116):

Target RTP allocation for `base` bet mode fences:

- `basegame`:
  - Target RTP ≈ 58% of total.
  - Hit rate ≈ 4.1.
  - Identity: everything that is not specifically freegame/holdnspin.
- `freegame` (Free Spins):
  - Target RTP ≈ 20% of total.
  - Hit rate ≈ 150.
  - Identity: search for symbol `scatter`.
- `holdnspin` (Hold & Spin feature):
  - Target RTP ≈ 18% of total (includes jackpot contribution).
  - Hit rate ≈ 200.
  - Identity: `symbol = money` and `feature = holdnspin`.
- `0` fence:
  - RTP 0, all zero-win outcomes.

### 2.3 Scaling (Win Range Tuning)

From [library/configs/math_config.json](library/configs/math_config.json#L117-L208):

For `base` bet mode:

- Basegame scaling:
  - 1–2x wins scaled by 1.2×.
  - 10–20x wins scaled by 1.5×.
- Freegame scaling:
  - 200–500x scaled by 0.9× (slight nerf to mid-high FS wins).
  - 1000–2500x scaled by 1.1× (slight buff to large FS wins).
- Holdnspin scaling:
  - 20–100x scaled by 0.9× (control on frequent medium H&S results).
  - 200–1000x scaled by 1.2× (support for bigger but rarer H&S outcomes).

Similar per-fence scaling exists for `bonus_fs` and `bonus_hns` (only freegame and holdnspin fences respectively).

---

## 3. Symbol Set & Paytable

### 3.1 Regular Symbols

From [game_config.py](game_config.py#L48-L78) and [library/configs/config_fe_2_0_tbd_15625ways.json](library/configs/config_fe_2_0_tbd_15625ways.json#L33-L164):

All paytable values below are at 1x total bet.

High symbols:

- DRI (Drill Machine)
  - 3-of-a-kind: 2x
  - 4-of-a-kind: 4x
  - 5-of-a-kind: 8x
  - 6-of-a-kind: 15x
- DIA (Diamond Cluster)
  - 3: 1.5x
  - 4: 3x
  - 5: 6x
  - 6: 12x
- GCA (Gold Cart)
  - 3: 1x
  - 4: 2x
  - 5: 5x
  - 6: 10x

Mid symbols:

- TNT (TNT Barrel)
  - 3: 0.5x
  - 4: 1x
  - 5: 2x
  - 6: 4x
- PIC (Pickaxe)
  - 3: 0.5x
  - 4: 1x
  - 5: 2x
  - 6: 4x
- HEL (Helmet)
  - 3: 0.5x
  - 4: 1x
  - 5: 2x
  - 6: 4x
- LAN (Lantern)
  - 3: 0.5x
  - 4: 1x
  - 5: 2x
  - 6: 4x

Low symbols:

- A, K, Q, J, 10 (metal carved)
  - All share: 3: 0.2x, 4: 0.4x, 5: 1x, 6: 2x.

### 3.2 Special Symbols

From [game_config.py](game_config.py#L119-L124) and [library/configs/config_fe_2_0_tbd_15625ways.json](library/configs/config_fe_2_0_tbd_15625ways.json#L165-L219):

- Wild `W` (Explosive Charge)
  - Reels: 2, 3, 4 only.
  - Substitution: substitutes all regular paying symbols except Scatter `S` and Money `M`.
  - No direct paytable (pays only via substitution).

- Scatter `S` (Mine Entrance Gate)
  - Triggers Free Spins when 3+ appear anywhere.
  - No direct paytable; FS count is defined by triggers (see below).

- Money `M` (Gold Nugget)
  - Triggers Hold & Spin when 6+ appear anywhere in view.
  - Does not have line/ways paytable; instead holds a prize multiplier or jackpot value used in the Hold & Spin feature.

---

## 4. Freespins – Trigger & Behaviour

### 4.1 Trigger Conditions

From [game_config.py](game_config.py#L129-L132):

- Basegame → Free Spins:
  - 3 scatters: 10 free spins.
  - 4 scatters: 15 free spins.
  - 5 scatters: 20 free spins.
- Retrigger during Free Spins:
  - Freegame freespin triggers: 3: +5 FS, 4: +10 FS, 5: +15 FS.

### 4.2 Core Behaviour

From [gamestate.py](gamestate.py#L79-L114):

- At the start of the feature, `tot_fs` is set based on the triggering scatter count.
- Each free spin:
  - A board is drawn from freegame-weighted reels (`FR0`, `FRWCAP` – see reels section).
  - A random fully wild reel may be applied:
    - With probability 0.05 per spin (`fs_wild_reel_chance` in [game_config.py](game_config.py#L197-L197)), one of reels {2,3,4} (indices 1–3) is converted entirely to `W`.
  - Ways wins are evaluated in the same way as basegame.
  - Hold & Spin can be triggered if 6+ money symbols `M` are present.
  - Additional scatters may retrigger Free Spins.
- Win cap safety:
  - If running free-spin win (`running_bet_win`) reaches or exceeds `wincap` (5000x), the FS loop breaks early.

### 4.3 Money Symbol Behaviour in Free Spins

From [game_config.py](game_config.py#L159-L166) and [game_override.py](game_override.py#L42-L87):

- During Free Spins, money symbols use `money_values_freegame` distribution:
  - 2x: weight 50
  - 3x: weight 25
  - 5x: weight 12
  - 10x: weight 8
  - 20x: weight 3
  - 50x: weight 1
- This replaces the basegame money distribution to push more low-mid values and control RTP when the FS multiplier effects are present.

---

## 5. Hold & Spin Feature

### 5.1 Trigger Conditions

From [game_config.py](game_config.py#L138-L140) and [gamestate.py](gamestate.py#L33-L64):

- Triggered when `count_money_symbols() >= holdnspin_trigger_count` = 6.
- Can trigger in two ways:
  - From basegame (natural or forced via H&S-tuned distributions).
  - From inside Free Spins (using freegame money values and multipliers).

Priority rules in `run_spin`:

- If Hold & Spin is triggered and Free Spins are not triggered in the same spin, H&S is played immediately.
- If both are triggered, Free Spins path is taken; H&S may still occur later from within FS.

### 5.2 Board and Respins

From [game_override.py](game_override.py#L96-L138) and [gamestate.py](gamestate.py#L116-L221):

- When H&S starts:
  - A deep copy of the current board is created (`holdnspin_board`).
  - All money symbols on that board are locked (cannot be replaced).
  - `holdnspin_respins` is set to `holdnspin_initial_respins = 3`.
  - `holdnspin_multiplier` starts at 1.

- Respins loop:
  - While `holdnspin_respins > 0`:
    - If in Free Spins, `holdnspin_multiplier` increases by `fs_holdnspin_mult_growth = 1` per respin round, capped at 10x.
    - For each unlocked position on the board, a money symbol can land with probability `holdnspin_money_prob`, taken from the current distribution (default 0.04, up to 0.09 in buy bonus).
    - If at least one new money symbol lands:
      - Lock those symbols and reset respins back to 3.
    - Otherwise:
      - Decrement respins by 1.

### 5.3 Money Symbol Values in H&S

From [game_override.py](game_override.py#L69-L87) and [game_config.py](game_config.py#L147-L166):

- Basegame or base-like distributions:
  - Uses `money_values_base` weights:
    - 1x: 40
    - 2x: 25
    - 3x: 15
    - 5x: 10
    - 10x: 6
    - 20x: 2
    - 50x: 0.5
- Free Spins or FS-style distributions:
  - Uses `money_values_freegame` as detailed in 4.3.

### 5.4 Jackpot Model

From [game_config.py](game_config.py#L170-L186) and [game_override.py](game_override.py#L42-L87):

- Per-money-symbol jackpot chance:
  - `money_jackpot_prob = 0.003` (0.3%).
- When a jackpot roll is successful:
  - Jackpot type is chosen using weights `jackpot_weights`:
    - MINI: weight 65 (20x).
    - MINOR: weight 28 (50x).
    - MAJOR: weight 7 (200x).
  - The prize value of the money symbol is set to the selected jackpot multiplier.

- GRAND jackpot:
  - Special case: achieved only by full-grid condition.
  - Condition: `check_holdnspin_full_grid(board)` = all 30 positions locked money symbols.
  - Payout: +1000x added on top of normal money symbol sum.

### 5.5 End of Feature & Win Calculation

From [gamestate.py](gamestate.py#L116-L221):

- After respins end or win cap forces stop:
  - Compute `holdnspin_prize_sum = calculate_holdnspin_win(holdnspin_board)` – sum of all money symbol values.
  - If full grid, add GRAND jackpot value (1000x) and emit `jackpot_event`.
  - Compute `holdnspin_final_win = holdnspin_prize_sum × holdnspin_multiplier`.
  - Cap H&S win so that `running_bet_win + holdnspin_final_win <= wincap`:
    - `remaining_cap = max(0, wincap - running_bet_win)`.
    - Final win = `min(holdnspin_final_win, remaining_cap)`.
  - Update bet win and emit `holdAndSpinEnd` event with final win and jackpot info if any.

---

## 6. Reels & Weighting

From [game_config.py](game_config.py#L202-L206):

- Reel sets:
  - BR0: basegame reels.
  - FR0: regular freegame reels.
  - FRWCAP: wild-heavy freegame reels (used in mix for FS buy).
  - HR0: Hold & Spin board reels (for distributions forcing H&S).

Reel usage per distribution is configured via `reel_weights` in the `bet_modes` distributions in [game_config.py](game_config.py#L216-L354):

- Base mode examples:
  - Freegame criteria: base uses BR0, freegame uses FR0, H&S uses HR0.
  - Holdnspin criteria: mix of BR0/FR0/HR0 with `force_holdnspin`.
- Bonus_fs (FS buy):
  - freegame_type: FR0 and FRWCAP mixed 1:1; HR0 enabled for internal H&S.
- Bonus_hns (H&S buy):
  - basegame_type: BR0; holdnspin_type: HR0; `force_holdnspin` true.

---

## 7. Win Cap Behaviour

From [game_config.py](game_config.py#L32-L32) and [gamestate.py](gamestate.py#L79-L114, gamestate.py#L116-L221):

- Global max win (`wincap`): 5000x bet.
- Applied in two places:
  - Free Spins loop: if `running_bet_win >= wincap`, end feature early.
  - Hold & Spin loop: final H&S win is clipped so combined total does not exceed `wincap`.

This guarantees theoretical max payout per spin does not exceed configured cap.

---

## 8. Buy Feature Math Notes

### 8.1 Free Spins Buy – `bonus_fs`

- Cost: 80x bet.
- Always starts in Free Spins with adjusted reel mix (FR0:FRWCAP = 1:1) and money probability `holdnspin_money_prob = 0.06` for H&S triggered within FS.
- RTP: 96% (see [math_config.json](library/configs/math_config.json#L63-L99)).

### 8.2 Hold & Spin Buy – `bonus_hns`

- Cost: 100x bet.
- Always starts in Hold & Spin with `holdnspin_money_prob = 0.09` (tuned such that ~2.16 new money symbols per respin when ~24 positions are empty).
- RTP: 96% (see [math_config.json](library/configs/math_config.json#L162-L197)).

---

## 9. Summary

- Geometry: 6x5 grid, 15,625 ways.
- RTP: 96% for all modes, with internal split across basegame, freegame, holdnspin.
- Core mechanics:
  - Ways pays for DRI/DIA/GCA and other symbols as per paytable.
  - Scatter-Triggered Free Spins with random wild reel and in-feature H&S.
  - Hold & Spin feature driven by money symbol distribution, respin loop, jackpot odds, and full-grid GRAND.
- Constraints & Safety:
  - Hard 5000x wincap.
  - Reduced FRWCAP wild density, tuned money/jackpot probabilities, and guarded forced distributions to control volatility and RTP.
