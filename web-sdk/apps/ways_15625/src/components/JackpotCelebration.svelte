<script lang="ts" module>
	export type EmitterEventJackpotCelebration =
		| { type: 'jackpotCelebrationShow'; jackpotType: string; value: number }
		| { type: 'jackpotCelebrationHide' };
</script>

<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { getContext } from '../game/context';
	import { anchorToPivot, BitmapText, Container, Sprite, type Sizes } from 'pixi-svelte';
	import { SYMBOL_SIZE } from '../game/constants';

	const context = getContext();
	let show = $state(false);
	let jackpotType = $state('');
	let jackpotValue = $state(0);

	context.eventEmitter.subscribeOnMount({
		jackpotCelebrationShow: (event) => {
			jackpotType = event.jackpotType;
			jackpotValue = event.value;
			show = true;
		},
		jackpotCelebrationHide: () => {
			show = false;
		},
	});

	const screenSizes = $derived(context.stateLayoutDerived.mainLayout());
	const position = $derived({
		x: screenSizes.width * 0.5,
		y: screenSizes.height * 0.4,
	});
</script>

<MainContainer>
	<FadeContainer {show} {...position} anchor={0.5}>
		<Container pivot={0.5}>
			<BitmapText
				text={jackpotType}
				anchor={0.5}
				style={{
					fontFamily: 'gold',
					fontSize: SYMBOL_SIZE * 0.8,
				}}
			/>
			<BitmapText
				text={`${(jackpotValue / 100).toFixed(2)}`}
				y={SYMBOL_SIZE * 0.8}
				anchor={0.5}
				style={{
					fontFamily: 'gold',
					fontSize: SYMBOL_SIZE * 0.5,
				}}
			/>
		</Container>
	</FadeContainer>
</MainContainer>
