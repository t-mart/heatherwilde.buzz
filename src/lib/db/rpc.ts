import { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

import { Database } from '#lib/db/schema.ts'

export type PostgresIntervalUnit =
  | 'second' | 'seconds' | 's'
  | 'minute' | 'minutes' | 'min' | 'm'
  | 'hour' | 'hours' | 'h'
  | 'day' | 'days' | 'd'
  | 'week' | 'weeks' | 'w'
  | 'month' | 'months' | 'mon'
  | 'year' | 'years' | 'y'
  | 'decade' | 'decades'
  | 'century' | 'centuries' | 'c'
  | 'millennium' | 'millennia' | 'millenniums';

export type PostgresInterval = `${number} ${PostgresIntervalUnit}`;

export type DBPinnedP95Data = Database['public']['Functions']['get_binned_p95_summary_since']['Returns'][number];

export async function getBinnedP95SummarySince(
  supabase: SupabaseClient<Database>,
  options: {
    lookbackInterval: PostgresInterval;
    numBins?: number;
    filterTargetUrl?: string;
  }
): Promise<PostgrestSingleResponse<DBPinnedP95Data[]>> {
  return await supabase
    .rpc('get_binned_p95_summary_since', {
      lookback_interval: options.lookbackInterval,
      num_bins: options.numBins,
      filter_target_url: options.filterTargetUrl,
    })
}

export type DBDailyErrorData = Database['public']['Functions']['get_daily_error_summary']['Returns'][number];

export async function getDailyErrorSummary(
  supabase: SupabaseClient<Database>,
  options: {
    numDaysToReport: number;
    reportTimezone?: string;
    filterTargetUrl?: string;
  }
): Promise<PostgrestSingleResponse<DBDailyErrorData[]>> {
  return await supabase
    .rpc('get_daily_error_summary', {
      num_days_to_report: options.numDaysToReport,
      report_timezone: options.reportTimezone,
      filter_target_url: options.filterTargetUrl,
    })
}