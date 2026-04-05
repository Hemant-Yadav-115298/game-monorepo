import _ from 'lodash';

import { recordBookEvent, checkIsMultipleRevealEvents, type BookEventHandlerMap } from 'utils-book';
import { stateBet, stateUrlDerived } from 'state-shared';
import { sequence } from 'utils-shared/sequence';
import { waitForTimeout } from 'utils-shared/wait';

import { eventEmitter } from './eventEmitter';
import { playBookEvent, normalizeBoard } from './utils';
import { winLevelMap, type WinLevel, type WinLevelData } from './winLevelMap';
import { stateGame, stateGameDerived } from './stateGame.svelte';
import type { BookEvent, BookEventOfType, BookEventContext } from './typesBookEvent';
import type { Position, RawSymbol } from './types';

const winLevelSoundsPlay = ({ winLevelData }: { winLevelData: WinLevelData }) => {
	if (winLevelData?.alias === 'max') eventEmitter.broadcastAsync({ type: 'uiHide' });
	if (winLevelData?.sound?.sfx) {
		eventEmitter.broadcast({ type: 'soundOnce', name: winLevelData.sound.sfx });
	}
	if (winLevelData?.sound?.bgm) {
		eventEmitter.broadcast({ type: 'soundMusic', name: winLevelData.sound.bgm });
	}
	if (winLevelData?.type === 'big') {
		eventEmitter.broadcast({ type: 'soundLoop', name: 'sfx_bigwin_coinloop' });
	}
};

const winLevelSoundsStop = () => {
	eventEmitter.broadcast({ type: 'soundStop', name: 'sfx_bigwin_coinloop' });
	if (stateBet.activeBetModeKey === 'SUPERSPIN' || stateGame.gameType === 'freegame') {
		// check if SUPERSPIN, when finishing a bet.
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
	} else {
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_main' });
	}
	eventEmitter.broadcastAsync({ type: 'uiShow' });
};

const animateSymbols = async ({ positions }: { positions: Position[] }) => {
	eventEmitter.broadcast({ type: 'boardShow' });
	await eventEmitter.broadcastAsync({
		type: 'boardWithAnimateSymbols',
		symbolPositions: positions,
	});
};

const getLockedSymbolsFromPositions = (positions: Position[]) => {
	const rawBoard = stateGameDerived.boardRaw();
	return positions.map((position) => {
		const rawSymbol =
			rawBoard?.[position.reel]?.[position.row + 1] ??
			rawBoard?.[position.reel]?.[position.row] ??
			({ name: 'M' } as RawSymbol);

		return {
			position,
			rawSymbol: { ...rawSymbol, locked: true } as RawSymbol,
		};
	});
};

const getLockedSymbolsFromBoard = (board: RawSymbol[][]) =>
	board.flatMap((reel, reelIndex) =>
		reel
			.map((rawSymbol, rowIndex) =>
				rawSymbol.locked
					? { position: { reel: reelIndex, row: rowIndex }, rawSymbol }
					: null,
			)
			.filter(Boolean) as { position: Position; rawSymbol: RawSymbol }[],
	);

const buildHoldAndSpinRevealEvent = ({
	board,
	index,
}: {
	board: RawSymbol[][];
	index: number;
}) => ({
	index,
	type: 'reveal' as const,
	board: normalizeBoard(board),
	anticipation: new Array(board.length).fill(0),
	paddingPositions: new Array(board.length).fill(0),
	gameType: 'holdnspin' as const,
});

export const bookEventHandlerMap: BookEventHandlerMap<BookEvent, BookEventContext> = {
	reveal: async (bookEvent: BookEventOfType<'reveal'>, { bookEvents }: BookEventContext) => {
		const isBonusGame = checkIsMultipleRevealEvents({ bookEvents });
		if (isBonusGame) {
			eventEmitter.broadcast({ type: 'stopButtonEnable' });
			recordBookEvent({ bookEvent });
		}

		stateGame.gameType = bookEvent.gameType;
		const normalizedBoard = normalizeBoard(bookEvent.board);
		await stateGameDerived.enhancedBoard.spin({
			revealEvent: { ...bookEvent, board: normalizedBoard },
		});
		eventEmitter.broadcast({ type: 'soundScatterCounterClear' });
	},
	winInfo: async (bookEvent: BookEventOfType<'winInfo'>) => {
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_winlevel_small' });
		await sequence(bookEvent.wins, async (win) => {
			await animateSymbols({ positions: win.positions });
		});
	},
	setTotalWin: async (bookEvent: BookEventOfType<'setTotalWin'>) => {
		stateBet.winBookEventAmount = bookEvent.amount;
	},
	freeSpinTrigger: async (bookEvent: BookEventOfType<'freeSpinTrigger'>) => {
		// animate scatters
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_scatter_win_v2' });
		await animateSymbols({ positions: bookEvent.positions });
		// show free spin intro
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_superfreespin' });
		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });
		eventEmitter.broadcast({ type: 'freeSpinIntroShow' });
		eventEmitter.broadcast({ type: 'soundOnce', name: 'jng_intro_fs' });
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
		await eventEmitter.broadcastAsync({
			type: 'freeSpinIntroUpdate',
			totalFreeSpins: bookEvent.totalFs,
		});
		stateGame.gameType = 'freegame';
		eventEmitter.broadcast({ type: 'freeSpinIntroHide' });
		eventEmitter.broadcast({ type: 'boardFrameGlowShow' });
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: undefined,
			total: bookEvent.totalFs,
		});
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerButtonShow' });
		eventEmitter.broadcast({ type: 'drawerFold' });
	},
	updateFreeSpin: async (bookEvent: BookEventOfType<'updateFreeSpin'>) => {
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: bookEvent.amount,
			total: bookEvent.total,
		});
	},
	freeSpinEnd: async (bookEvent: BookEventOfType<'freeSpinEnd'>) => {
		const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];

		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		stateGame.gameType = 'basegame';
		eventEmitter.broadcast({ type: 'boardFrameGlowHide' });
		eventEmitter.broadcast({ type: 'freeSpinOutroShow' });
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_youwon_panel' });
		winLevelSoundsPlay({ winLevelData });
		await eventEmitter.broadcastAsync({
			type: 'freeSpinOutroCountUp',
			amount: bookEvent.amount,
			winLevelData,
		});
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'freeSpinOutroHide' });
		eventEmitter.broadcast({ type: 'freeSpinCounterHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerUnfold' });
		eventEmitter.broadcast({ type: 'drawerButtonHide' });
	},
	setWin: async (bookEvent: BookEventOfType<'setWin'>) => {
		const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];

		eventEmitter.broadcast({ type: 'winShow' });
		winLevelSoundsPlay({ winLevelData });
		await eventEmitter.broadcastAsync({
			type: 'winUpdate',
			amount: bookEvent.amount,
			winLevelData,
		});
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'winHide' });
	},
	finalWin: async (bookEvent: BookEventOfType<'finalWin'>) => {
		// Do nothing
	},
	holdAndSpinTrigger: async (bookEvent: BookEventOfType<'holdAndSpinTrigger'>) => {
		// Play drill activation sound and sparks
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_drill_activate' });
		eventEmitter.broadcast({ type: 'cameraShake', intensity: 10, duration: 500 });
		
		// Animate triggering money symbols
		await animateSymbols({ positions: bookEvent.moneyPositions });
		
		// Grid iron frame overlay
		eventEmitter.broadcast({ type: 'holdAndSpinFrameShow' });
		eventEmitter.broadcast({
			type: 'holdAndSpinCounterShow',
		});

		stateGame.holdAndSpin.previousGameType = stateGame.gameType;
		stateGame.holdAndSpin.isActive = true;
		stateGame.holdAndSpin.totalRespins = bookEvent.totalRespins;
		stateGame.holdAndSpin.respinsLeft = bookEvent.totalRespins;
		stateGame.holdAndSpin.multiplier = 1;
		stateGame.gameType = 'holdnspin';
		stateGame.holdAndSpin.lockedSymbols = getLockedSymbolsFromPositions(
			bookEvent.moneyPositions,
		);

		eventEmitter.broadcast({
			type: 'holdAndSpinCounterUpdate',
			current: stateGame.holdAndSpin.respinsLeft,
			total: stateGame.holdAndSpin.totalRespins,
		});

		if (stateUrlDerived.replay()) {
			await waitForTimeout(350);
		}
	},
	holdAndSpinRespin: async (bookEvent: BookEventOfType<'holdAndSpinRespin'>) => {
		stateGame.holdAndSpin.respinsLeft = bookEvent.respinsRemaining;
		if (bookEvent.multiplier) {
			stateGame.holdAndSpin.multiplier = bookEvent.multiplier;
		}

		const nextLockedSymbols = getLockedSymbolsFromBoard(bookEvent.board);

		eventEmitter.broadcast({
			type: 'holdAndSpinCounterUpdate',
			current: stateGame.holdAndSpin.respinsLeft,
			total: stateGame.holdAndSpin.totalRespins,
		});

		// Spin reels while locked symbols stay visible via overlay
		const revealEvent = buildHoldAndSpinRevealEvent({
			board: bookEvent.board,
			index: bookEvent.index,
		});
		await stateGameDerived.enhancedBoard.spin({ revealEvent });

		if (bookEvent.newMoneyPositions.length > 0) {
			eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_money_landing' });
			eventEmitter.broadcast({ type: 'cameraShake', intensity: 2, duration: 200 });
			await animateSymbols({ positions: bookEvent.newMoneyPositions });

			if (bookEvent.respinsRemaining === stateGame.holdAndSpin.totalRespins) {
				eventEmitter.broadcast({
					type: 'holdAndSpinRespinIntroUpdate',
					totalRespins: stateGame.holdAndSpin.respinsLeft,
				});
			}
		}

		stateGame.holdAndSpin.lockedSymbols = nextLockedSymbols;

		if (stateUrlDerived.replay()) {
			const delay = bookEvent.newMoneyPositions.length > 0 ? 550 : 300;
			await waitForTimeout(delay);
		}
	},
	holdAndSpinEnd: async (bookEvent: BookEventOfType<'holdAndSpinEnd'>) => {
		stateGame.holdAndSpin.isActive = false;
		stateGame.holdAndSpin.lockedSymbols = [];
		eventEmitter.broadcast({ type: 'holdAndSpinFrameHide' });
		eventEmitter.broadcast({ type: 'holdAndSpinCounterHide' });
		stateGame.gameType = stateGame.holdAndSpin.previousGameType;
		
		// Show total win panel
		eventEmitter.broadcast({ type: 'winShow' });
		await eventEmitter.broadcastAsync({
			type: 'winUpdate',
			amount: bookEvent.totalWin,
			winLevelData: winLevelMap[9], // Use EPIC WIN for H&S as it's a major feature
		});
		await waitForTimeout(2000);
		eventEmitter.broadcast({ type: 'winHide' });
		stateGame.holdAndSpin.multiplier = 1;
		stateGame.holdAndSpin.respinsLeft = 0;
		stateGame.holdAndSpin.totalRespins = 0;
		stateGame.holdAndSpin.jackpotWon = null;
	},
	jackpotAwarded: async (bookEvent: BookEventOfType<'jackpotAwarded'>) => {
		stateGame.holdAndSpin.jackpotWon = bookEvent.jackpotType;
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_rock_crack' });
		eventEmitter.broadcast({ type: 'jackpotCelebrationShow', jackpotType: bookEvent.jackpotType, value: bookEvent.jackpotValue });
		await waitForTimeout(3000);
		eventEmitter.broadcast({ type: 'jackpotCelebrationHide' });
	},
	moneySymbolReveal: async (bookEvent: BookEventOfType<'moneySymbolReveal'>) => {
		// Individual money symbol animation if needed
		// For now just broadcast the info
	},
	// customised
	createBonusSnapshot: async (bookEvent: BookEventOfType<'createBonusSnapshot'>) => {
		const { bookEvents } = bookEvent;

		function findLastBookEvent<T>(type: T) {
			return _.findLast(bookEvents, (bookEvent) => bookEvent.type === type) as
				| BookEventOfType<T>
				| undefined;
		}

		const lastFreeSpinTriggerEvent = findLastBookEvent('freeSpinTrigger' as const);
		const lastUpdateFreeSpinEvent = findLastBookEvent('updateFreeSpin' as const);
		const lastSetTotalWinEvent = findLastBookEvent('setTotalWin' as const);
		const lastUpdateGlobalMultEvent = findLastBookEvent('updateGlobalMult' as const);

		if (lastFreeSpinTriggerEvent) await playBookEvent(lastFreeSpinTriggerEvent, { bookEvents });
		if (lastUpdateFreeSpinEvent) playBookEvent(lastUpdateFreeSpinEvent, { bookEvents });
		if (lastSetTotalWinEvent) playBookEvent(lastSetTotalWinEvent, { bookEvents });
		if (lastUpdateGlobalMultEvent) playBookEvent(lastUpdateGlobalMultEvent, { bookEvents });
	},
};
