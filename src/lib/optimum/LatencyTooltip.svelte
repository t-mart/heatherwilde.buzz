<script lang="ts">
  import { type Probe } from '$lib';
  import { formatDuration, formatDateAndTime } from '$lib/format';
  export let probe: Probe;
</script>

<div class="container">
  <p class="time"><time>{formatDateAndTime(probe.time)}</time></p>
  <p class="duration">{formatDuration(probe.duration)}</p>
</div>

<style>
  p {
    margin-bottom: 0;
  }

  .time {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  .duration {
    font-size: 1.5rem;
  }
</style>
