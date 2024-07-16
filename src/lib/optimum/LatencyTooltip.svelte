<script lang="ts">
  import { type Probe } from '$lib';
  import { formatDuration, formatDateAndTime } from '$lib/format';
  export let probe: Probe;
</script>

<div class="container">
  <p>{formatDuration(probe.duration)}</p>
</div>

<style>
  p {
    margin-bottom: 0;
  }
</style>
