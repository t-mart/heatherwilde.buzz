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

<div class="grade">
	My internet is
	<span class={grade === Grade.Up ? 'up' : grade === Grade.Spotty ? 'spotty' : 'down'}>
		{#if grade === Grade.Up}
			Up 😎
		{:else if grade === Grade.Spotty}
			Spotty 😟
		{:else}
			Down 😱
		{/if}
	</span>
</div>

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
		font-size: 2rem;
		font-weight: bold;
		font-family: 'ATNameSansDisplayTrial-Black', sans-serif;
	}
</style>
