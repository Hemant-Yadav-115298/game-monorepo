<script lang="ts" module>
	export type EmitterEventHoldAndSpinFrame =
		| { type: 'holdAndSpinFrameShow' }
		| { type: 'holdAndSpinFrameHide' };
</script>

<script lang="ts">
	import { FadeContainer } from 'components-pixi';
	import { getContext } from '../game/context';
	import { Sprite } from 'pixi-svelte';

	const context = getContext();
	let show = $state(false);

	context.eventEmitter.subscribeOnMount({
		holdAndSpinFrameShow: () => (show = true),
		holdAndSpinFrameHide: () => (show = false),
	});

	const boardLayout = $derived(context.stateGameDerived.boardLayout());
</script>

<FadeContainer {show} x={boardLayout.x} y={boardLayout.y} pivot={boardLayout.pivot}>
	<!-- Iron frame overlay placeholder - using a tinted sprite or similar -->
	<Sprite 
        key="reelsFrame" 
        width={boardLayout.width + 20} 
        height={boardLayout.height + 20} 
        tint={0x666666} 
        anchor={0.5}
    />
</FadeContainer>
