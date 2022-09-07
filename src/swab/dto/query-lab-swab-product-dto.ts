import { PickType } from "@nestjs/swagger";
import { FilterSwabProductHistoryDto } from "./filter-swab-product-history.dto";

export class QueryLabSwabProductDto extends PickType(FilterSwabProductHistoryDto, [
    'swabProductDate',
    'swabTestCode',
    'swabPeriodId',
    'facilityId',
    'facilityItemId',
]) { }
