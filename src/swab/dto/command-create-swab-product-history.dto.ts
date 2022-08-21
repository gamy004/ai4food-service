import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsUUID, Validate, ValidateNested } from "class-validator";
import { ConnectUserDto } from "~/auth/dto/connect-user.dto";
import { Shift } from "~/common/enums/shift";
import { DateOnlyRule } from "~/common/validators/date-only-validator";
import { TimeOnlyRule } from "~/common/validators/time-only-validator";
import { ConnectFacilityItemDto } from "~/facility/dto/connect-facility-item.dto";
import { ConnectProductDto } from "~/product/dto/connect-product.dto";
import { ConnectSwabPeriodDto } from "./connect-swab-period.dto";

export class BodyCommandCreateSwabProductByIdDto {
    @IsOptional()
    @IsNotEmpty()
    @Validate(TimeOnlyRule)
    swabProductSwabedAt?: string;

    @IsOptional()
    @IsNotEmpty()
    @Validate(DateOnlyRule)
    swabProductDate?: string;

    @IsOptional()
    @IsNotEmpty()
    shift?: Shift;

    @IsOptional()
    @ValidateNested()
    @Type(() => ConnectProductDto)
    product?: ConnectProductDto;

    @IsOptional()
    @IsNotEmpty()
    @Validate(DateOnlyRule)
    productDate?: string;

    @IsOptional()
    @IsNotEmpty()
    productLot?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => ConnectFacilityItemDto)
    facilityItem?: ConnectFacilityItemDto;

    // @IsOptional()
    // @ValidateNested()
    // @Type(() => ConnectUserDto)
    // recordedUser: ConnectUserDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => ConnectSwabPeriodDto)
    swabPeriod?: ConnectSwabPeriodDto;

    @IsOptional()
    swabProductNote?: string;
}