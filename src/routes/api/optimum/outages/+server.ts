import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Outage } from '$lib';
import { DynamoDBClient, QueryCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import { DateTime, Duration } from 'luxon';
import { INCIDENT_TABLE_NAME, PROBE_TARGET_HOST_NAME } from '$env/static/private';

// Goals
// - Over the last 90 days, for each day, show downtime incidents that occurred

const lookbackThresholdDuration = Duration.fromObject({ days: 90 });

class ShapeError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ShapeError';
	}
}

function itemToIncident(item: Record<string, AttributeValue>){
	if (!item['start_time']?.S) {
		throw new ShapeError(`start_time is not a string: ${JSON.stringify(item)}`);
	}
	if (!item['end_time']) {
		throw new ShapeError(`end_time is not a string: ${JSON.stringify(item)}`);
	}
	return {
		startTime: item['start_time'].S,
		endTime: item['end_time']['NULL'] ? null : item['end_time'].S!
	};
}

export const GET: RequestHandler = async ({}) => {
	const client = new DynamoDBClient();

	const command = new QueryCommand({
		TableName: INCIDENT_TABLE_NAME,
		KeyConditionExpression: 'host = :host AND start_time > :since',
		ExpressionAttributeValues: {
			':host': { S: PROBE_TARGET_HOST_NAME },
			':since': { S: DateTime.utc().minus(lookbackThresholdDuration).toISO() }
		}
	});

	const response = await client.send(command);
	let incidents: Outage[] = [];
	if (response.Items) {
		try {
			incidents = response.Items.map(itemToIncident);
		} catch (e) {
			if (e instanceof ShapeError) {
				return error(500, 'Bad shape of item in DynamoDB response');
			}
			throw e;
		}
	} else {
		return error(500, 'No items in DynamoDB response');
	}
	return new Response(JSON.stringify(incidents, undefined, 2));
};
