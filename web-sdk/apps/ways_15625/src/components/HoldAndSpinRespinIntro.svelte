<script lang="ts" module>
	export type EmitterEventHoldAndSpinRespinIntro =
		| { type: 'holdAndSpinRespinIntroShow' }
		| { type: 'holdAndSpinRespinIntroHide' }
		| { type: 'holdAndSpinRespinIntroUpdate'; totalRespins: number };
</script>

<script lang="ts">
	import { CanvasSizeRectangle } from 'components-layout';
	import { FadeContainer } from 'components-pixi';
	import { waitForTimeout } from 'utils-shared/wait';
	import { BitmapText, SpineProvider, SpineSlot, SpineTrack } from 'pixi-svelte';

	import { getContext } from '../game/context';
	import FreeSpinAnimation from './FreeSpinAnimation.svelte';

	type AnimationName = 'intro' | 'idle';

	const context = getContext();

	let show = $state(false);
	let animationName = $state<AnimationName>('intro');
	let respinsFromEvent = $state(0);
	let hideToken = 0;

	context.eventEmitter.subscribeOnMount({
		holdAndSpinRespinIntroShow: () => (show = true),
		holdAndSpinRespinIntroHide: () => (show = false),
		holdAndSpinRespinIntroUpdate: async (emitterEvent) => {
			respinsFromEvent = emitterEvent.totalRespins;
			show = true;
			animationName = 'intro';

			const token = ++hideToken;
			await waitForTimeout(900);
			if (token === hideToken) show = false;
		},
	});
</script>

<FadeContainer {show}>
	<CanvasSizeRectangle backgroundColor={0x000000} backgroundAlpha={0.5} />

	<FreeSpinAnimation>
		{#snippet children({ sizes })}
			<BitmapText
				anchor={{ x: 0.5, y: 2 }}
				text={'RESPINS AWARDED: RESETED TO'}
				style={{
					fontFamily: 'gold',
					fontSize: sizes.width * 0.12,
					fontWeight: 'bold',
				}}
			/>

			<SpineProvider key="fsIntroNumber" width={sizes.width * 0.3} anchor={{ x: 0, y: -0.5 }}>
				<SpineTrack
					trackIndex={0}
					{animationName}
					loop={animationName === 'idle'}
					listener={{
						complete: () => (animationName = 'idle'),
					}}
				/>
				<SpineSlot slotName="slot_number">
					<BitmapText
						anchor={{ x: 0.5, y: 0.5 }}
						text={respinsFromEvent}
						style={{
							fontFamily: 'gold',
							fontSize: sizes.width * 0.1,
							fontWeight: 'bold',
						}}
					/>
				</SpineSlot>
			</SpineProvider>
		{/snippet}
	</FreeSpinAnimation>
</FadeContainer>
