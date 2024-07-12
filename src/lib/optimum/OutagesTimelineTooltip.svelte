<script lang="ts">
	import { DateTime, Interval } from 'luxon';
	import { type Day } from '$lib';
	export let day: Day;

	function formatOutageTooltipDateTime(
		dateTime: DateTime | null,
		containedDayStart: DateTime
	): string {
		if (dateTime == null) {
			return 'Ongoing';
		}
		const dayInterval = Interval.fromDateTimes(
			containedDayStart,
			containedDayStart.plus({ days: 1 })
		);

		if (dayInterval.contains(dateTime)) {
			// just time
			return dateTime.toLocaleString({
				hour: 'numeric',
				minute: '2-digit',
				second: '2-digit'
			});
		} else {
			// date and time
			return dateTime.toLocaleString({
				weekday: 'short',
				month: 'long',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
				timeZoneName: 'short'
			});
		}
	}
</script>

<div class="container">
	<h5>
		{day?.start.toLocaleString({
			weekday: 'short',
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		})}
	</h5>

	{#if !day.in_service}
		<p>No data for this day</p>
	{:else if day.outages.length > 0}
		<p class="heading">Outages:</p>
		<ul>
			{#each day.outages as outage}
				<li>
					{formatOutageTooltipDateTime(outage.startTime, day.start)} - {formatOutageTooltipDateTime(
						outage.endTime,
						day.start
					)}
				</li>
			{/each}
		</ul>
	{:else}
		<p>No outages</p>
	{/if}
</div>

<style>
	.container {
		margin: 1rem 1rem;
	}

	h5,
	.heading {
		margin-bottom: 0.5rem;
	}

	ul,
	p:last-child {
		margin-bottom: 0;
	}
</style>
