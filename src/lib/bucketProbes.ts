import { type Probe } from '$lib';
import { Interval } from 'luxon';

/**
 * Bucket probes into a maximum number of buckets. The probes are bucketed by
 * time. For each probe in the result, the duration is the mean of the durations of the
 * probes in that bucket, and the time is the start of the bucket.
 *
 * If the number of probes is less than or equal to maxBuckets, the probes are returned
 * as is.
 * @param probes The probes to bucket
 * @param maxBuckets The maximum number of buckets. Must be greater than 0.
 * @returns The probes bucketed into at most maxBuckets
 */
export function bucketProbes(probes: Probe[], maxBuckets: number): Probe[] {
  // careful: we hardcode that the aggregation function is the mean

  if (maxBuckets <= 0) {
    throw new Error('maxBuckets must be greater than 0');
  }

  if (probes.length <= maxBuckets) {
    return probes;
  }

  const _probes = Array.from(probes);
  _probes.sort((a, b) => a.time.toMillis() - b.time.toMillis());

  const earliest = _probes[0].time;
  // add 1 millisecond to the latest probe to include in the last bucket.
  // luxon intervals are left-inclusive, right-exclusive.
  const latest = _probes[_probes.length - 1].time.plus({ milliseconds: 1 });
  const intervals = Interval.fromDateTimes(earliest, latest).divideEqually(maxBuckets);
  const buckets: Probe[] = [];
  let curProbeIdx = 0;

  for (const interval of intervals) {
    const bucket = [];
    while (curProbeIdx < _probes.length && interval.contains(_probes[curProbeIdx].time)) {
      const probe = _probes[curProbeIdx];
      if (!probe.time.isValid) throw new Error('Invalid time in probe');
      bucket.push(probe);
      curProbeIdx++;
    }

    if (bucket.length > 0) {
      let meanDuration = bucket.reduce((acc, probe) => acc + probe.duration, 0) / bucket.length;
      buckets.push({
        time: bucket[0].time,
        duration: meanDuration
      });
    }
  }

  return buckets;
}
