import { Type } from "class-transformer";
import { IsInt, Min, Validate, ValidateNested } from "class-validator";
import { DateOnlyRule } from "~/common/validators/date-only-validator";
import { TimeGreaterThanRule } from "~/common/validators/time-greater-than-validator";
import { TimeOnlyRule } from "~/common/validators/time-only-validator";
import { ConnectProductDto } from "~/product/dto/connect-product.dto";

export class CreateProductScheduleDto {
    @IsInt()
    @Min(1)
    productScheduleAmount: number;

    @Validate(DateOnlyRule)
    productScheduleDate: string;

    @Validate(TimeOnlyRule)
    productScheduleStartedAt: string;

    @Validate(TimeOnlyRule)
    @Validate(TimeGreaterThanRule, ["productScheduleStartedAt"])
    productScheduleEndedAt: string;


    @ValidateNested()
    @Type(() => ConnectProductDto)
    product: ConnectProductDto;
}
