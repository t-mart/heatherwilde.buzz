<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { type APIProbe, type Probe, toProbe } from '$lib';
	import Grade from '$lib/Grade.svelte';
	import LinePlot from '$lib/LinePlot.svelte';
	import { PUBLIC_DATA_URL } from '$env/static/public';
	import { Duration, DateTime } from 'luxon';

	let probes: Probe[] = [];
	let error: string | null = null;
	const fetchIntervalDuration = Duration.fromObject({ minutes: 1 }); // 1 minutes

	async function fetchProbes() {
		try {
			const response = await fetch(PUBLIC_DATA_URL);
			if (!response.ok) {
				throw new Error('Unable to fetch probe list');
			}
			probes = (<APIProbe[]>await response.json()).map((apiProbe) => toProbe(apiProbe));
		} catch (err) {
			error = (err as Error).message;
		}
	}

	onMount(fetchProbes);

	const interval = setInterval(fetchProbes, fetchIntervalDuration.toMillis());
	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<svelte:head>
	<title>My Optimum Internet - heatherwilde.buzz</title>
</svelte:head>

<div class="internet">
	{#if error}
		<p>Error: {error}</p>
	{:else if probes}
		{#if probes.length > 0}
			<Grade {probes} />
			<LinePlot {probes} />
		{:else}
			<p>No probes in data</p>
		{/if}
	{:else}
		<p>Loading...</p>
	{/if}

	<!-- TODO: Remove this development stuff -->
	{#if process.env.NODE_ENV === 'development'}
		{@const showProbesCount = 10}
		<div style="font-family: sans-serif">
			<button
				on:click={() =>
					(probes = [
						...probes,
						{
							datetime: DateTime.now(),
							wasUp: Math.random() > 0.5
						}
					])}>Add random probe</button
			>
			<button
				on:click={() =>
					(probes = [
						...probes,
						{
							datetime: DateTime.now(),
							wasUp: true
						}
					])}>Add up probe</button
			>
			<button
				on:click={() =>
					(probes = [
						...probes,
						{
							datetime: DateTime.now(),
							wasUp: false
						}
					])}>Add down probe</button
			>
			<button
				on:click={() => {
					probes = [];
				}}>Clear probes</button
			>
			<p>First {showProbesCount} of {probes.length} probes</p>
			<ol reversed>
				{#each probes
					.sort((a, b) => a.datetime.toMillis() - b.datetime.toMillis())
					.slice(-showProbesCount) as probe}
					<li>{probe.datetime.toISO()} - {probe.wasUp ? 'Up' : 'Down'}</li>
				{/each}
			</ol>
		</div>
	{/if}
</div>

<style>
	.internet {
		display: flex;
		flex-direction: column;
		/* center all children */
		align-items: center;
		gap: 1rem;
	}
</style>
