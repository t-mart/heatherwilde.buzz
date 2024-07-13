import { DateTime, Duration } from 'luxon';

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

export type APIProbe = {
	time: string;
	duration: number;
};

export type Day = {
	start: DateTime;
	in_service: boolean;
	outages: Outage[];
};

export class Timeframe {
	static readonly DAY = new Timeframe(
		'day',
		Duration.fromObject({ days: 1 }),
		Duration.fromObject({ minutes: 5 }),
		'Day'
	);
	static readonly WEEK = new Timeframe(
		'week',
		Duration.fromObject({ days: 7 }),
		Duration.fromObject({ minutes: 30 }),
		'Week'
	);
	static readonly MONTH = new Timeframe(
		'month',
		Duration.fromObject({ days: 30 }),
		Duration.fromObject({ hours: 2 }),
		'Month'
	);

	private constructor(
		public readonly searchParam: string,
		public readonly lookbackDuration: Duration,
		public readonly period: Duration,
		public readonly display: string
	) {}

	static fromSearchParam(searchParam: string | null): Timeframe {
		switch (searchParam) {
			case Timeframe.MONTH.searchParam:
				return Timeframe.MONTH;
			case Timeframe.WEEK.searchParam:
				return Timeframe.WEEK;
			default:
				// Default to day, likely least expensive to process
				return Timeframe.DAY;
		}
	}

	static all(): Timeframe[] {
		return [Timeframe.DAY, Timeframe.WEEK, Timeframe.MONTH];
	}

	/**
	 * Round up a DateTime to the nearest period. Round up, not down, because we
	 * want to include current data.
	 * @param time The time to round @returns A new DateTime rounded to the
	 * nearest period
	 */
	roundUpToPeriod(time: DateTime): DateTime {
		const roundedMillis =
			Math.ceil(time.toMillis() / this.period.toMillis()) * this.period.toMillis();
		return DateTime.fromMillis(roundedMillis);
	}
}