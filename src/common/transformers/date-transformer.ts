import { Injectable } from '@nestjs/common';
import { format } from 'date-fns-tz';

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
}
