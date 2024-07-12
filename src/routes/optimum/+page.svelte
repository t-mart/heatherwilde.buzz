<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { type Outage, type Probe, type APIOutage } from '$lib';
	import CurrentStatus from '$lib/optimum/CurrentStatus.svelte';
	import OutagesTimeline from '$lib/optimum/OutagesTimeline.svelte';
	import OutagesHistory from '$lib/optimum/OutagesHistory.svelte';
	import Latency from '$lib/optimum/Latency.svelte';
	import { Duration, DateTime } from 'luxon';

	let outages: Outage[] | null = null;
	let probes: Probe[] | null = null;
	let error: string | null = null;
	const fetchIntervalDuration = Duration.fromObject({ minutes: 1 }); // 1 minutes

	async function fetchEndpoint<T>(path: string): Promise<T[]> {
		const response = await fetch(path);
		if (!response.ok) {
			throw new Error(`Unable to fetch enpoint ${path}: ${response.status} ${response.statusText}`);
		}
		return <T[]>await response.json();
	}

	async function fetchData() {
		outages = (await fetchEndpoint<APIOutage>('/api/optimum-outages')).map((outage) => ({
			startTime: DateTime.fromISO(outage.startTime),
			endTime: outage.endTime ? DateTime.fromISO(outage.endTime) : null
		}));
		probes = await fetchEndpoint('/api/optimum-latency');
	}

	onMount(fetchData);

	const interval = setInterval(fetchData, fetchIntervalDuration.toMillis());
	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<svelte:head>
	<title>Heatherwilde Optimum Internet Monitor - heatherwilde.buzz</title>
</svelte:head>

<h1 class="heading">Heatherwilde Optimum Internet Monitor</h1>

<div class="internet">
	{#if error}
		<p>Error: {error}</p>
	{:else if outages}
		{#if outages.length > 0}
			<CurrentStatus {outages} />
			<OutagesTimeline {outages} />
			<Latency />
			<OutagesHistory {outages} />
		{:else}
			<p>No data</p>
		{/if}
	{:else}
		<p>Loading...</p>
	{/if}
</div>

<h3 class="heading">What is this?</h3>

<p>
	Optimum provides my home Internet service. There's been a lot of downtime
	lately and, as any concerned customer should, I'm keeping track.
</p>

<p>
	These graphs measure an external host's ability to communicate with
	my home network over time.
</p>

<p>
	You may find this useful if your Optimum internet doesn't seem to be
	working, and want know if its just you or not. Better yet, you can <a
	href="https://www.optimum.net/support/contact-us/">call</a> to report so
	with this data to back you up!
</p>

<p>
	<em>This data may not be accurate:</em> Any computer network, especially at
	home, is subject to bandwidth constraints, bugs, power outages, or a
	multitude of other issues that may not be caused by Optimum. I will
	occasionally curate this data to remove any false positives that were under
	my control.
</p>
