import { Injectable } from '@nestjs/common';
import { format, zonedTimeToUtc } from 'date-fns-tz';
import { Shift } from '../enums/shift';

export interface DateRangeToSqlOptions {
  timezone?: string | null;
  dateOnly?: boolean;
}

export const DATE_ONLY_FORMAT = 'yyyy-MM-dd';

@Injectable()
export class DateTransformer {
  public toObject(dateString, timeObject = null) {
    let dateObject = new Date(dateString);

    dateObject.setMinutes(0, 0, 0);

    if (timeObject) {
      dateObject.setHours(
        timeObject.hours,
        timeObject.minutes,
        timeObject.seconds,
      );
    }

    return dateObject;
  }

  public toString(dateObject, dateFormat = 'yyyy-MM-dd') {
    return format(dateObject, dateFormat);
  }

  public toTimeObject(timeString) {
    const splittedTimeString = timeString.split(':');

    if (splittedTimeString.length !== 3) {
      throw new Error(
        "(Invalid time string) time string should be formatted in 'HH:mm:ss'",
      );
    }

    return {
      hours: Number(splittedTimeString[0]),
      minutes: Number(splittedTimeString[1]),
      seconds: Number(splittedTimeString[2]),
    };
  }

  public toShiftTimestamp(
    dateString,
    timeString,
    shift: Shift,
    timezone: string | null = null,
  ): Date {
    const timeObject = this.toTimeObject(timeString);

    let dateObject = this.toObject(dateString, timeObject);

    if (
      shift === Shift.NIGHT &&
      timeObject.hours >= 0 &&
      timeObject.hours < 7
    ) {
      dateObject.setDate(dateObject.getDate() + 1);
    }

    if (timezone) {
      dateObject = zonedTimeToUtc(dateObject, timezone);
    }

    return dateObject;
  }

  public toTimestamp(
    dateString,
    timeString,
    timezone: string | null = null,
  ): Date {
    const timeObject = this.toTimeObject(timeString);

    let dateObject = this.toObject(dateString, timeObject);

    if (timezone) {
      dateObject = zonedTimeToUtc(dateObject, timezone);
    }

    return dateObject;
  }

  public dateRangeToSql(
    field,
    fromDateString,
    toDateString,
    { timezone = null, dateOnly = true }: DateRangeToSqlOptions = {},
  ) {
    let expression;

    let rangeFromDateString, rangeToDateString;

    if (fromDateString) {
      let rangeFromDate = this.toObject(fromDateString);

      if (timezone) {
        rangeFromDate = zonedTimeToUtc(rangeFromDate, timezone);
      }

      rangeFromDateString = dateOnly
        ? this.toString(rangeFromDate)
        : rangeFromDate.toISOString();

      console.log('range from date', rangeFromDate, rangeFromDateString);
    }

    if (toDateString) {
      let rangeToDate = this.toObject(toDateString);

      rangeToDate.setDate(rangeToDate.getDate() + 1);

      if (timezone) {
        rangeToDate = zonedTimeToUtc(rangeToDate, timezone);
      }

      rangeToDateString = dateOnly
        ? this.toString(rangeToDate)
        : rangeToDate.toISOString();

      console.log('range to date', rangeToDate, rangeToDateString);
    }

    if (rangeFromDateString && rangeToDateString) {
      expression = `${field} >= '${rangeFromDateString}' and ${field} < '${rangeToDateString}'`;
    } else {
      if (rangeFromDateString) {
        expression = `${field} >= '${rangeFromDateString}'`;
      }

      if (rangeToDateString) {
        expression = `${field} < '${rangeToDateString}'`;
      }
    }

    console.log(expression);

    return expression;
  }
}
