<script lang="ts">
	import { type Incident } from '$lib';

	export let incidents: Incident[];
	$: status = getCurrentStatus(incidents);

	enum Status {
		Up = 'Up',
		Down = 'Down'
	}

	function getCurrentStatus(incidents: Incident[]): Status {
		// if last incident in incidents has a falsy end time, then we're down
		const lastIncident = incidents[incidents.length - 1];
		if (lastIncident.endTime) {
			return Status.Up;
		}
		return Status.Down;
	}
</script>

<h2 class="line">
	<span>My internet is</span>
	<span class="status" class:down={status == Status.Down}>
		{#if status === Status.Up}
			Up 😎
		{:else}
			Down 😟
		{/if}
	</span>
</h2>

<style>
	.line {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: baseline;
		column-gap: 1rem;
		row-gap: 0.5rem;
	}

	.status {
		background-color: var(--up-color);
		color: var(--text-with-background-color);
		padding: 0.5rem 1.25rem;
		border-radius: 0.25rem;
		text-shadow: 1px 1px rgba(0, 0, 0, 0.5);
		text-align: center;
	}

	.status.down {
		background-color: var(--down-color);
	}
</style>
