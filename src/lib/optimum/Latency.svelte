<script lang="ts">
	import OptimumGraphPanel from './GraphPanel.svelte';
	import { type Probe, Timeframe } from '$lib';
	import * as d3 from 'd3';
	import axisTimeFormat from '$lib/axisTimeFormat';
	import { onDestroy, onMount, createEventDispatcher } from 'svelte';
	import onResize from '$lib/onResize';
	import bucketProbes from '$lib/bucketProbes';

	export let probes: Probe[];
	export let currentTimeframe: Timeframe;
	let width = 640;
	const height = 125;
	const marginTop = 10;
	const marginRight = 20;
	const marginBottom = 20;
	const marginLeft = 60;
	let svgElement: SVGSVGElement;
	let gx: SVGGElement;
	let gy: SVGGElement;
	let destroyResizeObserverFn: () => void;
	const dispatch = createEventDispatcher();
	let cursorProbe: Probe | null = null;
	const cursorBisect = d3.bisector((d: Probe) => d.time.toJSDate());

	type PlotData = {
		probes: Probe[];
		x: d3.ScaleTime<number, number, never>;
		y: d3.ScaleLinear<number, number, never>;
		line: d3.Line<Probe>;
	};
	let plotData: PlotData;

	function draw(probes: Probe[]): PlotData {
		// the 6 is arbitrary, but looks good. depends on width of the graph
		let bucketCount = Math.min(Math.floor(width / 6), probes.length);
		let probes_ = bucketProbes(probes, bucketCount);

		// i hate this. i have a bug somewhere in certain cases where the
		// buckets are not sorted. i can't figure it out. so i'm just going to
		// sort them here. sorting is critical for the bisector to work
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
		gxSelection.call(d3.axisBottom<Date>(x).tickFormat(axisTimeFormat).ticks(tickCount));

		return { probes: probes_, x, y, line };
	}

	function formatDuration(durationSeconds: number): string {
		if (durationSeconds < 1) {
			return `${(durationSeconds * 1000).toFixed(0)}ms`;
		}

		const durationStr = durationSeconds.toString();

		// Determine the necessary number of decimal places
		if (durationStr.includes('.')) {
			// Remove trailing zeros from the decimal part
			return `${parseFloat(durationStr)}s`;
		} else {
			// No decimal part
			return `${durationSeconds}s`;
		}
	}

	function updateWidth() {
		width = svgElement.clientWidth;
		plotData = draw(probes);
		cursorProbe = null;
	}

	function handleCursorMove(
		event: PointerEvent & {
			currentTarget: EventTarget & SVGRectElement;
		}
	) {
		event.currentTarget.setPointerCapture(event.pointerId);
		let pointerDate = plotData.x.invert(d3.pointer(event)[0]);
		let nearestIdx = cursorBisect.center(plotData.probes, pointerDate);
		cursorProbe = plotData.probes[nearestIdx];
	}

	onMount(() => {
		updateWidth();

		// Set up a resize observer. this is critical to make the SVG
		// responsive, otherwise, we get bad scaling behavior (lines/fonts will
		// be too big/small). Imagine switching orientation on a phone, or
		// resizing the window.
		destroyResizeObserverFn = onResize(svgElement, updateWidth).destroy;
	});

	$: plotData = draw(probes);

	onDestroy(() => {
		destroyResizeObserverFn();
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

	<svg
		slot="main"
		width="100%"
		bind:this={svgElement}
		viewBox={`0 0 ${width} ${height}`}
		preserveAspectRatio="none"
	>
		<g class="axis x-axis" bind:this={gx} transform="translate(0,{height - marginBottom})" />
		<g class="axis y-axis" bind:this={gy} transform="translate({marginLeft},0)" />
		<path class="line" d={plotData.line(plotData.probes)} />
		{#if cursorProbe}
			<line
				class="cursor-line"
				x1={plotData.x(cursorProbe.time.toJSDate())}
				y1={marginTop}
				x2={plotData.x(cursorProbe.time.toJSDate())}
				y2={height - marginBottom}
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

		<!-- always place this last to it renders on top, so mouseevents work everywhere -->
		<rect
			class="cursor-rect"
			x={marginLeft}
			y={0}
			width={width - marginLeft - marginRight}
			{height}
			on:pointermove={handleCursorMove}
			on:pointerenter={handleCursorMove}
			on:pointerout={() => {
				cursorProbe = null;
			}}
			role="presentation"
		/>
	</svg>
</OptimumGraphPanel>

<style>
	.cursor-rect {
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
