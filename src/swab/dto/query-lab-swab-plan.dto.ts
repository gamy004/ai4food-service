import { IsNotEmpty, Validate, IsBoolean, IsOptional } from "class-validator";
import { Transform } from 'class-transformer';
import { DateOnlyRule } from "~/common/validators/date-only-validator";

export class QueryLabSwabPlanDto {
    @Validate(DateOnlyRule)
    swabAreaDate: string;

    @IsNotEmpty()
    swabTestCode: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value} ) => value === 'true')
    listeriaMonoDetected?: boolean;
}