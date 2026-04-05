<script lang="ts">
	import { getContext } from '../game/context';
	import { getSymbolX, getSymbolY } from '../game/utils';
	import BoardContainer from './BoardContainer.svelte';
	import BoardMask from './BoardMask.svelte';
	import Symbol from './Symbol.svelte';

	const context = getContext();
	const lockedSymbols = $derived(context.stateGame.holdAndSpin.lockedSymbols);
	const show = $derived(
		context.stateGame.holdAndSpin.isActive && lockedSymbols.length > 0,
	);
</script>

{#if show}
	<BoardContainer>
		<BoardMask />
		{#each lockedSymbols as lockedSymbol (
			`${lockedSymbol.position.reel}-${lockedSymbol.position.row}`
		)}
			<Symbol
				x={getSymbolX(lockedSymbol.position.reel)}
				y={getSymbolY(lockedSymbol.position.row)}
				state="static"
				rawSymbol={lockedSymbol.rawSymbol}
			/>
		{/each}
	</BoardContainer>
{/if}
