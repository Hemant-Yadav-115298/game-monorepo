import _ from 'lodash';
import { stateBet } from 'state-shared';
import { createPlayBookUtils } from 'utils-book';
import { createGetEmptyPaddedBoard } from 'utils-slots';

import {
	SYMBOL_PITCH_X,
	SYMBOL_PITCH_Y,
	REEL_PADDING,
	SYMBOL_INFO_MAP,
	BOARD_DIMENSIONS,
} from './constants';
import { eventEmitter } from './eventEmitter';
import type { Bet, BookEventOfType } from './typesBookEvent';
import { bookEventHandlerMap } from './bookEventHandlerMap';
import type { RawSymbol, SymbolState } from './types';

// general utils
export const { getEmptyBoard } = createGetEmptyPaddedBoard({ reelsDimensions: BOARD_DIMENSIONS });
export const { playBookEvent, playBookEvents } = createPlayBookUtils({ bookEventHandlerMap });
export const playBet = async (bet: Bet) => {
	stateBet.winBookEventAmount = 0;
	await playBookEvents(bet.state);
	eventEmitter.broadcast({ type: 'stopButtonEnable' });
};

// resume bet
const BOOK_EVENT_TYPES_TO_RESERVE_FOR_SNAPSHOT = [
	'updateGlobalMult',
	'freeSpinTrigger',
	'updateFreeSpin',
	'setTotalWin',
];

export const convertTorResumableBet = (betToResume: Bet) => {
	const resumingIndex = Number(betToResume.event);
	const bookEventsBeforeResume = betToResume.state.filter(
		(_, eventIndex) => eventIndex < resumingIndex,
	);
	const bookEventsAfterResume = betToResume.state.filter(
		(_, eventIndex) => eventIndex >= resumingIndex,
	);

	const bookEventToCreateSnapshot: BookEventOfType<'createBonusSnapshot'> = {
		index: 0,
		type: 'createBonusSnapshot',
		bookEvents: bookEventsBeforeResume.filter((bookEvent) =>
			BOOK_EVENT_TYPES_TO_RESERVE_FOR_SNAPSHOT.includes(bookEvent.type),
		),
	};

	const stateToResume = [bookEventToCreateSnapshot, ...bookEventsAfterResume];

	return { ...betToResume, state: stateToResume };
};

// other utils
export const getSymbolX = (reelIndex: number) =>
	SYMBOL_PITCH_X * (reelIndex + REEL_PADDING + 0.5);
export const getSymbolY = (symbolIndexOfBoard: number) =>
	(symbolIndexOfBoard + 0.5) * SYMBOL_PITCH_Y;

export const getSymbolInfo = ({
	rawSymbol,
	state,
}: {
	rawSymbol: RawSymbol;
	state: SymbolState;
}) => {
	const symbolInfo = SYMBOL_INFO_MAP[rawSymbol.name];
	if (!symbolInfo) {
		console.warn(`Symbol info not found for name: ${rawSymbol.name}`);
		return SYMBOL_INFO_MAP['L1'][state]; // Fallback to L1
	}
	const stateInfo = symbolInfo[state];
	if (!stateInfo) {
		console.warn(`Symbol state info not found for name: ${rawSymbol.name}, state: ${state}`);
		return symbolInfo['static']; // Fallback to static
	}
	return stateInfo;
};

/**
 * Normalizes a board from the RGS to match the internal height (e.g. 7 symbols).
 * If a reel has 5 symbols, it adds padding (duplicating top and bottom symbols).
 */
export const normalizeBoard = (board: RawSymbol[][]) => {
	return board.map((reel) => {
		if (reel.length === 5) {
			// Pad 5 symbols to 7: [P, 0, 1, 2, 3, 4, P]
			return [reel[0], ...reel, reel[reel.length - 1]];
		}
		return reel;
	});
};
