import { createClient } from "@supabase/supabase-js";

import { getDailyErrorSummary } from "#lib/db/rpc.ts";
import { Database } from "#lib/db/schema.ts";

import DailyErrorSummary from "./daily-error-summary";

const maxSummaryDayCount = 90;

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default async function Home() {
  const { data: dayErrorData, error: dayErrorError } =
    await getDailyErrorSummary(supabase, {
      numDaysToReport: maxSummaryDayCount,
    });

  if (dayErrorError) {
    console.error("Failed to fetch daily error summary:", dayErrorError);
  }

  return (
    <div className="px-8 py-4">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl">Heatherwilde.net</h1>

        <p className="text-lg">
          Status of the Optimum Internet service as seens from customer data in the Heatherwilde community of
          Pflugerville, TX.
        </p>

        <DailyErrorSummary initialDayErrorData={dayErrorData} />
      </div>
    </div>
  );
}
