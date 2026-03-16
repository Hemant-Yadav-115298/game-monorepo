# Mining Ways Hold & Spin

Mining-themed 5-reel x 6-row ways game with Hold & Spin, Free Spins, and Fixed Jackpots.

## Game Overview

* Grid: 5 Reels x 6 Rows (7,776 ways)
* Win Type: Ways (left-to-right, minimum 3 adjacent reels)
* Max Win: 5,000x
* Target RTP: 96%
* Target Hit Frequency: ~1 in 4.1 spins (24%)

## Symbols

### Paying Symbols (11 total)
* 3 High: DRI (Drill Machine), DIA (Diamond Cluster), GCA (Gold Cart)
* 4 Mid: TNT, PIC (Pickaxe), HEL (Helmet), LAN (Lantern)
* 5 Low: A, K, Q, J, 10

### Special Symbols
* W (Wild) - Substitutes for all paying symbols. Appears on reels 2-4 only.
* S (Scatter) - Triggers Free Spins. Appears on all reels.
* M (Money) - Carries prize values. Triggers Hold & Spin when 6+ land. Appears on all reels.

## Paytable (multiplier x bet per way)

| Symbol | 3-of-kind | 4-of-kind | 5-of-kind |
|--------|-----------|-----------|-----------|
| DRI    | 2x        | 4x        | 8x        |
| DIA    | 1.5x      | 3x        | 6x        |
| GCA    | 1x        | 2x        | 5x        |
| TNT    | 0.5x      | 1x        | 2x        |
| PIC    | 0.5x      | 1x        | 2x        |
| HEL    | 0.5x      | 1x        | 2x        |
| LAN    | 0.5x      | 1x        | 2x        |
| A      | 0.2x      | 0.4x      | 1x        |
| K      | 0.2x      | 0.4x      | 1x        |
| Q      | 0.2x      | 0.4x      | 1x        |
| J      | 0.2x      | 0.4x      | 1x        |
| 10     | 0.2x      | 0.4x      | 1x        |

## Features

### Free Spins
- Triggered by 3+ Scatter symbols in base game
- 3 Scatters: 10 Free Spins
- 4 Scatters: 15 Free Spins
- 5 Scatters: 20 Free Spins
- During Free Spins: Money symbol minimum value is 2x (instead of 1x)
- Hold & Spin can trigger within Free Spins
- Retrigger: 3+ Scatters during FS awards additional spins (3S=5, 4S=10, 5S=15)

### Hold & Spin
- Triggered when 6+ Money symbols land on the board
- 3 initial respins
- All money symbols lock in place
- Each respin: non-locked positions can land new money symbols (~10% probability each)
- New money symbol: locks in place, respins reset to 3
- No new money: respins decremented by 1
- Continues until respins reach 0
- If ALL 30 positions filled (full grid): GRAND jackpot (1000x) awarded
- Total win = sum of all money symbol prizes

### Hold & Spin During Free Spins
- Same as base game H&S but with enhancements:
- Money minimum value is 2x
- Multiplier grows +1 per respin round (starts at 1x)
- Final H&S win is multiplied by the accumulated multiplier

### Money Symbol Values
| Value   | Probability |
|---------|-------------|
| 1x      | 40%         |
| 2x      | 25%         |
| 3x      | 15%         |
| 5x      | 10%         |
| 10x     | 6%          |
| 20x     | 2%          |
| 50x     | 0.5%        |
| Jackpot | 0.5%        |

### Fixed Jackpots
| Jackpot | Value  | Selection Weight |
|---------|--------|------------------|
| MINI    | 20x    | 60               |
| MINOR   | 50x    | 30               |
| MAJOR   | 200x   | 10               |
| GRAND   | 1000x  | Full grid only   |

## RTP Split (96% target)
- Base Game:   58%
- Free Spins:  20%
- Hold & Spin: 15%
- Jackpot:      3%

## Bet Modes
- base: Standard play (cost 1x)
- bonus_fs: Free Spins Buy (cost 80x)
- bonus_hns: Hold & Spin Buy (cost 100x)

## Reel Strips
- BR0.csv: Base game reel strip (110 rows x 5 reels)
- FR0.csv: Free game reel strip (110 rows x 5 reels, more wilds/money)
- FRWCAP.csv: Free game wincap reel strip (110 rows x 5 reels, heavy wilds)
- HR0.csv: Hold & Spin auxiliary reel strip (40 rows x 5 reels)

## Target Metrics
- Standard Deviation: 12-15
- Average Bonus Win: 80-120x
