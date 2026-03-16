/**
 * Mock RGS Server for the WAYS game (6x5) without a real RGS backend.
 *
 * Usage:
 *   node mock-rgs-server.mjs
 *
 * Then start the game with:
 *   pnpm run dev --filter=ways_15625
 *
 * Open: http://localhost:3001/?rgs_url=localhost:3457&sessionID=mock-session&lang=en
 *
 * This mock server handles all RGS endpoints and returns realistic game data
 * from embedded sample books so the game runs fully offline.
 */

import http from 'node:http';

const PORT = 3457;
const API_AMOUNT_MULTIPLIER = 1_000_000;

// ─── Mock State ──────────────────────────────────────────────────────────────

let mockBalance = 10_000 * API_AMOUNT_MULTIPLIER; // $10,000 starting balance
let currentRound = null;
let roundIdCounter = 1;

// ─── Embedded Sample Books (from apps/lines/src/stories/data) ────────────────



const BONUS_FS_BOOKS = [
  {
    "id": 101,
    "payoutMultiplier": 10,
    "events": [
      {
        "index": 0,
        "type": "reveal",
        "board": [
          [
            {
              "name": "DRI"
            },
            {
              "name": "S"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            }
          ],
          [
            {
              "name": "DRI"
            },
            {
              "name": "S"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            },
            {
              "name": "GCA"
            },
            {
              "name": "GCA"
            },
            {
              "name": "GCA"
            }
          ],
          [
            {
              "name": "LAN"
            },
            {
              "name": "S"
            },
            {
              "name": "A"
            },
            {
              "name": "A"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            }
          ],
          [
            {
              "name": "A"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            },
            {
              "name": "PIC"
            },
            {
              "name": "PIC"
            },
            {
              "name": "PIC"
            },
            {
              "name": "PIC"
            }
          ],
          [
            {
              "name": "A"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            }
          ],
          [
            {
              "name": "A"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            }
          ]
        ],
        "paddingPositions": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "gameType": "basegame",
        "anticipation": [
          0,
          1,
          2,
          0,
          0,
          0
        ]
      },
      {
        "index": 1,
        "type": "setTotalWin",
        "amount": 0
      },
      {
        "index": 2,
        "type": "freeSpinTrigger",
        "totalFs": 10,
        "positions": [
          {
            "reel": 0,
            "row": 1
          },
          {
            "reel": 1,
            "row": 1
          },
          {
            "reel": 2,
            "row": 1
          }
        ]
      },
      {
        "index": 3,
        "type": "updateFreeSpin",
        "amount": 1,
        "total": 10
      },
      {
        "index": 4,
        "type": "reveal",
        "board": [
          [
            {
              "name": "DRI"
            },
            {
              "name": "DRI"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            }
          ],
          [
            {
              "name": "DRI"
            },
            {
              "name": "DRI"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            },
            {
              "name": "GCA"
            },
            {
              "name": "GCA"
            },
            {
              "name": "GCA"
            }
          ],
          [
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            },
            {
              "name": "A"
            },
            {
              "name": "A"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            }
          ],
          [
            {
              "name": "A"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            },
            {
              "name": "PIC"
            },
            {
              "name": "PIC"
            },
            {
              "name": "PIC"
            },
            {
              "name": "PIC"
            }
          ],
          [
            {
              "name": "A"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            }
          ],
          [
            {
              "name": "A"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            }
          ]
        ],
        "paddingPositions": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "gameType": "freegame",
        "anticipation": [
          0,
          0,
          0,
          0,
          0,
          0
        ]
      },
      {
        "index": 5,
        "type": "freeSpinEnd",
        "amount": 1000,
        "winLevel": 5
      },
      {
        "index": 6,
        "type": "finalWin",
        "amount": 1000
      }
    ],
    "criteria": "freegame"
  }
];
const BONUS_HNS_BOOKS = [
  {
    "id": 201,
    "payoutMultiplier": 5,
    "events": [
      {
        "index": 0,
        "type": "reveal",
        "board": [
          [
            {
              "name": "M"
            },
            {
              "name": "M"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            }
          ],
          [
            {
              "name": "M"
            },
            {
              "name": "M"
            },
            {
              "name": "K"
            },
            {
              "name": "K"
            },
            {
              "name": "GCA"
            },
            {
              "name": "GCA"
            },
            {
              "name": "GCA"
            }
          ],
          [
            {
              "name": "M"
            },
            {
              "name": "M"
            },
            {
              "name": "A"
            },
            {
              "name": "A"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            }
          ],
          [
            {
              "name": "A"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            },
            {
              "name": "PIC"
            },
            {
              "name": "PIC"
            },
            {
              "name": "PIC"
            },
            {
              "name": "PIC"
            }
          ],
          [
            {
              "name": "A"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            }
          ],
          [
            {
              "name": "A"
            },
            {
              "name": "DIA"
            },
            {
              "name": "DIA"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            },
            {
              "name": "LAN"
            }
          ]
        ],
        "paddingPositions": [
          0,
          0,
          0,
          0,
          0,
          0
        ],
        "gameType": "basegame",
        "anticipation": [
          1,
          2,
          3,
          4,
          5,
          0
        ]
      },
      {
        "index": 1,
        "type": "setTotalWin",
        "amount": 0
      },
      {
        "index": 2,
        "type": "finalWin",
        "amount": 500
      }
    ],
    "criteria": "holdnspin"
  }
];
const BASE_BOOKS = [
	{
		id: 1,
		payoutMultiplier: 0.0,
		events: [
			{
				index: 0,
				type: 'reveal',
				board: [
					[{ name: 'DRI' }, { name: 'DRI' }, { name: 'K' }, { name: 'K' }, { name: 'K' }, { name: 'K' }, { name: 'K' }],
					[{ name: 'DRI' }, { name: 'DRI' }, { name: 'K' }, { name: 'K' }, { name: 'GCA' }, { name: 'GCA' }, { name: 'GCA' }],
					[{ name: 'LAN' }, { name: 'LAN' }, { name: 'A' }, { name: 'A' }, { name: 'DIA' }, { name: 'DIA' }, { name: 'DIA' }],
					[{ name: 'A' }, { name: 'DIA' }, { name: 'DIA' }, { name: 'PIC' }, { name: 'PIC' }, { name: 'PIC' }, { name: 'PIC' }],
					[{ name: 'A' }, { name: 'DIA' }, { name: 'DIA' }, { name: 'LAN' }, { name: 'LAN' }, { name: 'LAN' }, { name: 'LAN' }],
					[{ name: 'A' }, { name: 'DIA' }, { name: 'DIA' }, { name: 'LAN' }, { name: 'LAN' }, { name: 'LAN' }, { name: 'LAN' }]
				],
				paddingPositions: [216, 205, 195, 16, 65, 0],
				gameType: 'basegame',
				anticipation: [0, 0, 0, 0, 0, 0],
			},
			{ index: 1, type: 'setTotalWin', amount: 0 },
			{ index: 2, type: 'finalWin', amount: 0 },
		],
		criteria: '0',
	}
];
// ─── Bet Level Configuration ─────────────────────────────────────────────────

const BET_LEVELS = [
	100000, 200000, 300000, 500000, 700000, 1000000, 1500000, 2000000, 3000000,
	5000000, 7000000, 10000000, 15000000, 20000000, 30000000, 50000000,
	70000000, 100000000, 150000000, 200000000, 300000000, 500000000,
	700000000, 1000000000,
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickRandomBook() {
	return BASE_BOOKS[Math.floor(Math.random() * BASE_BOOKS.length)];
}

function sendJson(res, statusCode, data) {
	res.writeHead(statusCode, {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	});
	res.end(JSON.stringify(data));
}

function readBody(req) {
	return new Promise((resolve) => {
		let body = '';
		req.on('data', (chunk) => (body += chunk));
		req.on('end', () => {
			try {
				resolve(JSON.parse(body));
			} catch {
				resolve({});
			}
		});
	});
}

// ─── BOOK_AMOUNT_MULTIPLIER = 100; amounts in books are in centi-units ──────
// When bet = $1.00 (API_AMOUNT_MULTIPLIER = 1000000), and book says amount=20
// Then payout = betAmount * book.payoutMultiplier
// book amount values are relative to a 1-unit bet (100 centi-units)
const BOOK_AMOUNT_MULTIPLIER = 100;

// ─── Route Handlers ──────────────────────────────────────────────────────────

async function handleAuthenticate(req, res) {
	const body = await readBody(req);
	console.log('[mock-rgs] POST /wallet/authenticate', body);

	// Reset state on authenticate
	currentRound = null;

	sendJson(res, 200, {
		status: { statusCode: 'SUCCESS' },
		balance: {
			amount: mockBalance,
			currency: 'USD',
		},
		config: {
			gameID: 'mock-ways',
			minBet: BET_LEVELS[0],
			maxBet: BET_LEVELS[BET_LEVELS.length - 1],
			stepBet: 100000,
			defaultBetLevel: 1000000,
			betLevels: BET_LEVELS,
			betModes: {
				BASE: { cost: 1 },
				BONUS_FS: { cost: 80 },
				BONUS_HNS: { cost: 100 },
			},
			jurisdiction: {
				socialCasino: false,
				disabledFullscreen: false,
				disabledTurbo: false,
				disabledSuperTurbo: false,
				disabledAutoplay: false,
				disabledSlamstop: false,
				disabledSpacebar: false,
				disabledBuyFeature: false,
				displayNetPosition: false,
				displayRTP: false,
				displaySessionTimer: false,
				minimumRoundDuration: 0,
			},
		},
		round: null,
	});
}

async function handlePlay(req, res) {
	const body = await readBody(req);
	console.log('[mock-rgs] POST /wallet/play', body);

	const betAmount = body.amount || 1000000;
	const mode = body.mode || 'BASE';
	
	let book;
	if (mode === 'BONUS_FS') {
		book = BONUS_FS_BOOKS[Math.floor(Math.random() * BONUS_FS_BOOKS.length)];
	} else if (mode === 'BONUS_HNS') {
		book = BONUS_HNS_BOOKS[Math.floor(Math.random() * BONUS_HNS_BOOKS.length)];
	} else {
		book = pickRandomBook();
	}

	// Deduct bet
	mockBalance -= betAmount;

	// Calculate payout: betAmount * payoutMultiplier
	const payout = Math.round(betAmount * book.payoutMultiplier);
	const isBonusGame = book.events.some((e) => e.type === 'freeSpinTrigger');

	// For single-round wins (non-bonus), add payout to balance immediately
	// For bonus wins, payout is added on end-round
	if (!isBonusGame && payout > 0) {
		mockBalance += payout;
	}

	const roundId = roundIdCounter++;
	currentRound = {
		roundID: roundId,
		amount: betAmount,
		payout: payout,
		payoutMultiplier: book.payoutMultiplier,
		active: isBonusGame && payout > 0,
		state: book.events,
		mode: body.mode || 'BASE',
		event: null,
	};

	sendJson(res, 200, {
		status: { statusCode: 'SUCCESS' },
		balance: {
			amount: mockBalance,
			currency: body.currency || 'USD',
		},
		round: currentRound,
	});
}

async function handleEndRound(req, res) {
	const body = await readBody(req);
	console.log('[mock-rgs] POST /wallet/end-round', body);

	// If there's an active bonus round, add payout now
	if (currentRound && currentRound.active && currentRound.payout > 0) {
		mockBalance += currentRound.payout;
	}

	currentRound = null;

	sendJson(res, 200, {
		status: { statusCode: 'SUCCESS' },
		balance: {
			amount: mockBalance,
			currency: 'USD',
		},
	});
}

async function handleEvent(req, res) {
	const body = await readBody(req);
	console.log('[mock-rgs] POST /bet/event', body);

	sendJson(res, 200, {
		status: { statusCode: 'SUCCESS' },
		event: body.event || '0',
	});
}

async function handleAction(req, res) {
	const body = await readBody(req);
	console.log('[mock-rgs] POST /bet/action', body);

	sendJson(res, 200, {
		status: { statusCode: 'SUCCESS' },
		balance: {
			amount: mockBalance,
			currency: 'USD',
		},
		action: currentRound,
	});
}

async function handleBalance(req, res) {
	const body = await readBody(req);
	console.log('[mock-rgs] POST /wallet/balance', body);

	sendJson(res, 200, {
		status: { statusCode: 'SUCCESS' },
		balance: {
			amount: mockBalance,
			currency: 'USD',
		},
	});
}

async function handleReplay(req, res) {
	console.log('[mock-rgs] GET /bet/replay/...');

	const book = pickRandomBook();

	sendJson(res, 200, {
		roundID: 1,
		amount: 1000000,
		payout: Math.round(1000000 * book.payoutMultiplier),
		payoutMultiplier: book.payoutMultiplier,
		active: true,
		state: book.events,
		mode: 'BASE',
		event: '0',
	});
}

// ─── Server ──────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		res.writeHead(204, {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		});
		res.end();
		return;
	}

	const url = new URL(req.url, `http://localhost:${PORT}`);
	const pathname = url.pathname;

	try {
		if (req.method === 'POST') {
			switch (pathname) {
				case '/wallet/authenticate':
					return await handleAuthenticate(req, res);
				case '/wallet/play':
					return await handlePlay(req, res);
				case '/wallet/end-round':
					return await handleEndRound(req, res);
				case '/bet/event':
					return await handleEvent(req, res);
				case '/bet/action':
					return await handleAction(req, res);
				case '/wallet/balance':
					return await handleBalance(req, res);
				case '/session/start':
					return sendJson(res, 200, { status: { statusCode: 'SUCCESS' } });
				case '/game/search':
					return sendJson(res, 200, { balance: { amount: mockBalance, currency: 'USD' } });
				default:
					console.log(`[mock-rgs] Unknown POST ${pathname}`);
					return sendJson(res, 200, { status: { statusCode: 'SUCCESS' } });
			}
		}

		if (req.method === 'GET') {
			if (pathname.startsWith('/bet/replay/')) {
				return await handleReplay(req, res);
			}

			// Health check
			if (pathname === '/' || pathname === '/health') {
				return sendJson(res, 200, {
					status: 'ok',
					message: 'Mock RGS Server is running',
					balance: mockBalance / API_AMOUNT_MULTIPLIER,
				});
			}
		}

		console.log(`[mock-rgs] Unhandled ${req.method} ${pathname}`);
		sendJson(res, 200, { status: { statusCode: 'SUCCESS' } });
	} catch (err) {
		console.error('[mock-rgs] Error:', err);
		sendJson(res, 500, { error: 'Internal mock server error' });
	}
});

server.listen(PORT, () => {
	console.log(`\n🎰 Mock RGS Server running at http://localhost:${PORT}`);
	console.log(`\n📋 Open your game at:`);
	console.log(`   http://localhost:3001/?rgs_url=localhost:${PORT}&sessionID=mock-session&lang=en\n`);
	console.log(`💰 Starting balance: $${(mockBalance / API_AMOUNT_MULTIPLIER).toLocaleString()}`);
	console.log(`📚 ${BASE_BOOKS.length} sample books loaded (mix of wins, losses, and bonus rounds)\n`);
});
