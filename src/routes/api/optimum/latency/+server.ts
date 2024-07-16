import { METRIC_NAMESPACE, PROBE_TARGET_HOST_NAME } from '$env/static/private';
import { type APIProbe, Timeframe } from '$lib';
import { CloudWatchClient, GetMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { error } from '@sveltejs/kit';
import { DateTime } from 'luxon';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const timeframeParam = url.searchParams.get('timeframe');
  const timeframe = Timeframe.fromSearchParam(timeframeParam);

  const client = new CloudWatchClient();

  // Round up to the nearest period so that timestamps aren't fractional.
  const now = timeframe.roundUpToPeriod(DateTime.utc());

  const command = new GetMetricDataCommand({
    EndTime: now.toJSDate(),
    StartTime: now.minus(timeframe.lookbackDuration).toJSDate(),
    MetricDataQueries: [
      {
        Id: 'dontcare',
        MetricStat: {
          Metric: {
            Namespace: METRIC_NAMESPACE,
            MetricName: 'probe_duration_seconds',
            Dimensions: [
              {
                Name: 'host',
                Value: PROBE_TARGET_HOST_NAME
              }
            ]
          },
          Period: timeframe.period.toMillis() / 1000,
          Stat: 'Average'
        }
      }
    ]
  });
  const response = await client.send(command);

  if (!response.MetricDataResults) {
    return error(500, 'No MetricDataResults in CloudWatch response');
  }

  const timestamps = response.MetricDataResults[0].Timestamps!;
  const values = response.MetricDataResults[0].Values!;

  const probes: APIProbe[] = timestamps.map((timestamp, i) => ({
    time: timestamp.toISOString(),
    duration: values[i]
  }));

  return new Response(JSON.stringify(probes, undefined, 2));
};
