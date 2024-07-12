<script lang="ts">
	import { type Outage, type Day } from '$lib';
	import OptimumOutagesTimelineTooltip from './OptimumOutagesTimelineTooltip.svelte';
	import { screenSizeStore } from '$lib/viewportWidthStore';
	import { onDestroy } from 'svelte';
	import { DateTime, Interval } from 'luxon';
	import { PUBLIC_START_OF_SERVICE_DATE } from '$env/static/public';
	import { computePosition, shift, flip, offset, arrow } from '@floating-ui/dom';

	let viewportWidthVar: string;
	export let outages: Outage[];
	const startOfService = DateTime.fromISO(PUBLIC_START_OF_SERVICE_DATE).startOf('day');
	let tooltipDay: Day | null = null;
	let tooltipElement: HTMLDivElement;
	let tooltipArrowElement: HTMLDivElement;

	$: dayCount = viewportWidthVar == 'large' ? 90 : viewportWidthVar == 'medium' ? 60 : 30;
	$: days = makeDays(dayCount, outages);
	$: uptimePercentage = calculateUptime(dayCount, outages);

	function makeDays(dayCount: number, outages: Outage[]): Day[] {
		// sort outages by property startTime, from earliest to latest
		outages = outages.sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis());

		const days: Day[] = [];
		const serviceInterval = Interval.fromDateTimes(startOfService, DateTime.now());
		const now = DateTime.now().startOf('day');
		let curDate = now.minus({ days: dayCount - 1 });

		while (curDate <= now) {
			const curInterval = Interval.fromDateTimes(curDate, curDate.plus({ days: 1 }));
			const in_service = serviceInterval.contains(curDate);
			// this is n^2, but it's fine for now
			const outagesForDay = outages.filter((outage) => {
				const outageInterval = Interval.fromDateTimes(outage.startTime, outage.endTime ?? now);
				return curInterval.overlaps(outageInterval);
			});
			days.push({ start: curDate, in_service, outages: outagesForDay });
			curDate = curDate.plus({ days: 1 });
		}

		return days;
	}

	function calculateUptime(dayCount: number, outages: Outage[]): number {
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

	async function showTooltip(event: MouseEvent, day: Day) {
		tooltipDay = day;
		const target = event.target as SVGElement;

		let {
			x: left,
			y: top,
			placement,
			middlewareData
		} = await computePosition(target, tooltipElement as HTMLElement, {
			placement: 'bottom',
			middleware: [
				offset(6),
				flip(),
				shift({ padding: 5 }),
				arrow({ element: tooltipArrowElement })
			]
		});

		Object.assign(tooltipElement.style, {
			left: `${left}px`,
			top: `${top}px`,
			opacity: '1'
		});

		const staticSide = {
			top: 'bottom',
			right: 'left',
			bottom: 'top',
			left: 'right'
		}[placement.split('-')[0]] as string;

		if (middlewareData.arrow) {
			const { x: arrowX, y: arrowY } = middlewareData.arrow;
			Object.assign(tooltipArrowElement.style, {
				left: arrowX != null ? `${arrowX}px` : '',
				top: arrowY != null ? `${arrowY}px` : '',
				[staticSide]: '-4px'
			});
		}
	}

	function hideTooltip() {
		tooltipDay = null;
		Object.assign(tooltipElement.style, {
			opacity: '0'
		});
	}

	const unsubscribe = screenSizeStore.subscribe((value) => {
		viewportWidthVar = value;
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="container">
	<h4 class="heading">Outages</h4>

	<div class="viz">
		<svg
			preserveAspectRatio="none"
			height="3rem"
			viewBox={`0 0 ${days.length * 5 - 2} 34`}
			on:mouseleave={hideTooltip}
			role="list"
		>
			{#each days as day, index}
				<rect
					class={day.in_service
						? day.outages.length > 0
							? 'hasOutage'
							: 'noOutage'
						: 'outOfService'}
					width="3"
					height="34"
					y="0"
					x={index * 5}
					on:mouseenter={async (event) => {
						await showTooltip(event, day);
					}}
					on:click={async (event) => {
						await showTooltip(event, day);
					}}
					role="presentation"
				/>
			{/each}
		</svg>

		<div id="tooltip" bind:this={tooltipElement} role="tooltip">
			{#if tooltipDay}
				<OptimumOutagesTimelineTooltip day={tooltipDay} />
			{/if}
			<div id="arrow" bind:this={tooltipArrowElement}></div>
		</div>
	</div>

	<div class="legend">
		<span>{dayCount} days ago</span>
		<div class="spacer" />
		<span>{parseFloat(uptimePercentage.toFixed(2)).toString()}% uptime</span>
		<div class="spacer" />
		<span>Today</span>
	</div>
</div>

<style>
	#arrow {
		position: absolute;
		background: #222;
		width: 8px;
		height: 8px;
		transform: rotate(45deg);
		background-color: var(--text-color);
	}

	#tooltip {
		position: absolute;
		background-color: var(--text-color);
		color: var(--background-color);
		z-index: 3;
		border-radius: 0.5rem;
		opacity: 0;
	}

	.hasOutage {
		fill: var(--down-color);
	}

	.hasOutage:hover {
		fill: var(--down-hover-color);
	}

	.noOutage {
		fill: var(--up-color);
	}

	.noOutage:hover {
		fill: var(--up-hover-color);
	}

	.outOfService {
		fill: var(--non-data-color);
	}

	.outOfService:hover {
		fill: var(--non-data-hover-color);
	}

	svg {
		width: 100%;
	}

	.container {
		padding: 1rem;
		border: 1px solid var(--non-data-color);
		border-radius: 0.5rem;
		margin-bottom: 2rem;
	}

	h4 {
		margin: 0 0 0.5rem 0;
	}

	.legend {
		margin-top: 0.5rem;
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
