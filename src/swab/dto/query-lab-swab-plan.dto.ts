import { IsNotEmpty, Validate, IsBoolean, IsOptional } from "class-validator";
import { Transform } from 'class-transformer';
import { DateOnlyRule } from "~/common/validators/date-only-validator";

export class QueryLabSwabPlanDto {
    @IsOptional()
    @Validate(DateOnlyRule)
    swabAreaDate?: string;

    @IsNotEmpty()
    swabTestCode: string;
}