import { Temporal } from "temporal-polyfill";

import { Database } from "./schema";

function splitPostgresDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) {
    throw new Error(`Invalid date format: ${date}`);
  }
  return { year, month, day };
}

export type DayErrorData = {
  reportDay: Temporal.PlainDate;
  errorRate: number;
  totalPings: number;
  isFiller: boolean;
};

export function toDayErrorData({ report_day, error_rate, ping_count }: Database['public']['Functions']['get_daily_error_summary']['Returns'][number]): DayErrorData {
  const { year, month, day } = splitPostgresDate(report_day);

  return {
    reportDay: new Temporal.PlainDate(year, month, day),
    errorRate: error_rate,
    totalPings: ping_count,
    isFiller: false,
  };
}

export type BinnedP95Data = {
  timeBucket: Temporal.ZonedDateTime;
  p95DurationMilliseconds: number;
};

export function toBinnedP95Data(data: Database['public']['Functions']['get_binned_p95_summary_since']['Returns'][number]): BinnedP95Data {
  return {
    timeBucket: Temporal.ZonedDateTime.from(data.time_bucket),
    p95DurationMilliseconds: data.p95_duration_ms,
  };
}