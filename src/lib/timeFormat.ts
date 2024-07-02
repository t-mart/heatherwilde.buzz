import * as d3 from 'd3';

// this is almost the default time format from d3.scaleTime
const formatMillisecond = d3.timeFormat('.%L'),
	formatSecond = d3.timeFormat(':%S'),
	// but we use 24-hour clock here
	formatMinute = d3.timeFormat('%H:%M'),
	// and here.
	formatHour = d3.timeFormat('%H:%M'),
	formatDay = d3.timeFormat('%a %d'),
	formatWeek = d3.timeFormat('%b %d'),
	formatMonth = d3.timeFormat('%B'),
	formatYear = d3.timeFormat('%Y');

export function multiFormat(date: Date) {
	if (d3.utcSecond(date) < date) {
		return formatMillisecond(date);
	}
	if (d3.utcMinute(date) < date) {
		return formatSecond(date);
	}
	if (d3.utcHour(date) < date) {
		return formatMinute(date);
	}
	if (d3.utcDay(date) < date) {
		return formatHour(date);
	}
	if (d3.utcMonth(date) < date) {
		if (d3.utcWeek(date) < date) {
			return formatDay(date);
		}
		return formatWeek(date);
	}
	if (d3.utcYear(date) < date) {
		return formatMonth(date);
	}
	return formatYear(date);
}
