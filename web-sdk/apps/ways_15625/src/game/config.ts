export default {
	providerName: 'sample_provider',
	gameName: 'sample_lines',
	gameID: '2_0_tbd_15625ways',
	rtp: 0.96,
	numReels: 6,
	numRows: [5, 5, 5, 5, 5, 5],
	betModes: {
		base: {
			cost: 1.0,
			feature: true,
			buyBonus: false,
			rtp: 0.96,
			max_win: 5000,
		},
		bonus_fs: {
			cost: 80.0,
			feature: false,
			buyBonus: true,
			rtp: 0.96,
			max_win: 5000,
		},
		bonus_hns: {
			cost: 100.0,
			feature: false,
			buyBonus: true,
			rtp: 0.96,
			max_win: 5000,
		},
	},
	symbols: {
		W: {
			paytable: null,
			special_properties: ['wild'],
		},
		DRI: {
			paytable: [{ '6': 15 }, { '5': 8 }, { '4': 4 }, { '3': 2 }],
		},
		DIA: {
			paytable: [{ '6': 12 }, { '5': 6 }, { '4': 3 }, { '3': 1.5 }],
		},
		GCA: {
			paytable: [{ '6': 10 }, { '5': 5 }, { '4': 2 }, { '3': 1 }],
		},
		TNT: {
			paytable: [{ '6': 4 }, { '5': 2 }, { '4': 1 }, { '3': 0.5 }],
		},
		PIC: {
			paytable: [{ '6': 4 }, { '5': 2 }, { '4': 1 }, { '3': 0.5 }],
		},
		HEL: {
			paytable: [{ '6': 4 }, { '5': 2 }, { '4': 1 }, { '3': 0.5 }],
		},
		LAN: {
			paytable: [{ '6': 4 }, { '5': 2 }, { '4': 1 }, { '3': 0.5 }],
		},
		A: {
			paytable: [{ '6': 2 }, { '5': 1 }, { '4': 0.4 }, { '3': 0.2 }],
		},
		K: {
			paytable: [{ '6': 2 }, { '5': 1 }, { '4': 0.4 }, { '3': 0.2 }],
		},
		Q: {
			paytable: [{ '6': 2 }, { '5': 1 }, { '4': 0.4 }, { '3': 0.2 }],
		},
		J: {
			paytable: [{ '6': 2 }, { '5': 1 }, { '4': 0.4 }, { '3': 0.2 }],
		},
		'10': {
			paytable: [{ '6': 2 }, { '5': 1 }, { '4': 0.4 }, { '3': 0.2 }],
		},
		S: {
			paytable: null,
			special_properties: ['scatter'],
		},
		M: {
			paytable: null,
			special_properties: ['money'],
		},
	},
	paddingReels: {
		basegame: '',
		freegame: '',
		superspingame: '',
		holdnspin: '',
	},
};
