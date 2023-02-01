import { Injectable } from '@nestjs/common';
import { format, zonedTimeToUtc } from 'date-fns-tz';
import { Shift } from '../enums/shift';

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

  public toString(dateObject) {
    return format(dateObject, 'yyyy-MM-dd');
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

  public dateRangeToSql(field, fromDateString, toDateString) {
    let expression;

    let rangeToDateString;

    if (toDateString) {
      const rangeToDate = this.toObject(toDateString);

      rangeToDate.setDate(rangeToDate.getDate() + 1);

      rangeToDateString = this.toString(rangeToDate);
    }

    if (fromDateString && rangeToDateString) {
      expression = `${field} >= '${fromDateString}' and ${field} < '${rangeToDateString}'`;
    } else {
      if (fromDateString) {
        expression = `${field} >= '${fromDateString}'`;
      }

      if (rangeToDateString) {
        expression = `${field} < '${rangeToDateString}'`;
      }
    }

    return expression;
  }
}
