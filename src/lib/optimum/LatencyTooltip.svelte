<script lang="ts">
	import { type Probe } from '$lib';
	import { formatDuration, formatDateAndTime } from '$lib/format';
	export let probe: Probe;
</script>

<div class="container">
	<h5>
		{formatDateAndTime(probe.time)}
	</h5>

	<p>{formatDuration(probe.duration)}</p>
</div>

<style>
	h5 {
		margin-bottom: 0.5rem;
	}

	p {
		margin-bottom: 0;
	}
</style>
