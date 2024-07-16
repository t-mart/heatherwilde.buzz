<script lang="ts">
  import { type Outage } from '$lib';
  import { formatDateAndTime } from '$lib/format';
  import { DateTime, Interval, Duration } from 'luxon';

  const millisecondsInMinute = 1000 * 60;
  export let outages: Outage[] | null;

  $: outageHistoryItems =
    outages
      ?.slice()
      .sort((a, b) => b.startTime.toMillis() - a.startTime.toMillis())
      .map(getOutageHistoryItem) ?? null;

  type OutageHistoryItem = {
    startTime: string;
    duration: string;
    ongoing: boolean;
  };

  function getOutageHistoryItem(outage: Outage): OutageHistoryItem {
    const startTime = formatDateAndTime(outage.startTime, true);
    // luxon's toHuman doesn't do rounding nicely. see the comments on this
    // popular issue: https://github.com/moment/luxon/issues/1134. here, we
    // just clear out the milliseconds and seconds. this is a hack.
    const roundedDurationMillis = Math.max(
      Math.floor(
        Interval.fromDateTimes(outage.startTime, outage.endTime ?? DateTime.now())
          .toDuration()
          .toMillis() / millisecondsInMinute
      ) * millisecondsInMinute,
      millisecondsInMinute // at least one minute, because we've just cleared them out
    );
    const duration = Duration.fromMillis(roundedDurationMillis).rescale().toHuman();
    const ongoing = !outage.endTime;
    return { startTime, duration, ongoing };
  }
</script>

<div class="container">
  <div class="heading">
    <h3>Outage History</h3>
    <a href="/api/optimum-outages">Download JSON</a>
  </div>

  <ol class="items">
    {#if !outageHistoryItems}
      <li class="ghost" />
      <li class="ghost" />
    {:else}
      {#each outageHistoryItems as outage}
        <li>
          {#if outage.ongoing}<span class="ongoing">⚠️ Ongoing</span>{/if}
          <time>{outage.startTime}</time> - {outage.duration}
        </li>
      {/each}
    {/if}
  </ol>
</div>

<style>
  .container {
    margin-bottom: 2rem;
  }

  .items {
    list-style-type: disc;
  }

  .ongoing {
    color: var(--down-color);
  }

  .heading {
    display: flex;
    gap: 1rem;
    align-items: baseline;
    flex-wrap: wrap;
    margin-bottom: 1em;
  }

  .heading > * {
    margin-bottom: 0;
  }
</style>
