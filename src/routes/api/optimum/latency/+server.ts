import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { CloudWatchClient, GetMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { Duration, DateTime } from 'luxon';
import { PROBE_TARGET_HOST_NAME, METRIC_NAMESPACE } from '$env/static/private';

// Goals
// - Over some timeframe, get the average latency of probes

export const GET: RequestHandler = async ({}) => {
	const client = new CloudWatchClient();
	const command = new GetMetricDataCommand({
		EndTime: DateTime.utc().toJSDate(),
		StartTime: DateTime.utc()
			.minus(Duration.fromObject({ days: 90 }))
			.toJSDate(),
		MetricDataQueries: [
			{
				Id: 'nintey_day',
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
					Period: 60 * 5,
					Stat: 'Average'
				}
			}
		]
	});
	const response = await client.send(command);
	return new Response(JSON.stringify(response, undefined, 2));
};
