import { DateTime } from 'luxon';

export type Outage = {
	startTime: DateTime;
	endTime: DateTime | null;
};

export type APIOutage = {
	startTime: string;
	endTime: string | null;
};

export type Probe = {
	time: DateTime;
	duration: number;
};

export type Day = {
	start: DateTime;
	in_service: boolean;
	outages: Outage[];
};
