<script lang="ts">
	import { Sprite } from 'pixi-svelte';
	import { Tween } from 'svelte/motion';

	type Props = {
		x: number;
		y: number;
		sizes: { width: number; height: number };
		active: boolean;
		hovered: boolean;
		pressed: boolean;
		disabled: boolean;
	};

	const props: Props = $props();
	const FADE_DURATION_MS = 160;
	const initialAlpha = new Tween(1);
	const hoverAlpha = new Tween(0);
	const activeAlpha = new Tween(0);

	const targetState = $derived(
		props.active || props.pressed ? 'active' : props.hovered ? 'hover' : 'initial',
	);
	const disabledAlpha = $derived(props.disabled ? 0.5 : 1);

	const updateSpriteAlphas = (target: 'initial' | 'hover' | 'active') => {
		initialAlpha.set(target === 'initial' ? 1 : 0, { duration: FADE_DURATION_MS });
		hoverAlpha.set(target === 'hover' ? 1 : 0, { duration: FADE_DURATION_MS });
		activeAlpha.set(target === 'active' ? 1 : 0, { duration: FADE_DURATION_MS });
	};

	$effect(() => {
		updateSpriteAlphas(targetState);
	});
</script>

<Sprite
	x={props.x}
	y={props.y}
	anchor={0.5}
	width={props.sizes.width}
	height={props.sizes.height}
	alpha={initialAlpha.current * disabledAlpha}
	key="buy_initial"
/>
<Sprite
	x={props.x}
	y={props.y}
	anchor={0.5}
	width={props.sizes.width}
	height={props.sizes.height}
	alpha={hoverAlpha.current * disabledAlpha}
	key="buy_hover"
/>
<Sprite
	x={props.x}
	y={props.y}
	anchor={0.5}
	width={props.sizes.width}
	height={props.sizes.height}
	alpha={activeAlpha.current * disabledAlpha}
	key="buy_active"
/>
