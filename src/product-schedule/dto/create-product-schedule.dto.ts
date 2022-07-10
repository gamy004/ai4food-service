import { Type } from "class-transformer";
import { IsDate, IsDateString, IsInt, Min, Validate, ValidateNested, ValidatePromise } from "class-validator";
import { DateGreaterThanRule } from "~/common/validators/date-greater-than-validator";
import { DateLessThanRule } from "~/common/validators/date-less-than-validator";
import { DateOnlyRule } from "~/common/validators/date-only-validator";
import { TimeGreaterThanRule } from "~/common/validators/time-greater-than-validator";
import { TimeOnlyRule } from "~/common/validators/time-only-validator";
import { ConnectProductDto } from "~/product/dto/connect-product.dto";
import { Product } from "~/product/entities/product.entity";

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
