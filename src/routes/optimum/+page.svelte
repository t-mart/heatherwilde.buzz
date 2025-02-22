<script lang="ts">
  import { onMount } from 'svelte';
  import { type Outage, type Probe, type APIOutage, type APIProbe, Timeframe } from '$lib';
  import CurrentStatus from '$lib/optimum/CurrentStatus.svelte';
  import OutagesTimeline from '$lib/optimum/OutagesTimeline.svelte';
  import OutagesHistory from '$lib/optimum/OutagesHistory.svelte';
  import LatencyLoader from '$lib/optimum/LatencyLoader.svelte';
  import { timeframeStore } from '$lib/timeframeStore';
  import { Duration, DateTime } from 'luxon';

  let outages: Outage[] | null = null;
  let probes: Probe[] | null = null;
  let error: string | null = null;
  let currentTimeframe = $timeframeStore;
  const refetchIntervalDuration = Duration.fromObject({ minutes: 5 });
  const probesCache = new Map<Timeframe, { accessed: DateTime; probes: Probe[] }>();
  const probesCacheExpiration = refetchIntervalDuration;

  async function fetchEndpoint<T>(path: string): Promise<T[]> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Unable to fetch enpoint ${path}: ${response.status} ${response.statusText}`);
    }
    return await response.json();
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

  function fetchAll() {}

  onMount(() => {
    const unsub = timeframeStore.subscribe((timeframe) => {
      if (timeframe !== currentTimeframe) {
        probes = null;
        currentTimeframe = timeframe;
        fetchProbes();
      }
    });

    fetchOutages();
    fetchProbes();

    const interval = setInterval(fetchAll, refetchIntervalDuration.toMillis());
    return () => {
      unsub();
      clearInterval(interval);
    };
  });
</script>

<svelte:head>
  <title>Heatherwilde Optimum Internet Monitor - heatherwilde.buzz</title>
</svelte:head>

<h1>Heatherwilde Optimum Internet Monitor</h1>

<div>
  {#if error}
    <p>Error: {error}</p>
  {:else}
    <CurrentStatus {outages} />
    <OutagesTimeline {outages} />
    <LatencyLoader {probes} {currentTimeframe} />
    <OutagesHistory {outages} />
  {/if}
</div>

<h3>What is this?</h3>

<p>
  Optimum is Heatherwilde's <a
    href="https://broadbandmap.fcc.gov/location-summary/fixed?lon=-97.635719&lat=30.45961&vlon=-97.635366&vlat=30.460263"
    >only high-speed Internet service provider</a
  >. There's been a lot of downtime lately and I'm keeping track, as any concerned customer should.
</p>

<p>
  These graphs measure an external host's ability to communicate with my home network over time. In
  other words, it asks "Is our Internet working well, if at all?".
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
