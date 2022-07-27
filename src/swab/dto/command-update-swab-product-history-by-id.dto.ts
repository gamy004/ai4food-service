import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsUUID, Max, Min, Validate, ValidateNested } from "class-validator";
import { Shift } from "~/common/enums/shift";
import { TimeOnlyRule } from "~/common/validators/time-only-validator";
import { ConnectProductDto } from "~/product/dto/connect-product.dto";
import { SwabProductHistoryExistsRule } from "../validators/swab-product-history-exists-validator";

export class ParamCommandUpdateSwabPlanByIdDto {
    @IsUUID()
    @Validate(SwabProductHistoryExistsRule)
    id: string;

}

export class BodyCommandUpdateSwabProductHistoryByIdDto {
    @IsNotEmpty()
    @Validate(TimeOnlyRule)
    swabProductSwabedAt: string;

    @IsNotEmpty()
    @Validate(TimeOnlyRule)
    swabProductDate: Date;

    @IsOptional()
    @IsNotEmpty()
    shift?: Shift;

    @IsOptional()
    @ValidateNested()
    @Type(() => ConnectProductDto)
    product?: ConnectProductDto;

    @IsNotEmpty()
    swabProductLot!: string;
}