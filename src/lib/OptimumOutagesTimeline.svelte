<script lang="ts">
	import { type Incident } from '$lib';
	import { screenSizeStore } from '$lib/viewportWidthStore';
	import { onDestroy } from 'svelte';
	import { DateTime, Interval } from 'luxon';
	import { PUBLIC_START_OF_SERVICE_DATE } from '$env/static/public';

	let viewportWidthVar: string;
	export let incidents: Incident[];
	const startOfService = DateTime.fromISO(PUBLIC_START_OF_SERVICE_DATE).startOf('day');
	let selectedDay: DateTime | null = null;

	$: dayCount = viewportWidthVar == 'large' ? 90 : viewportWidthVar == 'medium' ? 60 : 30;
	$: days = makeDays(dayCount, incidents);
	$: uptimePercentage = calculateUptime(dayCount, incidents);

	type Day = {
		start: DateTime;
		in_service: boolean;
		incidents: Incident[];
	};

	function makeDays(dayCount: number, incidents: Incident[]): Day[] {
		// sort incidents by property startTime, from earliest to latest
		incidents = incidents.sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis());

		const days: Day[] = [];
		const serviceInterval = Interval.fromDateTimes(startOfService, DateTime.now());
		const now = DateTime.now().startOf('day');
		let curDate = now.minus({ days: dayCount - 1 });

		while (curDate <= now) {
			const curInterval = Interval.fromDateTimes(curDate, curDate.plus({ days: 1 }));
			const in_service = serviceInterval.contains(curDate);
			// this is n^2, but it's fine for now
			const incidentsForDay = incidents.filter((incident) => {
				const incidentInterval = Interval.fromDateTimes(
					incident.startTime,
					incident.endTime ?? now
				);
				return curInterval.overlaps(incidentInterval);
			});
			days.push({ start: curDate, in_service, incidents: incidentsForDay });
			curDate = curDate.plus({ days: 1 });
		}

		return days;
	}

	function calculateUptime(dayCount: number, incidents: Incident[]): number {
		const start = DateTime.fromMillis(
			Math.max(startOfService.toMillis(), DateTime.now().minus({ days: dayCount }).toMillis())
		);
		const end = DateTime.now();
		const totalDuration = Interval.fromDateTimes(start, end).toDuration();
		let uptimeDuration = Interval.fromDateTimes(start, end).toDuration();
		incidents.forEach((incident) => {
			const incidentStartMin = DateTime.fromMillis(
				Math.max(incident.startTime.toMillis(), start.toMillis())
			);
			const incidentDuration = Interval.fromDateTimes(
				incidentStartMin,
				incident.endTime ?? DateTime.now()
			).toDuration();
			uptimeDuration = uptimeDuration.minus(incidentDuration);
		});

		return (uptimeDuration.toMillis() / totalDuration.toMillis()) * 100;
	}

	const unsubscribe = screenSizeStore.subscribe((value) => {
		viewportWidthVar = value;
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<div class="uptime">
	<h3 class="heading">Outages</h3>

	<svg preserveAspectRatio="none" height="3rem" viewBox={`0 0 ${days.length * 5 - 2} 34`}>
		{#each days as day, index}
			<rect
				class={day.in_service
					? day.incidents.length > 0
						? 'hasIncident'
						: 'noIncident'
					: 'outOfService'}
				width="3"
				height="34"
				y="0"
				x={index * 5}
			/>
		{/each}
	</svg>

	<div class="legend">
		<span>{dayCount} days ago</span>
		<div class="spacer" />
		<span>{parseFloat(uptimePercentage.toFixed(2)).toString()}% uptime</span>
		<div class="spacer" />
		<span>Today</span>
	</div>
</div>

<style>
	.hasIncident {
		fill: var(--down-color);
	}

	.hasIncident:hover {
		fill: var(--down-hover-color);
	}

	.noIncident {
		fill: var(--up-color);
	}

	.noIncident:hover {
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

	.uptime {
		padding: 1rem;
		border: 1px solid var(--non-data-color);
		border-radius: 0.5rem;
		margin-bottom: 2rem;
	}

	.uptime h3 {
		margin: 0 0 1rem 0;
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
