import { Facility } from "~/facility/entities/facility.entity";
import { SwabAreaHistory } from "../entities/swab-area-history.entity";
import { SwabArea } from "../entities/swab-area.entity";
import { SwabPeriod } from "../entities/swab-period.entity";

export class ResponseSwabPlanDto {
    swabPeriods: SwabPeriod[];

    swabAreaHistories: SwabAreaHistory[];

    swabAreas: SwabArea[];

    facilities: Facility[];
}