<!--
  this component exists to facilitate loading the latency graph. i tried to
  make it dynamic based on probes being null or not, but there's too many
  internal dependencies.
-->
<script lang="ts">
  import type { Probe, Timeframe } from '$lib';
  import Latency from '$lib/optimum/Latency.svelte';
  import GraphPanel from '$lib/optimum/GraphPanel.svelte';

  export let probes: Probe[] | null;
  export let currentTimeframe: Timeframe;
  export let heightPx: number = 135;
</script>

{#if probes === null}
  <GraphPanel title="Latency">
    <div slot="header-right" class="ghost ghost-header-right" />
    <div slot="main" class="ghost ghost-main" />
  </GraphPanel>
{:else}
  <Latency {probes} {currentTimeframe} {heightPx} />
{/if}

<style>
  .ghost-header-right {
    width: 20ch;
  }

  .ghost-main {
    height: 135px;
  }
</style>
