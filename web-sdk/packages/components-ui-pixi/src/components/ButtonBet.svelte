<script lang="ts">
	import { Button, type ButtonProps } from 'components-pixi';
	import { OnHotkey } from 'components-shared';
	import { stateBetDerived } from 'state-shared';

	import ButtonBetProvider from './ButtonBetProvider.svelte';
	import ButtonBetIcon from './ButtonBetIcon.svelte';
	import { UI_BASE_SIZE } from '../constants';

	const props: Partial<Omit<ButtonProps, 'children'>> = $props();
	const disabled = $derived(!stateBetDerived.isBetCostAvailable());
	const sizes = { width: UI_BASE_SIZE, height: UI_BASE_SIZE };
</script>

<ButtonBetProvider>
	{#snippet children({ key, onpress })}
		<OnHotkey hotkey="Space" {disabled} {onpress} />
		<Button {...props} {sizes} {onpress} {disabled}>
			{#snippet children({ center, hovered, pressed })}
				{@const isSpin = ['spin_default', 'spin_disabled'].includes(key)}
				{@const isDisabledState = ['spin_disabled', 'stop_disabled'].includes(key)}
				<ButtonBetIcon
					x={center.x}
					y={center.y}
					sizes={sizes}
					{isSpin}
					hovered={hovered}
					pressed={pressed}
					disabled={disabled || isDisabledState}
				/>
			{/snippet}
		</Button>
	{/snippet}
</ButtonBetProvider>
