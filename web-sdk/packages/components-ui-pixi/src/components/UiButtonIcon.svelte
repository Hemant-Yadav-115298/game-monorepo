<script lang="ts">
	import { Sprite } from 'pixi-svelte';
	import { Tween } from 'svelte/motion';

	type Props = {
		x: number;
		y: number;
		sizes: { width: number; height: number };
		icon: 'autoSpin' | 'turbo' | 'increase' | 'decrease' | 'menu';
		active?: boolean;
		hovered: boolean;
		pressed: boolean;
		disabled?: boolean;
	};

	const props: Props = $props();
	const FADE_DURATION_MS = 160;
	const initialAlpha = new Tween(1);
	const hoverAlpha = new Tween(0);
	const activeAlpha = new Tween(0);

	const ICON_SPRITE_KEYS = {
		autoSpin: {
			initial: 'autospin_initial',
			hover: 'autospin_hover',
			active: 'autospin_active',
		},
		turbo: {
			initial: 'turbo_initial',
			hover: 'turbo_hover',
			active: 'turbo_active',
		},
		increase: {
			initial: 'increment_initial',
			hover: 'increment_hover',
			active: 'increment_active',
		},
		decrease: {
			initial: 'decrement_initial',
			hover: 'decrement_hover',
			active: 'decrement_active',
		},
		menu: {
			initial: 'menu_initial',
			hover: 'menu_hover',
			active: 'menu_active',
		},
	} as const;

	const ICON_SIZE_MULTIPLIERS = {
		increase: 0.9,
		decrease: 0.9,
		menu: 0.95,
		autoSpin: 1,
		turbo: 1,
	} as const;

	const sprite = $derived(ICON_SPRITE_KEYS[props.icon]);
	const spriteScale = $derived(ICON_SIZE_MULTIPLIERS[props.icon] ?? 1);
	const disabledAlpha = $derived(props.disabled ? 0.5 : 1);
	const targetState = $derived(
		props.active || props.pressed ? 'active' : props.hovered ? 'hover' : 'initial',
	);

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
	width={props.sizes.width * spriteScale}
	height={props.sizes.height * spriteScale}
	alpha={initialAlpha.current * disabledAlpha}
	key={sprite.initial}
/>
<Sprite
	x={props.x}
	y={props.y}
	anchor={0.5}
	width={props.sizes.width * spriteScale}
	height={props.sizes.height * spriteScale}
	alpha={hoverAlpha.current * disabledAlpha}
	key={sprite.hover}
/>
<Sprite
	x={props.x}
	y={props.y}
	anchor={0.5}
	width={props.sizes.width * spriteScale}
	height={props.sizes.height * spriteScale}
	alpha={activeAlpha.current * disabledAlpha}
	key={sprite.active}
/>
