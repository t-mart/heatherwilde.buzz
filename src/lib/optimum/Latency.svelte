<script lang="ts">
  import * as d3 from 'd3';
  import { onDestroy, onMount, createEventDispatcher } from 'svelte';

  import { type Probe, Timeframe } from '$lib';
  import { formatAxisDate, formatDuration } from '$lib/format';
  import { subscribeTooltipOwner } from '$lib/tooltipStore';
  import Tooltip from '$lib/Tooltip.svelte';
  import { setupTooltip } from '$lib/tooltip';
  import { createResizeStore } from '$lib/resizeStore';
  import { bucketProbes } from '$lib/bucketProbes';

  import OptimumGraphPanel from './GraphPanel.svelte';
  import LatencyTooltip from './LatencyTooltip.svelte';

  export let probes: Probe[] | null;
  export let currentTimeframe: Timeframe;

  type PlotData = {
    probes: Probe[];
    x: d3.ScaleTime<number, number, never>;
    y: d3.ScaleLinear<number, number, never>;
    line: d3.Line<Probe>;
  };
  // this is the client width of the SVG as well as the viewbox width
  // we use the same variable so that we can scale to the actual width of the element
  let svgClientWidth = 640;
  const height = 125;
  const marginTop = 10;
  const marginRight = 20;
  const marginBottom = 20;
  const marginLeft = 60;
  const cursorBisect = d3.bisector((d: Probe) => d.time.toJSDate());

  const dispatch = createEventDispatcher();

  let cursorProbe: Probe | null = null;
  const { tooltipReferenceAction, tooltipFloatingAction, tooltipArrowStore } = setupTooltip();
  const takeTooltip = subscribeTooltipOwner('latency', () => {
    cursorProbe = null;
  });

  let svgElement: SVGSVGElement;
  let gx: SVGGElement;
  let gy: SVGGElement;
  let plotData: PlotData | null;

  let unsubscribeResize: () => void;

  $: plotData = draw(probes, svgClientWidth);
  $: clearTooltipOnProbeChange(probes);

  /** dummy method to clear the tooltip because probe update will likely make it invalid */
  function clearTooltipOnProbeChange(_: any) {
    cursorProbe = null;
  }

  function draw(probes: Probe[] | null, width: number): PlotData | null {
    if (!probes) return null;
    // the 6 is arbitrary, but looks good. depends on width of the graph
    let bucketCount = Math.min(Math.floor(width / 6), probes.length);
    let probes_ = bucketProbes(probes, bucketCount);

    // i hate this. i have a bug somewhere in certain cases where the
    // buckets are not sorted. i can't figure it out. so i'm just going to
    // sort them here. sorting is critical for the bisector to work (to map
    // pointer event coords back to a probe)
    probes_.sort((a, b) => a.time.toMillis() - b.time.toMillis());

    let x = d3.scaleTime(d3.extent(probes_, (d) => d.time.toJSDate()) as [Date, Date], [
      marginLeft,
      width - marginRight
    ]);
    let y = d3.scaleLinear(d3.extent(probes_, (d) => d.duration) as [number, number], [
      height - marginBottom,
      marginTop
    ]);

    let line = d3.line<Probe>(
      (d) => x(d.time.toJSDate()),
      (d) => y(d.duration)
    );

    let gySelection = d3.select(gy);
    gySelection.call(
      d3
        .axisLeft(y)
        .ticks(3)
        .tickFormat((d) => formatDuration(d as number))
    );

    let gxSelection = d3.select(gx);
    let tickCount = Math.max(1, Math.floor(width / 100));
    gxSelection.call(d3.axisBottom<Date>(x).tickFormat(formatAxisDate).ticks(tickCount));

    return { probes: probes_, x, y, line };
  }

  function handleGraphPointerEvent(
    event: PointerEvent & {
      currentTarget: EventTarget & SVGRectElement;
    }
  ) {
    if (!plotData) return;
    const cursorFromTouch = event.pointerType === 'touch';
    switch (event.type) {
      case 'pointerenter':
      case 'pointermove':
        let pointerDate = plotData.x.invert(d3.pointer(event)[0]);
        let nearestIdx = cursorBisect.center(plotData.probes, pointerDate);
        cursorProbe = plotData.probes[nearestIdx];
        takeTooltip();
        break;

      case 'pointerout':
        if (!cursorFromTouch) {
          cursorProbe = null;
        }
        break;
    }
  }

  onMount(() => {
    const resizeStore = createResizeStore(svgElement);
    unsubscribeResize = resizeStore.subscribe(() => (svgClientWidth = svgElement.clientWidth));
  });

  onDestroy(() => {
    unsubscribeResize();
  });
</script>

<OptimumGraphPanel title="Latency">
  <ol slot="header-right" class="timeframe-selector">
    {#each Timeframe.all() as timeframe}
      <li>
        <button
          class:active={currentTimeframe === timeframe}
          class:link-button={currentTimeframe !== timeframe}
          disabled={currentTimeframe === timeframe}
          class="timeframe"
          on:click={() => {
            dispatch('timeframeChange', timeframe);
          }}
        >
          {timeframe.display}
        </button>
      </li>
    {/each}
  </ol>

  <svelte:fragment slot="main">
    <svg
      width="100%"
      class:not-ready={!plotData}
      bind:this={svgElement}
      viewBox={`0 0 ${svgClientWidth} ${height}`}
      preserveAspectRatio="none"
    >
      <g class="axis x-axis" bind:this={gx} transform="translate(0,{height - marginBottom})" />
      <g class="axis y-axis" bind:this={gy} transform="translate({marginLeft},0)" />
      {#if plotData}
        <path class="line" d={plotData.line(plotData.probes)} />
        {#if cursorProbe}
          <line
            class="cursor-line"
            x1={plotData.x(cursorProbe.time.toJSDate())}
            y1={marginTop}
            x2={plotData.x(cursorProbe.time.toJSDate())}
            y2={height - marginBottom}
            use:tooltipReferenceAction
          />
          <circle
            class="cursor-large-dot"
            cx={plotData.x(cursorProbe.time.toJSDate())}
            cy={plotData.y(cursorProbe.duration)}
            r="15"
          />
          <circle
            class="cursor-dot"
            cx={plotData.x(cursorProbe.time.toJSDate())}
            cy={plotData.y(cursorProbe.duration)}
            r="5"
          />
        {/if}
      {:else}
        <rect class="ghost" x="0" y="0" width={svgClientWidth} {height} rx="10" ry="10" />
      {/if}

      <!--
		always place this last to it renders on top, so pointer events work
		everywhere
		-->
      <rect
        class="cursor-space"
        x={marginLeft}
        y={marginTop}
        width={svgClientWidth - marginLeft - marginRight}
        height={height - marginBottom - marginTop}
        on:pointerenter={handleGraphPointerEvent}
        on:pointermove={handleGraphPointerEvent}
        on:pointerout={handleGraphPointerEvent}
        role="presentation"
      />
    </svg>

    {#if !plotData}
      <div class="ghost" />
    {/if}

    {#if cursorProbe}
      <Tooltip {tooltipFloatingAction} {tooltipArrowStore} onCloseFn={() => (cursorProbe = null)}>
        <LatencyTooltip probe={cursorProbe} />
      </Tooltip>
    {/if}
  </svelte:fragment>
</OptimumGraphPanel>

<style>
  /* ugly hack. we need the svg always on page because of complicated
  dependencies in this component. this mostly works fine, but is a quick flash
  of wrong-width content as the resize observer updates. */
  .not-ready {
    position: absolute;
    left: -9999px;
  }

  .ghost {
    height: 125px;
  }

  .cursor-space {
    touch-action: none;
    cursor: crosshair;
    fill: transparent;
  }

  .cursor-line {
    stroke: var(--non-data-color);
  }

  .cursor-dot {
    fill: var(--up-color);
    stroke: var(--text-color);
  }

  .cursor-large-dot {
    fill: hsl(from var(--up-color) h s l / 0.3);
  }

  .timeframe-selector {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    list-style-type: none;
    padding: 0;
    margin: 0;
    gap: 0 1rem;
  }

  .timeframe-selector li button[disabled] {
    color: var(--text-with-background-color);
    cursor: default;
  }

  .axis {
    /* font-size: 0.75rem; */
    color: var(--non-data-color);
  }

  /* global needed because text elements are added dynamically by d3, and
	svelte would otherwise cull from output */
  :global(.axis text) {
    font-size: 1rem;
  }

  .line {
    stroke: var(--up-color);
    stroke-width: 3px;
    fill: none;
  }
</style>
