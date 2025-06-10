import { createClient } from "@supabase/supabase-js";

import {
  getLatestAnonymousPing,
  getPingTimeBins,
  PostgresInterval,
} from "#lib/db/query.ts";
import { Database } from "#lib/db/schema.ts";

import PingTimeBinDisplay from "./ping-time-bin-display";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dynamic = 'force-dynamic'

const binCount = 60;
const lookbackInterval: PostgresInterval = "7 days";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const visualizedTargetUrls =
  process.env.VISUALIZED_TARGET_URLS?.split(",") ?? [];

export default async function Home() {
  const targetBinData = await Promise.all(
    visualizedTargetUrls.map(async (targetUrl, index) =>
      fetchTargetData(targetUrl, `${index}`),
    ),
  );
  return (
    <div className="px-8 py-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-3xl">Heatherwilde.net</h1>

        <p className="text-lg">
          Status of the Optimum Internet service as seens from customer data in
          the Heatherwilde community of Pflugerville, TX.
        </p>

        {targetBinData.map(({ id, bins, latestAnonymousPing }) => (
          <PingTimeBinDisplay
            key={id}
            id={id}
            dbBins={bins}
            dbLatestAnonymousPing={latestAnonymousPing}
          />
        ))}
      </div>
    </div>
  );
}

async function fetchTargetData(targetUrl: string, id: string) {
  // This function is used to fetch the data for a specific target URL.
  // It retrieves the latest ping and the ping time bins for the given target URL.
  // The latest ping is fetched first to ensure it is included in the bins data.

  const { data: latestAnonymousPing, error: latestPingError } =
    await getLatestAnonymousPing(supabase, {
      targetUrl,
    });

  if (latestPingError) {
    console.error("Failed to fetch latest ping:", latestPingError);
  }

  const { data: bins, error: binsError } = await getPingTimeBins(supabase, {
    lookbackInterval,
    binCount,
    filterTargetUrl: targetUrl,
  });

  if (binsError) {
    console.error("Failed to fetch ping time bins:", binsError);
  }

  return { bins, latestAnonymousPing, id };
}
