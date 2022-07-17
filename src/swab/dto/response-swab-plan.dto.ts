import { PickType } from "@nestjs/swagger";
import { FacilityItem } from "~/facility/entities/facility-item.entity";
import { SwabAreaHistory } from "../entities/swab-area-history.entity";
import { SwabArea } from "../entities/swab-area.entity";
import { SwabPeriod } from "../entities/swab-period.entity";

export class ResponseSwabPlanDto {
    swabPeriods: SwabPeriod[];

    swabAreaHistories: SwabAreaHistory[];

    swabAreas: SwabArea[];

    facilityItems: FacilityItem[];
}