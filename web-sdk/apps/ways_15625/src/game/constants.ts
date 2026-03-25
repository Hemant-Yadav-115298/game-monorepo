import _ from 'lodash';

import type { RawSymbol, SymbolState } from './types';

export const SYMBOL_SIZE = 100;

export const REEL_PADDING = 0.53;

// initial board (padded top and bottom)
export const INITIAL_BOARD: RawSymbol[][] = [
	[
		{ name: 'DRI' }, { name: 'DRI' }, { name: 'LAN' }, { name: 'LAN' }, { name: 'LAN' }, { name: 'A' }, { name: 'A' }
	],
	[
		{ name: 'DRI' }, { name: 'DRI' }, { name: 'LAN' }, { name: 'LAN' }, { name: 'GCA' }, { name: 'K' }, { name: 'K' }
	],
	[
		{ name: 'K' }, { name: 'K' }, { name: 'Q' }, { name: 'Q' }, { name: 'DIA' }, { name: 'Q' }, { name: 'Q' }
	],
	[
		{ name: 'Q' }, { name: 'DIA' }, { name: 'DIA' }, { name: 'PIC' }, { name: 'PIC' }, { name: 'M' }, { name: 'M' }
	],
	[
		{ name: 'Q' }, { name: 'DIA' }, { name: 'DIA' }, { name: 'K' }, { name: 'K' }, { name: 'DRI' }, { name: 'DRI' }
	],
	[
		{ name: 'TNT' }, { name: 'TNT' }, { name: 'A' }, { name: 'A' }, { name: 'GCA' }, { name: 'GCA' }, { name: 'LAN' }
	]
];

export const BOARD_DIMENSIONS = { x: INITIAL_BOARD.length, y: INITIAL_BOARD[0].length - 2 };

export const BOARD_SIZES = {
	width: SYMBOL_SIZE * BOARD_DIMENSIONS.x,
	height: SYMBOL_SIZE * BOARD_DIMENSIONS.y + 170,
};

export const BACKGROUND_RATIO = 2039 / 1000;
export const PORTRAIT_BACKGROUND_RATIO = 1242 / 2208;
const PORTRAIT_RATIO = 800 / 1422;
const LANDSCAPE_RATIO = 1600 / 900;
const DESKTOP_RATIO = 1422 / 800;

const DESKTOP_HEIGHT = 800;
const LANDSCAPE_HEIGHT = 900;
const PORTRAIT_HEIGHT = 1422;
export const DESKTOP_MAIN_SIZES = { width: DESKTOP_HEIGHT * DESKTOP_RATIO, height: DESKTOP_HEIGHT };
export const LANDSCAPE_MAIN_SIZES = {
	width: LANDSCAPE_HEIGHT * LANDSCAPE_RATIO,
	height: LANDSCAPE_HEIGHT,
};
export const PORTRAIT_MAIN_SIZES = {
	width: PORTRAIT_HEIGHT * PORTRAIT_RATIO,
	height: PORTRAIT_HEIGHT,
};

export const HIGH_SYMBOLS = ['H1', 'H2', 'H3', 'H4', 'H5'];

export const INITIAL_SYMBOL_STATE: SymbolState = 'static';

const HIGH_SYMBOL_SIZE = 0.9;
const LOW_SYMBOL_SIZE = 0.9;
const SPECIAL_SYMBOL_SIZE = 1;

const SPIN_OPTIONS_SHARED = {
	reelFallInDelay: 80,
	reelPaddingMultiplierNormal: 1.25,
	reelPaddingMultiplierAnticipated: 18,
	reelFallOutDelay: 145,
};

export const SPIN_OPTIONS_DEFAULT = {
	...SPIN_OPTIONS_SHARED,
	symbolFallInSpeed: 3.5,
	symbolFallInInterval: 30,
	symbolFallInBounceSpeed: 0.15,
	symbolFallInBounceSizeMulti: 0.5,
	symbolFallOutSpeed: 3.5,
	symbolFallOutInterval: 20,
};

export const SPIN_OPTIONS_FAST = {
	...SPIN_OPTIONS_SHARED,
	symbolFallInSpeed: 7,
	symbolFallInInterval: 0,
	symbolFallInBounceSpeed: 0.3,
	symbolFallInBounceSizeMulti: 0.25,
	symbolFallOutSpeed: 7,
	symbolFallOutInterval: 0,
};

export const MOTION_BLUR_VELOCITY = 31;

export const zIndexes = {
	background: {
		backdrop: -3,
		normal: -2,
		feature: -1,
	},
};

const explosion = {
	type: 'spine',
	assetKey: 'explosion',
	animationName: 'explosion',
	sizeRatios: { width: 1, height: 1 },
};

// High static sprites (unique per symbol from new atlas)
const h1Static = { type: 'sprite', assetKey: 'DRI.png', sizeRatios: { width: 1, height: 1 } };
const h2Static = { type: 'sprite', assetKey: 'DIA.png', sizeRatios: { width: 1, height: 1 } };
const h3Static = { type: 'sprite', assetKey: 'GCA.png', sizeRatios: { width: 1, height: 1 } };

// Medium static sprites (unique per symbol from new atlas)
const m1Static = { type: 'sprite', assetKey: 'TNT.png', sizeRatios: { width: 1, height: 1 } };
const m2Static = { type: 'sprite', assetKey: 'PIC.png', sizeRatios: { width: 1, height: 1 } };
const m3Static = { type: 'sprite', assetKey: 'HEL.png', sizeRatios: { width: 1, height: 1 } };
const m4Static = { type: 'sprite', assetKey: 'LAN.png', sizeRatios: { width: 1, height: 1 } };

// Low static sprites (unique per symbol from new atlas)
const l1Static = { type: 'sprite', assetKey: 'A.png', sizeRatios: { width: 1, height: 1 } };
const l2Static = { type: 'sprite', assetKey: 'K.png', sizeRatios: { width: 1, height: 1 } };
const l3Static = { type: 'sprite', assetKey: 'Q.png', sizeRatios: { width: 1, height: 1 } };
const l4Static = { type: 'sprite', assetKey: 'J.png', sizeRatios: { width: 1, height: 1 } };
const l5Static = { type: 'sprite', assetKey: '10.png', sizeRatios: { width: 1, height: 1 } };

// Multiplier symbol (spine)
const mStatic = {
	type: 'spine',
	assetKey: 'M',
	animationName: 'low_multiplier_static',
	sizeRatios: { width: 0.3, height: 0.3 },
};

// Special symbols
const sStatic = { type: 'sprite', assetKey: 'S.png', sizeRatios: { width: 1.243, height: 1.243 } };
const wStatic = { type: 'sprite', assetKey: 'W.png', sizeRatios: { width: 1.12, height: 1.12 } };

const wSizeRatios = { width: 1.5 * 0.9, height: SPECIAL_SYMBOL_SIZE * 1.15 };
const sSizeRatios = { width: 2.5, height: SPECIAL_SYMBOL_SIZE * 2.3 };

// Basic info templates
const infoMap: Record<string, any> = {
	// === HIGH symbols ===
	H1: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'H1',
			animationName: 'h1',
			sizeRatios: { width: 0.5 * 1.15, height: HIGH_SYMBOL_SIZE * 0.57 },
		},
		postWinStatic: h1Static,
		static: h1Static,
		spin: h1Static,
		land: h1Static,
	},
	H2: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'H2',
			animationName: 'h2',
			sizeRatios: { width: 0.5, height: HIGH_SYMBOL_SIZE * 0.57 },
		},
		postWinStatic: h2Static,
		static: h2Static,
		spin: h2Static,
		land: h2Static,
	},
	H3: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'H3',
			animationName: 'h3',
			sizeRatios: { width: 0.5 * 0.9, height: HIGH_SYMBOL_SIZE * 0.53 },
		},
		postWinStatic: h3Static,
		static: h3Static,
		spin: h3Static,
		land: h3Static,
	},
	// === MEDIUM symbols (reusing H4/H5/L1/L2 spine win anims) ===
	M1: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'H4',
			animationName: 'h4',
			sizeRatios: { width: 0.5 * 0.9, height: HIGH_SYMBOL_SIZE * 0.53 },
		},
		postWinStatic: m1Static,
		static: m1Static,
		spin: m1Static,
		land: m1Static,
	},
	M2: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'H5',
			animationName: 'h5',
			sizeRatios: { width: 0.5 * 0.9, height: HIGH_SYMBOL_SIZE * 0.53 },
		},
		postWinStatic: m2Static,
		static: m2Static,
		spin: m2Static,
		land: m2Static,
	},
	M3: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'L1',
			animationName: 'l1',
			sizeRatios: { width: 0.5 * 0.75, height: LOW_SYMBOL_SIZE * 0.65 },
		},
		postWinStatic: m3Static,
		static: m3Static,
		spin: m3Static,
		land: m3Static,
	},
	M4: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'L2',
			animationName: 'l2',
			sizeRatios: { width: 0.5 * 0.75, height: LOW_SYMBOL_SIZE * 0.65 },
		},
		postWinStatic: m4Static,
		static: m4Static,
		spin: m4Static,
		land: m4Static,
	},
	// === LOW symbols ===
	L1: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'L3',
			animationName: 'l3',
			sizeRatios: { width: 0.5 * 0.75, height: LOW_SYMBOL_SIZE * 0.63 },
		},
		postWinStatic: l1Static,
		static: l1Static,
		spin: l1Static,
		land: l1Static,
	},
	L2: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'L4',
			animationName: 'l4',
			sizeRatios: { width: 0.5 * 0.75, height: LOW_SYMBOL_SIZE * 0.63 },
		},
		postWinStatic: l2Static,
		static: l2Static,
		spin: l2Static,
		land: l2Static,
	},
	L3: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'L3',
			animationName: 'l3',
			sizeRatios: { width: 0.5 * 0.75, height: LOW_SYMBOL_SIZE * 0.63 },
		},
		postWinStatic: l3Static,
		static: l3Static,
		spin: l3Static,
		land: l3Static,
	},
	L4: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'L4',
			animationName: 'l4',
			sizeRatios: { width: 0.5 * 0.75, height: LOW_SYMBOL_SIZE * 0.63 },
		},
		postWinStatic: l4Static,
		static: l4Static,
		spin: l4Static,
		land: l4Static,
	},
	L5: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'L2',
			animationName: 'l2',
			sizeRatios: { width: 0.5 * 0.75, height: LOW_SYMBOL_SIZE * 0.65 },
		},
		postWinStatic: l5Static,
		static: l5Static,
		spin: l5Static,
		land: l5Static,
	},
	// === SPECIAL symbols ===
	M: {
		explosion,
		win: {
			type: 'spine',
			assetKey: 'M',
			animationName: 'low_multiplier_pay',
			sizeRatios: { width: 0.3, height: 0.3 },
		},
		postWinStatic: mStatic,
		static: mStatic,
		spin: mStatic,
		land: mStatic,
	},
	W: {
		explosion,
		postWinStatic: wStatic,
		static: wStatic,
		spin: wStatic,
		win: { type: 'spine', assetKey: 'W', animationName: 'wild_dynamite', sizeRatios: wSizeRatios },
		land: {
			type: 'spine',
			assetKey: 'W',
			animationName: 'wild_dynamite_land',
			sizeRatios: wSizeRatios,
		},
	},
	S: {
		explosion,
		postWinStatic: sStatic,
		static: sStatic,
		spin: {
			type: 'spine',
			assetKey: 'S',
			animationName: 'scatter_spin',
			sizeRatios: sSizeRatios,
		},
		win: { type: 'spine', assetKey: 'S', animationName: 'scatter_win', sizeRatios: sSizeRatios },
		land: {
			type: 'spine',
			assetKey: 'S',
			animationName: 'scatter_land',
			sizeRatios: sSizeRatios,
		},
	},
};

export const SYMBOL_INFO_MAP: Record<string, any> = {
	...infoMap,
	// Math SDK Aliases — each math symbol maps to exactly one unique visual group
	// High
	DRI: infoMap.H1,
	DIA: infoMap.H2,
	GCA: infoMap.H3,
	// Medium
	TNT: infoMap.M1,
	PIC: infoMap.M2,
	HEL: infoMap.M3,
	LAN: infoMap.M4,
	// Low
	A: infoMap.L1,
	K: infoMap.L2,
	Q: infoMap.L3,
	J: infoMap.L4,
	'10': infoMap.L5,
} as const;

export const SCATTER_LAND_SOUND_MAP = {
	1: 'sfx_scatter_stop_1',
	2: 'sfx_scatter_stop_2',
	3: 'sfx_scatter_stop_3',
	4: 'sfx_scatter_stop_4',
	5: 'sfx_scatter_stop_5',
} as const;
