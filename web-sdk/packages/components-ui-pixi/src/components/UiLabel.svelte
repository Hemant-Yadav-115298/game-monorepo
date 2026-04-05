<script lang="ts">
	import { Text } from 'pixi-svelte';

	import UiSprite from './UiSprite.svelte';
	import { UI_BASE_FONT_SIZE } from '../constants';

	type Props = {
		label: string;
		value: string;
		tiled?: boolean;
		stacked?: boolean;
	};

	const props: Props = $props();

	const LABEL_BG_ROYAL = 0x2b0a5a;
	const LABEL_BG_VIOLET = 0x5b1aa8;
	const LABEL_BG_DARKEN = 0x14061f;
	const LABEL_BORDER_COLOR = 0xf7d77b;
	const LABEL_SHADOW_COLOR = 0x0c0412;
	const LABEL_TEXT_FILL = 0xf7d77b;
	const LABEL_TEXT_STROKE = 0x4a0f5c;
	const LABEL_FONT_FAMILY = 'Cinzel, Trajan Pro, proxima-nova, serif';
	const LABEL_RADIUS = 36;
	const LABEL_BORDER_WIDTH = 4;
	const LABEL_DROP_SHADOW = {
		dropShadow: true,
		dropShadowColor: 0x0d0414,
		dropShadowBlur: 3,
		dropShadowDistance: 2,
		dropShadowAngle: Math.PI / 2,
	} as const;

	const labelFontSize = UI_BASE_FONT_SIZE * 0.9;
	const valueFontSize = UI_BASE_FONT_SIZE * 1.05;
	const textPaddingX = UI_BASE_FONT_SIZE * 1.2;
	const textPaddingY = UI_BASE_FONT_SIZE * 0.7;
	const textGap = UI_BASE_FONT_SIZE * 0.6;

	const measureTextWidth = (text: string, fontSize: number) =>
		Math.max(1, text.length) * fontSize * 0.56;

	const labelStyle = {
		fontFamily: LABEL_FONT_FAMILY,
		fontWeight: '700',
		letterSpacing: 1,
		fontSize: labelFontSize,
		fill: LABEL_TEXT_FILL,
		stroke: LABEL_TEXT_STROKE,
		strokeThickness: 3,
		...LABEL_DROP_SHADOW,
	} as const;

	const valueStyle = {
		fontFamily: LABEL_FONT_FAMILY,
		fontWeight: '800',
		letterSpacing: 0.5,
		fontSize: valueFontSize,
		fill: LABEL_TEXT_FILL,
		stroke: LABEL_TEXT_STROKE,
		strokeThickness: 3,
		...LABEL_DROP_SHADOW,
	} as const;

	const labelTextWidth = $derived(measureTextWidth(props.label, labelFontSize));
	const valueTextWidth = $derived(measureTextWidth(props.value, valueFontSize));
	const stackedWidth = $derived(Math.max(labelTextWidth, valueTextWidth) + textPaddingX * 2);
	const stackedHeight = $derived(labelFontSize + valueFontSize + textPaddingY * 2);
	const inlineWidth = $derived(labelTextWidth + valueTextWidth + textGap + textPaddingX * 2);
	const inlineHeight = $derived(Math.max(labelFontSize, valueFontSize) + textPaddingY * 2);
</script>

{#if props.stacked}
	{#if props.tiled}
		<UiSprite
			y={-14}
			x={4}
			anchor={{ x: 0.5, y: 0 }}
			width={stackedWidth}
			height={stackedHeight}
			borderRadius={LABEL_RADIUS}
			backgroundColor={LABEL_SHADOW_COLOR}
			alpha={0.65}
		/>
		<UiSprite
			y={-18}
			anchor={{ x: 0.5, y: 0 }}
			width={stackedWidth}
			height={stackedHeight}
			borderRadius={LABEL_RADIUS}
			backgroundColor={LABEL_BG_ROYAL}
			borderWidth={LABEL_BORDER_WIDTH}
			borderColor={LABEL_BORDER_COLOR}
		/>
		<UiSprite
			y={-15}
			anchor={{ x: 0.5, y: 0 }}
			width={stackedWidth}
			height={stackedHeight * 0.55}
			borderRadius={LABEL_RADIUS}
			backgroundColor={LABEL_BG_VIOLET}
			alpha={0.7}
		/>
		<UiSprite
			y={-18 + stackedHeight * 0.5}
			anchor={{ x: 0.5, y: 0 }}
			width={stackedWidth}
			height={stackedHeight * 0.5}
			borderRadius={LABEL_RADIUS}
			backgroundColor={LABEL_BG_DARKEN}
			alpha={0.25}
		/>
	{/if}
	<Text anchor={{ x: 0.5, y: 0 }} text={props.label} style={labelStyle} y={textPaddingY * 0.2} />
	<Text
		anchor={{ x: 0.5, y: 0 }}
		text={props.value}
		style={valueStyle}
		y={labelFontSize + textPaddingY * 0.45}
	/>
{:else}
	{#if props.tiled}
		<UiSprite
			x={-inlineWidth * 0.5 + 4}
			y={4}
			anchor={{ x: 0, y: 0.5 }}
			width={inlineWidth}
			height={inlineHeight}
			borderRadius={LABEL_RADIUS}
			backgroundColor={LABEL_SHADOW_COLOR}
			alpha={0.65}
		/>
		<UiSprite
			x={-inlineWidth * 0.5}
			anchor={{ x: 0, y: 0.5 }}
			width={inlineWidth}
			height={inlineHeight}
			borderRadius={LABEL_RADIUS}
			backgroundColor={LABEL_BG_ROYAL}
			borderWidth={LABEL_BORDER_WIDTH}
			borderColor={LABEL_BORDER_COLOR}
		/>
		<UiSprite
			x={-inlineWidth * 0.5}
			anchor={{ x: 0, y: 0.5 }}
			width={inlineWidth}
			height={inlineHeight * 0.55}
			borderRadius={LABEL_RADIUS}
			backgroundColor={LABEL_BG_VIOLET}
			alpha={0.7}
		/>
		<UiSprite
			x={-inlineWidth * 0.5}
			y={inlineHeight * 0.25}
			anchor={{ x: 0, y: 0.5 }}
			width={inlineWidth}
			height={inlineHeight * 0.5}
			borderRadius={LABEL_RADIUS}
			backgroundColor={LABEL_BG_DARKEN}
			alpha={0.25}
		/>
	{/if}
	<Text
		anchor={{ x: 0, y: 0.5 }}
		text={props.label}
		style={labelStyle}
		x={-inlineWidth * 0.5 + textPaddingX}
	/>
	<Text
		anchor={{ x: 1, y: 0.5 }}
		text={props.value}
		style={valueStyle}
		x={inlineWidth * 0.5 - textPaddingX}
	/>
{/if}
