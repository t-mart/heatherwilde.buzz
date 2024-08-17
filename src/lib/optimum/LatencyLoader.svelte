<!--
  this component exists to facilitate loading the latency graph. i tried to
  make it dynamic based on probes being null or not, but there's too many
  internal dependencies.

  this is kinda hacky because we're making our own little mock graph panel.
-->
<script lang="ts">
  import type { Probe, Timeframe } from '$lib';
  import Latency from '$lib/optimum/Latency.svelte';
  import LatencyTimeframeSelector from '$lib/optimum/LatencyTimeframeSelector.svelte';
  import GraphPanel from '$lib/optimum/GraphPanel.svelte';

  export let probes: Probe[] | null;
  export let currentTimeframe: Timeframe;
  export let heightPx: number = 135;
</script>

{#if probes === null}
  <GraphPanel title="Latency">
    <div slot="header-right">
      <LatencyTimeframeSelector {currentTimeframe} />
    </div>
    <div slot="main" class="ghost ghost-main" style:height={`${heightPx}px`} />
  </GraphPanel>
{:else}
  <Latency {probes} {currentTimeframe} {heightPx} />
{/if}
