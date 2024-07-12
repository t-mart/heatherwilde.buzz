<script lang="ts">
	import { type Incident } from '$lib';
	import { DateTime, Interval, Duration } from 'luxon';

	const millisecondsInMinute = 1000 * 60;
	export let incidents: Incident[];
	
	$: incidentDescriptions = incidents
		.slice()
		.sort((a, b) => b.startTime.toMillis() - a.startTime.toMillis())
		.map(getIncidentHistoryItem);

	type OutageHistoryItem = {
		startTime: string;
		duration: string;
		ongoing: boolean;
	};

	function getIncidentHistoryItem(incident: Incident): OutageHistoryItem {
		const startTime = incident.startTime.toLocaleString({
			weekday: 'short',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			timeZoneName: 'short'
		});
		// luxon's toHuman doesn't do rounding nicely. see the comments on this
		// popular issue: https://github.com/moment/luxon/issues/1134. here, we
		// just clear out the milliseconds and seconds. this is a hack.
		const roundedDurationMillis = Math.max(
			Math.floor(
				Interval.fromDateTimes(incident.startTime, incident.endTime ?? DateTime.now())
					.toDuration()
					.toMillis() / millisecondsInMinute
			) * millisecondsInMinute,
			millisecondsInMinute // at least one minute, because we've just cleared them out
		);
		const duration = Duration.fromMillis(roundedDurationMillis).rescale().toHuman();
		const ongoing = !incident.endTime;
		return { startTime, duration, ongoing };
	}
</script>

<div class="container">
	<div class="heading">
		<h3>Outage History</h3>
		<a href="/api/optimum-outages">Download JSON</a>
	</div>

	<ol class="items">
		{#each incidentDescriptions as incident}
			<li>
				{#if incident.ongoing}<span class="ongoing">⚠️ Ongoing</span>{/if}
				<time>{incident.startTime}</time> - {incident.duration}
			</li>
		{/each}
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
	}
</style>
