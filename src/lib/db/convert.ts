import { Temporal } from "temporal-polyfill";

import { DBAnonymousLatestPing, DBPingTimeBin } from "./query";

const localTimeZone = "America/Chicago";
const nanosecondsPerSecond = BigInt(1_000_000_000);

export type PingTimeBin = {
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  totalPingCount: number;
  failedPingCount: number;
};

export function toPingTimeBin(data: DBPingTimeBin): PingTimeBin {
  return {
    start: new Temporal.ZonedDateTime(
      BigInt(data.start_epoch) * nanosecondsPerSecond,
      localTimeZone,
    ),
    end: new Temporal.ZonedDateTime(
      BigInt(data.end_epoch) * nanosecondsPerSecond,
      localTimeZone,
    ),
    totalPingCount: data.total_ping_count,
    failedPingCount: data.failed_ping_count,
  };
}

export type AnonymousLatestPing = {
  timestamp_epoch: Temporal.ZonedDateTime;
  durationMilliseconds?: number;
};

export function toAnonymousLatestPing(
  dbAnonymousLatestPing: DBAnonymousLatestPing,
): AnonymousLatestPing {
  return {
    timestamp_epoch: new Temporal.ZonedDateTime(
      BigInt(dbAnonymousLatestPing.timestamp_epoch!) * nanosecondsPerSecond,
      localTimeZone,
    ),
    durationMilliseconds:
      dbAnonymousLatestPing.duration_milliseconds ?? undefined,
  };
}
