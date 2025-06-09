import { PostgrestSingleResponse, SupabaseClient } from "@supabase/supabase-js";

import { Database, Tables } from "#lib/db/schema.ts";

// prettier-ignore
export type PostgresIntervalUnit =
  | 'second' | 'seconds' | 's'
  | 'minute' | 'minutes' | 'm'
  | 'hour' | 'hours' | 'h'
  | 'day' | 'days' | 'd'
  | 'week' | 'weeks' | 'w'
  | 'month' | 'months' | 'mon'
  | 'year' | 'years' | 'y';

export type PostgresInterval = `${number} ${PostgresIntervalUnit}`;

export type DBPingTimeBin =
  Database["public"]["Functions"]["get_ping_time_bins_for_interval"]["Returns"][number];

export async function getPingTimeBins(
  supabase: SupabaseClient<Database>,
  options: {
    lookbackInterval: PostgresInterval;
    binCount: number;
    filterTargetUrl?: string;
  },
): Promise<PostgrestSingleResponse<DBPingTimeBin[]>> {
  return await supabase.rpc("get_ping_time_bins_for_interval", {
    lookback_interval: options.lookbackInterval,
    bin_count: options.binCount,
    filter_target_url: options.filterTargetUrl,
  });
}

export type DBAnonymousLatestPing = Pick<
  Tables<"latest_pings_by_target_url">,
  "duration_milliseconds" | "timestamp_epoch"
>;

export async function getLatestAnonymousPing(
  supabase: SupabaseClient<Database>,
  options: {
    targetUrl: string;
  },
): Promise<PostgrestSingleResponse<DBAnonymousLatestPing>> {
  return supabase
    .from("latest_pings_by_target_url")
    .select("duration_milliseconds, timestamp_epoch")
    .eq("target_url", options.targetUrl)
    .limit(1)
    .single();
}
