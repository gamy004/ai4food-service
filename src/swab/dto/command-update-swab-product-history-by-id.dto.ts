import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsUUID, Validate, ValidateNested } from "class-validator";
import { ConnectUserDto } from "~/auth/dto/connect-user.dto";
import { Shift } from "~/common/enums/shift";
import { TimeOnlyRule } from "~/common/validators/time-only-validator";
import { ConnectFacilityItemDto } from "~/facility/dto/connect-facility-item.dto";
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

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ConnectUserDto)
    recordedUser: ConnectUserDto;

    @ValidateNested()
    @Type(() => ConnectFacilityItemDto)
    facilityItem!: ConnectFacilityItemDto;
}