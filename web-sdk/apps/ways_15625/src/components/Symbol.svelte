<script lang="ts">
	import SymbolSpine from './SymbolSpine.svelte';
	import SymbolSprite from './SymbolSprite.svelte';
	import { getSymbolInfo } from '../game/utils';
	import type { SymbolState, RawSymbol } from '../game/types';
	import { getContext } from '../game/context';
	import { BitmapText } from 'pixi-svelte';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		rawSymbol: RawSymbol;
		oncomplete?: () => void;
		loop?: boolean;
	};

	const props: Props = $props();
	const context = getContext();
	const symbolInfo = $derived(getSymbolInfo({ rawSymbol: props.rawSymbol, state: props.state }));
	const isSprite = $derived(symbolInfo.type === 'sprite');
	const moneyPrizeText = $derived.by(() => {
		if (props.rawSymbol.name !== 'M' || props.rawSymbol.prize == null) return null;
		const isHoldAndSpin = context.stateGame.gameType === 'holdnspin';
		const multiplier = isHoldAndSpin ? context.stateGame.holdAndSpin.multiplier : 1;
		const displayValue = props.rawSymbol.prize * multiplier;
		const formattedValue = Number.isInteger(displayValue)
			? displayValue.toString()
			: displayValue.toFixed(2);
		return `${formattedValue}X`;
	});
</script>

{#if isSprite}
	<SymbolSprite {symbolInfo} x={props.x} y={props.y} oncomplete={props.oncomplete} />
{:else}
	<SymbolSpine
		loop={props.loop}
		{symbolInfo}
		x={props.x}
		y={props.y}
		showWinFrame={props.state === 'win' && !['S', 'M'].includes(props.rawSymbol.name)}
		listener={{
			complete: props.oncomplete,
			event: (_, event) => {
				if (event.data?.name === 'wildExplode') {
					context.eventEmitter?.broadcast({ type: 'soundOnce', name: 'sfx_wild_explode' });
				}
			},
		}}
	/>
{/if}

{#if props.rawSymbol.multiplier}
	<BitmapText
		anchor={0.5}
		x={props.x}
		y={props.y}
		text={`${props.rawSymbol.multiplier}X`}
		style={{
			fontFamily: 'goldFont',
			fontSize: 50,
		}}
	/>
{/if}

{#if moneyPrizeText}
	<BitmapText
		anchor={0.5}
		x={props.x}
		y={props.y}
		text={moneyPrizeText}
		style={{
			fontFamily: 'goldFont',
			fontSize: 40,
			fill: 0x000000,
			stroke: 0xffffff,
			strokeThickness: 4,
		}}
	/>
{/if}
