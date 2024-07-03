<script lang="ts">
	import * as d3 from 'd3';
	import { type Probe } from '$lib';
	import { multiFormat } from '$lib/timeFormat';
	import { Interval, Duration } from 'luxon';
	import { onDestroy, onMount } from 'svelte';

	export let probes: Probe[];
	export let redrawIntervalDuation = Duration.fromObject({ seconds: 10 });
	const width = 640;
	const height = 300;
	const marginTop = 20;
	const marginRight = 20;
	const marginBottom = 90;
	const marginLeft = 80;
	const yAxisPadding = 30;
	const xAxisLeftPadding = 30;
	let svgElement: SVGSVGElement;
	let gx: SVGGElement;
	let gy: SVGGElement;

	function probeWasUpString(probe: Probe): 'Up' | 'Down' {
		return probe.wasUp ? 'Up' : 'Down';
	}

	/**
	 * Reduce the number of probes to a given count. Merging of probes is done by
	 * always taking the latest datetime and setting the wasUp flag to false if any
	 * probe was down.
	 *
	 * This is useful to reduce the number of data points to display in a line plot,
	 * which can be overcrowded with too many data points.
	 * @param probes The probes to reduce
	 * @param count The number of probes to reduce to
	 */
	function reduce(probes: Probe[], count: number): Probe[] {
		// first, sort ascending: not only will this ensure the probes are fed
		// to the d3.line function correctly, but we can also get min and max
		// datetime values easily
		probes = probes.sort((a, b) => a.datetime.toMillis() - b.datetime.toMillis());
		let start = probes[0].datetime;
		/// add 1 millisecond to the end to make sure the last probe is included
		/// because intervals are start-inclusive, but end-exclusive
		let end = probes[probes.length - 1].datetime.plus({ milliseconds: 1 });
		let intervals = Interval.fromDateTimes(start, end).divideEqually(count);
		let curIntervalIndex = 0;
		let curProbeIndex = 0;
		let curProbe: Probe | null = null;
		let reduced: Probe[] = [];

		while (curProbeIndex < probes.length) {
			while (
				curProbeIndex < probes.length &&
				intervals[curIntervalIndex].contains(probes[curProbeIndex].datetime)
			) {
				if (curProbe === null) {
					curProbe = { ...probes[curProbeIndex] };
				} else {
					// always take the latest datetime
					curProbe.datetime = probes[curProbeIndex].datetime;
					// if any probe was down, the entire reduced probe is down
					curProbe.wasUp &&= probes[curProbeIndex].wasUp;
				}
				curProbeIndex++;
			}
			if (curProbe !== null) {
				reduced.push(curProbe);
				curProbe = null;
			}
			curIntervalIndex++;
		}

		return reduced;
	}

	type PlotData = {
		buckets: Probe[];
		x: d3.ScaleTime<number, number, never>;
		y: d3.ScaleOrdinal<string, number, never>;
		line: d3.Line<Probe>;
	};
	let plotData: PlotData;

	function draw(probes: Probe[]): PlotData {
		let buckets = probes;

		/* Uncomment the following line to reduce the number of data points.
		Since writing this code, I've decided to keep all data points because I
		switched to publishing a manageable/readble number of probes. */
		// buckets = reduce(probes, reduceToCount);

		let x = d3.scaleTime(
			[d3.min(buckets.map((p) => p.datetime.toJSDate())) as Date, new Date()],
			[marginLeft + xAxisLeftPadding, width - marginRight]
		);
		let y = d3.scaleOrdinal(
			['Down', 'Up'],
			[height - marginBottom - yAxisPadding, marginTop + yAxisPadding]
		);
		let line = d3.line<Probe>(
			(d) => x(d.datetime.toJSDate()),
			(d) => y(probeWasUpString(d))
		);

		let gySelection = d3.select(gy);
		gySelection.call(d3.axisLeft<string>(y).tickPadding(5).tickSize(10));
		gySelection.selectAll('line').attr('stroke-width', '0.2rem');
		gySelection.selectAll('path').attr('stroke-width', '0.2rem');

		let gxSelection = d3.select(gx);
		gxSelection
			.call(d3.axisBottom<Date>(x).tickFormat(multiFormat).tickSize(10))
			.selectAll('text')
			.style('text-anchor', 'end')
			.attr('dx', '-1rem')
			.attr('dy', '.3rem')
			.attr('transform', 'rotate(-65)');
		gxSelection.selectAll('line').attr('stroke-width', '0.2rem');
		gxSelection.selectAll('path').attr('stroke-width', '0.2rem');
		return { buckets, x, y, line };
	}

	onMount(() => {
		plotData = draw(probes);
	});

	$: {
		plotData = draw(probes);
	}

	const interval = setInterval(() => {
		plotData = draw(probes);
	}, redrawIntervalDuation.toMillis());
	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<svg bind:this={svgElement} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMinYMin meet">
	<g class="axis x-axis" bind:this={gx} transform="translate(0,{height - marginBottom})" />
	<g class="axis y-axis" bind:this={gy} transform="translate({marginLeft},0)" />
	<path class="line" d={plotData.line(plotData.buckets)} />
	<g>
		{#each plotData.buckets as probe (probe.datetime)}
			<circle
				cx={plotData.x(probe.datetime.toJSDate())}
				cy={plotData.y(probeWasUpString(probe))}
				r="0.5rem"
				class:point={true}
				class:wasUp={probe.wasUp}
			/>
		{/each}
	</g>
</svg>

<style>
	svg {
		width: 100%;
		height: 100%;
	}

	.axis {
		font-size: 0.75rem;
		color: var(--non-data-color);
	}

	/* global needed because text elements are added dynamically by d3, and
	svelte would otherwise cull from output */
	:global(.axis text) {
		color: var(--non-data-color);
	}

	.line {
		stroke: var(--non-data-color);
		fill: none;
		stroke-width: 0.2rem;
		stroke-dasharray: 6, 2;
	}

	.point {
		stroke: none;
		fill: var(--down-color);
	}

	.point.wasUp {
		fill: var(--up-color);
	}
</style>
