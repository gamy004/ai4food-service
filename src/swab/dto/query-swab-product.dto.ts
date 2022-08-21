import { IsNotEmpty, IsOptional, Validate } from "class-validator";
import { Shift } from "~/common/enums/shift";
import { DateOnlyRule } from "~/common/validators/date-only-validator";

export class QuerySwabProductDto {
    @IsOptional()
    @Validate(DateOnlyRule)
    swabProductDate?: string;

    @IsOptional()
    @IsNotEmpty()
    shift?: Shift;
}