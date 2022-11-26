import { Facility } from "~/facility/entities/facility.entity";
import { Product } from "~/product/entities/product.entity";
import { SwabAreaHistory } from "../entities/swab-area-history.entity";
import { SwabArea } from "../entities/swab-area.entity";
import { SwabPeriod } from "../entities/swab-period.entity";
import { SwabProductHistory } from "../entities/swab-product-history.entity";

export class ResponseSwabPlanDto {
    swabPeriods: SwabPeriod[];

    swabAreaHistories: SwabAreaHistory[];

    swabProductHistories: SwabProductHistory[];

    swabAreas: SwabArea[];

    products: Product[];

    facilities: Facility[];
}