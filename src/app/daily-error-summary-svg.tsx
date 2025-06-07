"use client";

import { useEffect, useRef, useState } from "react";
import { Temporal } from "temporal-polyfill";

import { DayErrorData, toDayErrorData } from "#lib/db/convert.ts";
import { DBDailyErrorData } from "#lib/db/rpc.ts";

export default function DailyErrorSummarySVG({
  initialDayErrorData,
}: {
  initialDayErrorData: DBDailyErrorData[] | null;
}) {
  const [dayErrorData, setDayErrorData] = useState<DayErrorData[] | null>(
    () => {
      if (!initialDayErrorData) {
        return initialDayErrorData;
      }
      return initialDayErrorData.map(toDayErrorData);
    },
  );
  const { daysToShow, elementRef } = useResponsiveDays();

  if (!dayErrorData) {
    return <p>Loading...</p>;
  }

  const filledData = fillData(dayErrorData, daysToShow);

  return (
    <div ref={elementRef}>
      <svg className="w-full block border-gray-500 border-1" viewBox={`0 0 ${daysToShow * 10} 40`} preserveAspectRatio="none">
        {filledData.map((item, index) => (
          <Day
            key={item.reportDay.toString()}
            dayErrorData={item}
            index={index}
          />
        ))}
      </svg>
    </div>
  );
}

function Day({
  dayErrorData: { reportDay, errorRate, isFiller, totalPings },
  index,
}: {
  dayErrorData: DayErrorData;
  index: number;
}) {
  const backgroundColorProperty = isFiller
    ? "neutral"
    : errorRate > 0
      ? "down"
      : "up";
  const x = index * 10 + 5;
  return (
    <line
      x1={x}
      x2={x}
      y1={5}
      y2={35}
      stroke={`var(--color-${backgroundColorProperty})`}
      strokeWidth={6}
      strokeLinecap="round"
    />
  );
}

function fillData(data: DayErrorData[], fillTo: number) {
  // Fill in any missing data points
  const firstReportDay = data[0]?.reportDay || Temporal.Now.plainDateISO();
  const daysToFill = fillTo - data.length;
  const fillers = Array.from({ length: daysToFill }, (_, index) => ({
    reportDay: firstReportDay.subtract({ days: daysToFill - index }),
    errorRate: 0,
    totalPings: 0,
    isFiller: true,
  }));

  return [...fillers, ...data];
}

function useResponsiveDays(initialValue: number = 30) {
  const [daysToShow, setDaysToShow] = useState<number>(initialValue);

  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.borderBoxSize[0]?.inlineSize;

      if (width === undefined) {
        console.warn("ResizeObserver entry does not have a valid width.");
        return;
      }

      setDaysToShow(() => {
        if (width <= 450) {
          return 30;
        } else if (width <= 750) {
          return 60;
        } else {
          return 90;
        }
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []); // run only once on mount

  return { daysToShow, elementRef };
}
