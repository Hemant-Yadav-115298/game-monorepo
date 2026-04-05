<script lang="ts">
	import { getContextApp } from 'pixi-svelte';

	const context = getContextApp();

	$effect(() => {
		const app = context.stateApp.pixiApplication;
		if (!app) return;

		// @ts-ignore
		globalThis.__PIXI_APP__ = app;
		// @ts-ignore
		globalThis.__PIXI_STAGE__ = app.stage;
		// @ts-ignore
		globalThis.__PIXI_RENDERER__ = app.renderer;
	});
</script>
