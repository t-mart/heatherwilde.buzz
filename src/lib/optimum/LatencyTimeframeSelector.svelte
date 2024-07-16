<script lang="ts">
  import { Timeframe } from '$lib';
  import { timeframeStore } from '$lib/timeframeStore';

  export let currentTimeframe: Timeframe;
</script>

<ol>
  {#each Timeframe.all() as timeframe}
    <li>
      <button
        class:link-button={currentTimeframe !== timeframe}
        disabled={currentTimeframe === timeframe}
        on:click={() => timeframeStore.set(timeframe)}
      >
        {timeframe.display}
      </button>
    </li>
  {/each}
</ol>

<style>
  ol {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    list-style-type: none;
    padding: 0;
    margin: 0;
    gap: 0 1rem;
  }

  button {
    margin-block-end: 0;
  }

  button[disabled] {
    color: var(--text-with-background-color);
    cursor: default;
  }
</style>
