import { DateTime } from 'luxon';

export type Incident = {
	startTime: DateTime;
	endTime: DateTime | null;
};

export type APIIncident = {
	startTime: string;
	endTime: string | null;
};

export type Probe = {
	time: DateTime;
	duration: number;
};