<script lang="ts">
  import { pointer } from 'd3';
  import { onDestroy, onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import { DateTime, Interval } from 'luxon';

  import { type Outage, type Day } from '$lib';
  import { createResizeStore } from '$lib/resizeStore';
  import { subscribeTooltipOwner } from '$lib/tooltipStore';
  import Tooltip from '$lib/Tooltip.svelte';
  import { setupTooltip } from '$lib/tooltip';
  import { PUBLIC_START_OF_SERVICE_DATE } from '$env/static/public';

  import OptimumGraphPanel from './GraphPanel.svelte';
  import OptimumOutagesTimelineTooltip from './OutagesTimelineTooltip.svelte';

  export let outages: Outage[] | null;

  const startOfService = DateTime.fromISO(PUBLIC_START_OF_SERVICE_DATE).startOf('day');

  let tooltipDay: Day | null = null;
  const { tooltipReferenceAction, tooltipFloatingAction, tooltipArrowStore } = setupTooltip();
  const takeTooltip = subscribeTooltipOwner('outages', () => {
    tooltipDay = null;
  });

  let dayCount: number = 90;
  const dayBarWidth = 3;
  const dayGapWidth = 2;
  const dayHeight = 26;
  const dayTotalWidth = dayBarWidth + dayGapWidth;
  $: svgWidth = dayCount * dayTotalWidth - dayGapWidth + 1; // remove the last gap
  $: days = makeDays(outages, dayCount);
  $: uptimePercentage = calculateUptime(outages, dayCount);
  $: clearTooltipOnOutageChange(outages);

  let unsubscribeDayCount: () => void;

  /** dummy method to clear the tooltip because outage update will likely make it invalid */
  function clearTooltipOnOutageChange(_: any) {
    tooltipDay = null;
  }

  function makeDays(outages: Outage[] | null, dayCount: number): Day[] | null {
    if (!outages) return null;
    // sort outages by property startTime, from earliest to latest
    outages = outages.sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis());

    const days: Day[] = [];
    const now = DateTime.now();
    const serviceInterval = Interval.fromDateTimes(startOfService, now);
    let curDate = now.startOf('day').minus({ days: dayCount - 1 });
    let curOutageIndex = 0;

    while (curDate <= now) {
      const curDay = {
        start: curDate,
        in_service: serviceInterval.contains(curDate),
        outages: []
      } as Day;

      const curDayInterval = Interval.fromDateTimes(curDate, curDate.plus({ days: 1 }));

      while (curOutageIndex < outages.length) {
        const curOutage = outages[curOutageIndex];
        const curOutageInterval = Interval.fromDateTimes(
          curOutage.startTime,
          curOutage.endTime ?? now
        );

        if (curOutageInterval.overlaps(curDayInterval)) {
          curDay.outages.push(curOutage);
          curOutageIndex++;
        } else {
          break;
        }
      }
      days.push(curDay);
      curDate = curDate.plus({ days: 1 });
    }

    return days;
  }

  function calculateUptime(outages: Outage[] | null, dayCount: number): number | null {
    if (!outages) return null;
    const start = DateTime.fromMillis(
      Math.max(startOfService.toMillis(), DateTime.now().minus({ days: dayCount }).toMillis())
    );
    const end = DateTime.now();
    const totalDuration = Interval.fromDateTimes(start, end).toDuration();
    let uptimeDuration = Interval.fromDateTimes(start, end).toDuration();
    outages.forEach((outage) => {
      const outageStartMin = DateTime.fromMillis(
        Math.max(outage.startTime.toMillis(), start.toMillis())
      );
      const outageDuration = Interval.fromDateTimes(
        outageStartMin,
        outage.endTime ?? DateTime.now()
      ).toDuration();
      uptimeDuration = uptimeDuration.minus(outageDuration);
    });

    return (uptimeDuration.toMillis() / totalDuration.toMillis()) * 100;
  }

  function dayId(index: number) {
    return `day-${index}`;
  }

  function handleGraphPointerEvent(
    event: PointerEvent & {
      currentTarget: EventTarget & SVGElement;
    }
  ) {
    if (!days) return;
    /*
		- pointerenter: find the day, show the tooltip
		- pointermove: find the day, show the tooltip
		- pointerout: if touch, do nothing. if mouse, hide the tooltip
		*/
    switch (event.type) {
      case 'pointerenter':
      case 'pointermove':
        const x = pointer(event)[0];
        const dayIndex = Math.floor(x / dayTotalWidth);
        if (dayIndex < 0 || dayIndex >= days.length) {
          tooltipDay = null;
        }
        takeTooltip();
        tooltipReferenceAction(
          event.currentTarget.querySelector(`#${dayId(dayIndex)}`) as SVGElement
        );
        tooltipDay = days[dayIndex];
        break;

      case 'pointerout':
        if (event.pointerType !== 'touch') {
          tooltipDay = null;
        }
        break;
    }
  }

  onMount(() => {
    const resizeStore = createResizeStore(document.documentElement);

    const dayCountStore = derived(resizeStore, () => {
      const viewportWidthVar = getComputedStyle(document.documentElement)
        .getPropertyValue('--viewport-width-name')
        .trim();
      return viewportWidthVar == 'large' ? 90 : viewportWidthVar == 'medium' ? 60 : 30;
    });
    unsubscribeDayCount = dayCountStore.subscribe((value) => {
      dayCount = value;
    });
  });

  onDestroy(() => {
    unsubscribeDayCount();
  });
</script>

<OptimumGraphPanel title="Outages">
  <svelte:fragment slot="main">
    {#if days && uptimePercentage}
      <!--
      no need to preseve aspect ratio. scaling doesn't really matter for rects
      in this presentation. we care more about being able to match the sizing
      when we ghost (during loading).
      -->
      <svg
        preserveAspectRatio="none"
        viewBox={`0 0 ${svgWidth} ${dayHeight}`}
        role="list"
        on:pointerenter={handleGraphPointerEvent}
        on:pointermove={handleGraphPointerEvent}
        on:pointerout={handleGraphPointerEvent}
      >
        {#each days as day, index}
          <rect
            id={dayId(index)}
            class:day={true}
            class:selected={day === tooltipDay}
            class={day.in_service
              ? day.outages.length > 0
                ? 'hasOutage'
                : 'noOutage'
              : 'outOfService'}
            width={dayBarWidth}
            height={dayHeight}
            y="0"
            x={index * dayTotalWidth}
          />
        {/each}
      </svg>
    {:else}
      <div class="ghost ghost-viz" />
    {/if}

    <div class="legend">
      <span>{dayCount} days ago</span>
      <div class="spacer" />
      {#if days && uptimePercentage}
        <span>{parseFloat(uptimePercentage.toFixed(2)).toString()}% uptime</span>
      {:else}
        <span class="ghost ghost-uptime" />
      {/if}
      <div class="spacer" />
      <span>Today</span>
    </div>

    {#if tooltipDay}
      <Tooltip {tooltipFloatingAction} {tooltipArrowStore} onCloseFn={() => (tooltipDay = null)}>
        <OptimumOutagesTimelineTooltip day={tooltipDay} />
      </Tooltip>
    {/if}
  </svelte:fragment>
</OptimumGraphPanel>

<style>
  .ghost-viz {
    height: 3rem;
  }

  .ghost-uptime {
    width: 10ch;
  }

  .hasOutage {
    fill: var(--down-color);
  }

  .hasOutage.selected {
    fill: var(--down-hover-color);
  }

  .noOutage {
    fill: var(--up-color);
  }

  .noOutage.selected {
    fill: var(--up-hover-color);
  }

  .outOfService {
    fill: var(--non-data-color);
  }

  .outOfService.selected {
    fill: var(--non-data-hover-color);
  }

  svg {
    width: 100%;
    height: 3rem;
    touch-action: none;
  }

  .legend {
    margin-block-start: 0.5rem;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    line-height: 1rem;
  }

  .spacer {
    flex: 1;
    height: 1px;
    background-color: var(--non-data-color);
  }
</style>
