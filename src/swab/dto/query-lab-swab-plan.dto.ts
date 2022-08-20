import { IsNotEmpty, Validate, IsOptional, IsUUID, IsNumber } from "class-validator";
import { DateOnlyRule } from "~/common/validators/date-only-validator";
import { SwabTestExistsRule } from "../validators/swab-test-exists-validator";
import { SwabAreaHistoryExistsRule } from "../validators/swab-area-history-exists-validator";

export class QueryLabSwabPlanDto {
    @IsOptional()
    @IsUUID()
    @Validate(SwabAreaHistoryExistsRule)
    id?: string;

    @IsOptional()
    @Validate(DateOnlyRule)
    swabAreaDate?: string;

    @IsOptional()
    @IsNotEmpty()
    swabTestCode?: string;

    @IsOptional()
    @IsNumber()
    @Validate(SwabTestExistsRule)
    swabTestId?: number;
}