import { IsDate, IsInt, Min, ValidateNested, ValidatePromise } from "class-validator";
import { ConnectProductDto } from "~/product/dto/connect-product.dto";
import { Product } from "~/product/entities/product.entity";

export class CreateProductScheduleDto {
    @IsInt()
    @Min(1)
    productScheduleAmount: number;

    @IsDate()
    productScheduleDate: Date;

    @IsDate()
    productScheduleEndedAt: Date;

    @IsDate()
    productScheduleStartedAt: Date;

    @ValidateNested()
    product: ConnectProductDto;
}
