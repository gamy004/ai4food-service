import { Injectable } from "@nestjs/common";
import { format } from "date-fns-tz";

@Injectable()
export class DateTransformer {
    public toObject(dateString) {
        let dateObject = new Date(dateString);

        dateObject.setMinutes(0, 0, 0);

        return dateObject;
    }

    public toString(dateObject) {
        return format(dateObject, "yyyy-MM-dd");
    }
}