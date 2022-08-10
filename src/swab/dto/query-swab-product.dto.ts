import { IsNotEmpty, IsOptional, Validate } from "class-validator";
import { DateOnlyRule } from "~/common/validators/date-only-validator";

export class QuerySwabProductDto {
    @IsOptional()
    @Validate(DateOnlyRule)
    swabProductDate?: string;
}