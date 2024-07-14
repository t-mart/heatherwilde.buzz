import * as d3 from 'd3';
import type { DateTime, DateTimeFormatOptions } from 'luxon';

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

export function formatAxisDate(date: Date) {
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

export function formatDuration(durationSeconds: number): string {
	if (durationSeconds < 1) {
		return `${(durationSeconds * 1000).toFixed(0)}ms`;
	}

	const durationStr = durationSeconds.toString();

	// Determine the necessary number of decimal places
	if (durationStr.includes('.')) {
		// Remove trailing zeros from the decimal part
		return `${parseFloat(durationStr)}s`;
	} else {
		// No decimal part
		return `${durationSeconds}s`;
	}
}

function formatDateTime(dateTime: DateTime, formatOpts?: DateTimeFormatOptions): string {
	return dateTime.toLocaleString(formatOpts);
}

export function formatDateAndTime(dateTime: DateTime, includeTZ = false) {
	return formatDateTime(dateTime, {
		weekday: 'short',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: includeTZ ? 'short' : undefined
	});
}

export function formatTime(dateTime: DateTime) {
	return formatDateTime(dateTime, {
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit'
	});
}

export function formatDate(dateTime: DateTime) {
	return formatDateTime(dateTime, {
		weekday: 'short',
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});
}
