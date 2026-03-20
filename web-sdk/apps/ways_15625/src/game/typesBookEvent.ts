import type { BetType } from 'rgs-requests';

import type { SymbolName, RawSymbol, GameType, Position } from './types';

// book events shared with scatter game
type BookEventReveal = {
	index: number;
	type: 'reveal';
	board: RawSymbol[][];
	paddingPositions: number[];
	anticipation: number[];
	gameType: GameType;
};

type BookEventSetTotalWin = {
	index: number;
	type: 'setTotalWin';
	amount: number;
};

type BookEventFinalWin = {
	index: number;
	type: 'finalWin';
	amount: number;
};

type BookEventFreeSpinTrigger = {
	index: number;
	type: 'freeSpinTrigger';
	totalFs: number;
	positions: Position[];
};

type BookEventUpdateFreeSpin = {
	index: number;
	type: 'updateFreeSpin';
	amount: number;
	total: number;
};

type BookEventSetWin = {
	index: number;
	type: 'setWin';
	amount: number;
	winLevel: number;
};

type BookEventFreeSpinEnd = {
	index: number;
	type: 'freeSpinEnd';
	amount: number;
	winLevel: number;
};

type BookEventWinInfo = {
	index: number;
	type: 'winInfo';
	totalWin: number;
	wins: {
		symbol: SymbolName;
		kind: number;
		win: number;
		positions: Position[];
		meta: {
			lineIndex: number;
			multiplier: number;
			winWithoutMult: number;
			globalMult: number;
			lineMultiplier: number;
		};
	}[];
};

type BookEventHoldAndSpinTrigger = {
	index: number;
	type: 'holdAndSpinTrigger';
	totalRespins: number;
	moneyPositions: Position[];
	isFreeSpin: boolean;
};

type BookEventHoldAndSpinRespin = {
	index: number;
	type: 'holdAndSpinRespin';
	respinNumber: number;
	respinsRemaining: number;
	board: RawSymbol[][];
	newMoneyPositions: Position[];
	multiplier?: number;
};

type BookEventHoldAndSpinEnd = {
	index: number;
	type: 'holdAndSpinEnd';
	totalWin: number;
	jackpot?: string;
	finalMultiplier?: number;
};

type BookEventJackpotAwarded = {
	index: number;
	type: 'jackpotAwarded';
	jackpotType: string;
	jackpotValue: number;
};

type BookEventMoneySymbolReveal = {
	index: number;
	type: 'moneySymbolReveal';
	position: Position;
	prizeValue: number;
	isJackpot: boolean;
	jackpotType?: string;
};

// customised
type BookEventCreateBonusSnapshot = {
	index: number;
	type: 'createBonusSnapshot';
	bookEvents: BookEvent[];
};

export type BookEvent =
	| BookEventReveal
	| BookEventWinInfo
	| BookEventSetTotalWin
	| BookEventFreeSpinTrigger
	| BookEventUpdateFreeSpin
	| BookEventCreateBonusSnapshot
	| BookEventFinalWin
	| BookEventSetWin
	| BookEventFreeSpinEnd
	| BookEventHoldAndSpinTrigger
	| BookEventHoldAndSpinRespin
	| BookEventHoldAndSpinEnd
	| BookEventJackpotAwarded
	| BookEventMoneySymbolReveal;

export type Bet = BetType<BookEvent>;
export type BookEventOfType<T> = Extract<BookEvent, { type: T }>;
export type BookEventContext = { bookEvents: BookEvent[] };
