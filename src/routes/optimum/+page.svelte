<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { type Outage, type Probe, type APIOutage, type APIProbe, Timeframe } from '$lib';
	import CurrentStatus from '$lib/optimum/CurrentStatus.svelte';
	import OutagesTimeline from '$lib/optimum/OutagesTimeline.svelte';
	import OutagesHistory from '$lib/optimum/OutagesHistory.svelte';
	import Latency from '$lib/optimum/Latency.svelte';
	import { Duration, DateTime } from 'luxon';
	import { offset, flip, shift } from 'svelte-floating-ui/dom';
	import { createFloatingActions } from 'svelte-floating-ui';

	let outages: Outage[] | null = null;
	let probes: Probe[] | null = null;
	let error: string | null = null;
	let currentTimeframe = Timeframe.DAY;
	const fetchIntervalDuration = Duration.fromObject({ minutes: 1 }); // 1 minutes
	const probesCache = new Map<Timeframe, { accessed: DateTime; probes: Probe[] }>();
	const probesCacheExpiration = fetchIntervalDuration;

	async function fetchEndpoint<T>(path: string): Promise<T[]> {
		const response = await fetch(path);
		if (!response.ok) {
			throw new Error(`Unable to fetch enpoint ${path}: ${response.status} ${response.statusText}`);
		}
		return <T[]>await response.json();
	}

	async function fetchOutages() {
		try {
			outages = (await fetchEndpoint<APIOutage>('/api/optimum/outages')).map((outage) => ({
				startTime: DateTime.fromISO(outage.startTime),
				endTime: outage.endTime ? DateTime.fromISO(outage.endTime) : null
			}));
		} catch (error) {
			console.error(error);
			outages = null;
			error = 'Unable to fetch outages';
		}
	}

	/**
	 * Fetches the probes from the API and caches them. We do caching here to address pathological
	 * clicking of the timeframe buttons.
	 */
	async function fetchProbes() {
		// check if the probes are in the cache
		const cachedProbes = probesCache.get(currentTimeframe);
		if (cachedProbes && cachedProbes.accessed > DateTime.now().minus(probesCacheExpiration)) {
			// cache hit
			probes = cachedProbes.probes;
			return;
		}

		try {
			probes = (
				await fetchEndpoint<APIProbe>(
					`/api/optimum/latency?timeframe=${currentTimeframe.searchParam}`
				)
			).map((probe) => ({
				time: DateTime.fromISO(probe.time),
				duration: probe.duration
			}));
		} catch (error) {
			console.error(error);
			probes = null;
			error = 'Unable to fetch probes';
		}

		// cache the probes
		probesCache.set(currentTimeframe, { accessed: DateTime.now(), probes: probes! });
	}

	async function fetchAll() {
		await fetchOutages();
		await fetchProbes();
	}

	async function handleProbeTimeframeChange(event: CustomEvent<Timeframe>) {
		// fail fast if the timeframe hasn't changed
		if (event.detail === currentTimeframe) return;

		currentTimeframe = event.detail;
		await fetchProbes();
	}

	onMount(async () => {
		await fetchAll();
	});

	const interval = setInterval(fetchAll, fetchIntervalDuration.toMillis());
	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Heatherwilde Optimum Internet Monitor - heatherwilde.buzz</title>
</svelte:head>

<h1>Heatherwilde Optimum Internet Monitor</h1>

<div>
	{#if error}
		<p>Error: {error}</p>
	{:else if outages && probes}
		{#if outages.length > 0 && probes.length > 0}
			<CurrentStatus {outages} />
			<OutagesTimeline {outages} />
			<Latency
				{probes}
				{currentTimeframe}
				on:timeframeChange={handleProbeTimeframeChange}
			/>
			<OutagesHistory {outages} />
		{:else}
			<p>No data</p>
		{/if}
	{:else}
		<p>Loading...</p>
	{/if}
</div>

<h3>What is this?</h3>

<p>
	Optimum provides my home Internet service. There's been a lot of downtime lately and, as any
	concerned customer should, I'm keeping track.
</p>

<p>
	These graphs measure an external host's ability to communicate with my home network over time.
</p>

<p>
	You may find this useful if your Optimum internet doesn't seem to be working, and want know if its
	just you or not. Better yet, you can <a href="https://www.optimum.net/support/contact-us/">call</a
	> to report so with this data to back you up!
</p>

<p>
	<em>This data may not be accurate:</em> Any computer network, especially at home, is subject to bandwidth
	constraints, bugs, power outages, or a multitude of other issues that may not be caused by Optimum.
	I will occasionally curate this data to remove any false positives that were under my control.
</p>
