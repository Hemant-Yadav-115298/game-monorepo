<script lang="ts">
	import { Sprite } from 'pixi-svelte';
	import { Tween } from 'svelte/motion';

	type Props = {
		x: number;
		y: number;
		sizes: { width: number; height: number };
		isSpin: boolean;
		hovered: boolean;
		pressed: boolean;
		disabled?: boolean;
	};

	const props: Props = $props();
	const FADE_DURATION_MS = 160;
	const spinInitialAlpha = new Tween(1);
	const spinHoverAlpha = new Tween(0);
	const spinActiveAlpha = new Tween(0);
	const stopInitialAlpha = new Tween(0);
	const stopHoverAlpha = new Tween(0);
	const stopActiveAlpha = new Tween(0);

	const targetState = $derived(props.pressed ? 'active' : props.hovered ? 'hover' : 'initial');
	const disabledAlpha = $derived(props.disabled ? 0.5 : 1);

	const updateSpriteAlphas = (target: {
		isSpin: boolean;
		state: 'initial' | 'hover' | 'active';
	}) => {
		if (target.isSpin) {
			spinInitialAlpha.set(target.state === 'initial' ? 1 : 0, {
				duration: FADE_DURATION_MS,
			});
			spinHoverAlpha.set(target.state === 'hover' ? 1 : 0, {
				duration: FADE_DURATION_MS,
			});
			spinActiveAlpha.set(target.state === 'active' ? 1 : 0, {
				duration: FADE_DURATION_MS,
			});
			stopInitialAlpha.set(0, { duration: FADE_DURATION_MS });
			stopHoverAlpha.set(0, { duration: FADE_DURATION_MS });
			stopActiveAlpha.set(0, { duration: FADE_DURATION_MS });
			return;
		}

		stopInitialAlpha.set(target.state === 'initial' ? 1 : 0, {
			duration: FADE_DURATION_MS,
		});
		stopHoverAlpha.set(target.state === 'hover' ? 1 : 0, {
			duration: FADE_DURATION_MS,
		});
		stopActiveAlpha.set(target.state === 'active' ? 1 : 0, {
			duration: FADE_DURATION_MS,
		});
		spinInitialAlpha.set(0, { duration: FADE_DURATION_MS });
		spinHoverAlpha.set(0, { duration: FADE_DURATION_MS });
		spinActiveAlpha.set(0, { duration: FADE_DURATION_MS });
	};

	$effect(() => {
		updateSpriteAlphas({ isSpin: props.isSpin, state: targetState });
	});
</script>

<Sprite
	x={props.x}
	y={props.y}
	anchor={0.5}
	width={props.sizes.width}
	height={props.sizes.height}
	alpha={spinInitialAlpha.current * disabledAlpha}
	key="spin_initial"
/>
<Sprite
	x={props.x}
	y={props.y}
	anchor={0.5}
	width={props.sizes.width}
	height={props.sizes.height}
	alpha={spinHoverAlpha.current * disabledAlpha}
	key="spin_hover"
/>
<Sprite
	x={props.x}
	y={props.y}
	anchor={0.5}
	width={props.sizes.width}
	height={props.sizes.height}
	alpha={spinActiveAlpha.current * disabledAlpha}
	key="spin_active"
/>
<Sprite
	x={props.x}
	y={props.y}
	anchor={0.5}
	width={props.sizes.width}
	height={props.sizes.height}
	alpha={stopInitialAlpha.current * disabledAlpha}
	key="stop_initial"
/>
<Sprite
	x={props.x}
	y={props.y}
	anchor={0.5}
	width={props.sizes.width}
	height={props.sizes.height}
	alpha={stopHoverAlpha.current * disabledAlpha}
	key="stop_hover"
/>
<Sprite
	x={props.x}
	y={props.y}
	anchor={0.5}
	width={props.sizes.width}
	height={props.sizes.height}
	alpha={stopActiveAlpha.current * disabledAlpha}
	key="stop_active"
/>
