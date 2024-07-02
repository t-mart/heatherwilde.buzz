import { DateTime } from 'luxon';

type APIProbe = {
	ts: number;
	up: boolean;
};

type Probe = {
	datetime: DateTime;
	wasUp: boolean;
};

function toProbe(apiProbe: APIProbe): Probe {
	return {
		datetime: DateTime.fromSeconds(apiProbe.ts),
		wasUp: apiProbe.up
	};
}

export { type APIProbe, type Probe, toProbe };
