<script lang="ts">
	import { DateTime, Interval } from 'luxon';
	import { type Day } from '$lib';
	import { formatDateAndTime, formatTime, formatDate } from '$lib/format';
	export let day: Day;
	export let maxOutages = 3;
	$: exceedsMaxOutages = day.outages.length > maxOutages;

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
			return formatTime(dateTime);
		} else {
			return formatDateAndTime(dateTime);
		}
	}
</script>

<div class="container">
	<h5>
		{formatDate(day.start)}
	</h5>

	{#if !day.in_service}
		<p>No data for this day</p>
	{:else if day.outages.length > 0}
		<p>Outages:</p>
		<ul>
			{#each day.outages.slice(0, maxOutages) as outage}
				<li>
					{formatOutageTooltipDateTime(outage.startTime, day.start)} - {formatOutageTooltipDateTime(
						outage.endTime,
						day.start
					)}
				</li>
			{/each}
			{#if exceedsMaxOutages}
				<li>...</li>
			{/if}
		</ul>
	{:else}
		<p>No outages</p>
	{/if}
</div>

<style>
	h5,
	.heading {
		margin-bottom: 0.5rem;
	}

	ul,
	li,
	p:last-child {
		margin-bottom: 0;
	}
</style>
