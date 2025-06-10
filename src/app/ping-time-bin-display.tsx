"use client";

import {
  PingTimeBin,
  toAnonymousLatestPing,
  toPingTimeBin,
} from "#lib/db/convert.ts";
import { DBAnonymousLatestPing, DBPingTimeBin } from "#lib/db/query.ts";

export default function PingTimeBinDisplay({
  dbBins,
  dbLatestAnonymousPing,
  id,
}: {
  dbBins: DBPingTimeBin[] | null;
  dbLatestAnonymousPing: DBAnonymousLatestPing | null;
  id: string;
}) {
  // TODO: handle this case better. we can render the graph, but just without the data.
  if (
    dbBins === null ||
    dbBins.length === 0 ||
    dbLatestAnonymousPing === null
  ) {
    return <p>No data available</p>;
  }

  const bins = dbBins.map(toPingTimeBin);
  const latestPing = toAnonymousLatestPing(dbLatestAnonymousPing);

  const isUpNow = latestPing.durationMilliseconds !== undefined;

  return (
    <div>
      <div className="time-bin-display border-2 border-border rounded-lg p-4">
        <span className="[grid-area:top-left] text-2xl">
          Ping Performance for Host {id}
        </span>
        <span className="[grid-area:top-right] text-right">
          {isUpNow ? "Up" : "Down"}
        </span>

        <div
          className="w-full h-10 [grid-area:viz] grid bg-grid-background gap-[1px]"
          style={{
            gridTemplateColumns: `repeat(${bins.length}, 1fr)`,
          }}
        >
          {bins.map((bin, index) => (
            <Bin key={bin.start.toString()} bin={bin} index={index} />
          ))}
        </div>

        <span className="[grid-area:bottom-left]">Bottom left</span>
        <span className="[grid-area:bottom-right] text-right">
          Bottom right
        </span>
      </div>

      <ol className="sr-only">
        {bins.map((bin) => (
          <li key={bin.start.toString()}>
            <dl>
              <dt>Date Range</dt>
              <dd>
                <time>{bin.start.toString()}</time> -{" "}
                <time>{bin.end.toString()}</time>
              </dd>
              <dt>Total Pings</dt>
              <dd>{bin.totalPingCount}</dd>
              <dt>Failed Pings</dt>
              <dd>{bin.failedPingCount}</dd>
              <dt>Error Rate</dt>
              <dd>{(bin.failedPingCount / bin.totalPingCount) * 100}%</dd>
            </dl>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Bin({
  bin: {
    start: binStart,
    end: binEnd,
    totalPingCount: count,
    failedPingCount: failedCount,
  },
  index,
}: {
  bin: PingTimeBin;
  index: number;
}) {
  const state =
    count === 0 ? "nodata" : failedCount > 0 ? "errorful" : "errorless";
  const backgroundColorProperty =
    state === "nodata" ? "neutral" : state === "errorful" ? "down" : "up";
  return (
    <div
      className=""
      style={{
        backgroundColor: `var(--color-${backgroundColorProperty})`,
      }}
    />
  );
}
