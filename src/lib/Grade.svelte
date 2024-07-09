<script lang="ts">
	import { type Probe } from '$lib';

	export let probes: Probe[];
	$: grade = getGrade(probes);

	enum Grade {
		Up = 'Up',
		Spotty = 'Spotty',
		Down = 'Down'
	}

	function getGrade(probes: Probe[]): Grade {
		if (probes.length === 0) {
			return Grade.Down;
		}

		let upCount = 0;
		let downCount = 0;

		for (const probe of probes) {
			if (probe.wasUp === true) {
				upCount++;
			} else {
				downCount++;
			}
		}

		if (upCount === 0) {
			return Grade.Down;
		}

		if (downCount === 0) {
			return Grade.Up;
		}

		return Grade.Spotty;
	}
</script>

<h2 class="grade heading">
	My internet is
	<span class={grade === Grade.Up ? 'up' : grade === Grade.Spotty ? 'spotty' : 'down'}>
		{#if grade === Grade.Up}
			Up 😎
		{:else if grade === Grade.Spotty}
			Spotty 😟
		{:else}
			Down 😟
		{/if}
	</span>
</h2>

<style>
	.up {
		color: var(--up-color);
	}

	.spotty {
		color: var(--spotty-color);
	}

	.down {
		color: var(--down-color);
	}

	.grade {
		text-align: center;
	}
</style>
