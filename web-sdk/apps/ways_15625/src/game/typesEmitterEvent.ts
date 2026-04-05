import type { EmitterEventBoard } from '../components/Board.svelte';
import type { EmitterEventBoardFrame } from '../components/BoardFrame.svelte';
import type { EmitterEventFreeSpinIntro } from '../components/FreeSpinIntro.svelte';
import type { EmitterEventFreeSpinCounter } from '../components/FreeSpinCounter.svelte';
import type { EmitterEventFreeSpinOutro } from '../components/FreeSpinOutro.svelte';
import type { EmitterEventWin } from '../components/Win.svelte';
import type { EmitterEventSound } from '../components/Sound.svelte';
import type { EmitterEventTransition } from '../components/Transition.svelte';
import type { EmitterEventHoldAndSpinCounter } from '../components/HoldAndSpinCounter.svelte';
import type { EmitterEventHoldAndSpinFrame } from '../components/HoldAndSpinFrame.svelte';
import type { EmitterEventHoldAndSpinRespinIntro } from '../components/HoldAndSpinRespinIntro.svelte';
import type { EmitterEventJackpotCelebration } from '../components/JackpotCelebration.svelte';

export type EmitterEventGame =
	| EmitterEventBoard
	| EmitterEventBoardFrame
	| EmitterEventWin
	| EmitterEventFreeSpinIntro
	| EmitterEventFreeSpinCounter
	| EmitterEventFreeSpinOutro
	| EmitterEventSound
	| EmitterEventTransition
	| EmitterEventHoldAndSpinCounter
	| EmitterEventHoldAndSpinFrame
	| EmitterEventHoldAndSpinRespinIntro
	| EmitterEventJackpotCelebration;
