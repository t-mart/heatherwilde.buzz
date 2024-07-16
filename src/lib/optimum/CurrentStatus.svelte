<script lang="ts">
	import { type Outage } from '$lib';

	export let outages: Outage[] | null;

	enum Status {
		Up = 'Up',
		Down = 'Down'
	}

	function getCurrentStatus(outages: Outage[]): Status {
		// if last outage in outages has a falsy end time, then we're down
		const lastOutage = outages[outages.length - 1];
		if (lastOutage?.endTime) {
			return Status.Up;
		}
		return Status.Down;
	}
</script>

<h2 class="line">
	<span>My internet is</span>
	{#if outages == null}
		<span class="status ghost"></span>
	{:else if getCurrentStatus(outages) === Status.Up}
		<span class="status up">Up 😎</span>
	{:else}
		<span class="status down">Down 😟</span>
	{/if}
</h2>

<style>
	.line {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: baseline;
		column-gap: 1rem;
		row-gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.status {
		color: var(--text-with-background-color);
		padding: 0.5rem 1.25rem;
		border-radius: var(--border-radius);
		text-shadow: 1px 1px rgba(0, 0, 0, 0.5);
		text-align: center;
	}

	.up {
		background-color: var(--up-color);
	}

	.down {
		background-color: var(--down-color);
	}

	.ghost {
		width: 8ch;
	}
</style>
