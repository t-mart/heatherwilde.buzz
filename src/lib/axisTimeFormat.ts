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

export default function (date: Date) {
	if (d3.timeSecond(date) < date) {
		return formatMillisecond(date);
	}
	if (d3.timeMinute(date) < date) {
		return formatSecond(date);
	}
	if (d3.timeHour(date) < date) {
		return formatMinute(date);
	}
	if (d3.timeDay(date) < date) {
		return formatHour(date);
	}
	if (d3.timeMonth(date) < date) {
		if (d3.timeWeek(date) < date) {
			return formatDay(date);
		}
		return formatWeek(date);
	}
	if (d3.timeYear(date) < date) {
		return formatMonth(date);
	}
	return formatYear(date);
}
