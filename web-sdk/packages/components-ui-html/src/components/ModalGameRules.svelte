<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Popup } from 'components-shared';
	import { zIndex } from 'constants-shared/zIndex';
	import { stateModal } from 'state-shared';

	import BaseContent from './BaseContent.svelte';
	import BaseScrollable from './BaseScrollable.svelte';

	type Props = {
		children: Snippet;
	};

	const props: Props = $props();
</script>

{#if stateModal.modal?.name === 'gameRules'}
	<Popup zIndex={zIndex.modal} onclose={() => (stateModal.modal = null)}>
		<BaseContent maxWidth="100%">
			<BaseScrollable type="column">
				<section>
					<h2>Hold &amp; Spin Feature</h2>
					<h3>Trigger Condition</h3>
					<p>6 or more Money symbols anywhere on screen.</p>

					<h3>Feature Rules</h3>
					<ul>
						<li>3 Respins.</li>
						<li>Any new Money symbol resets respins to 3.</li>
						<li>Symbols lock in place.</li>
						<li>Feature ends when respins reach 0.</li>
					</ul>

					<h3>Money Symbol Value Table (96% Example)</h3>
					<table>
						<thead>
							<tr>
								<th>Value</th>
								<th>Weight</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>1x</td>
								<td>40%</td>
							</tr>
							<tr>
								<td>2x</td>
								<td>25%</td>
							</tr>
							<tr>
								<td>3x</td>
								<td>15%</td>
							</tr>
							<tr>
								<td>5x</td>
								<td>10%</td>
							</tr>
							<tr>
								<td>10x</td>
								<td>6%</td>
							</tr>
							<tr>
								<td>20x</td>
								<td>2%</td>
							</tr>
							<tr>
								<td>50x</td>
								<td>0.5%</td>
							</tr>
							<tr>
								<td>Jackpot</td>
								<td>0.5%</td>
							</tr>
						</tbody>
					</table>

					<h3>Fixed Jackpot Structure</h3>
					<table>
						<thead>
							<tr>
								<th>Jackpot</th>
								<th>Value (x Bet)</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>MINI</td>
								<td>20x</td>
							</tr>
							<tr>
								<td>MINOR</td>
								<td>50x</td>
							</tr>
							<tr>
								<td>MAJOR</td>
								<td>200x</td>
							</tr>
							<tr>
								<td>GRAND</td>
								<td>1,000x (Full Grid)</td>
							</tr>
						</tbody>
					</table>

					<ul>
						<li>Jackpot embedded in Money symbols.</li>
						<li>If full grid (30 symbols) filled, GRAND auto-awarded.</li>
						<li>Jackpot values fixed (no progressive).</li>
					</ul>
				</section>
				{@render props.children()}
			</BaseScrollable>
		</BaseContent>
	</Popup>
{/if}
