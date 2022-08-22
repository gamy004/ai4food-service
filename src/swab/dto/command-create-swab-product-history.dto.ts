import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, Validate, ValidateNested } from "class-validator";
import { ConnectUserDto } from "~/auth/dto/connect-user.dto";
import { Shift } from "~/common/enums/shift";
import { DateOnlyRule } from "~/common/validators/date-only-validator";
import { TimeOnlyRule } from "~/common/validators/time-only-validator";
import { ConnectFacilityItemDto } from "~/facility/dto/connect-facility-item.dto";
import { ConnectProductDto } from "~/product/dto/connect-product.dto";
import { ConnectSwabPeriodDto } from "./connect-swab-period.dto";

export class BodyCommandCreateSwabProductByIdDto {
    @IsNotEmpty()
    @Validate(TimeOnlyRule)
    swabProductSwabedAt?: string;

    @IsNotEmpty()
    @Validate(DateOnlyRule)
    swabProductDate?: string;

    @IsOptional()
    swabProductNote?: string;

    @IsOptional()
    @IsNotEmpty()
    shift?: Shift;

    @ValidateNested()
    @Type(() => ConnectProductDto)
    product?: ConnectProductDto;

    @IsNotEmpty()
    @Validate(DateOnlyRule)
    productDate?: string;

    @IsNotEmpty()
    productLot?: string;

    @ValidateNested()
    @Type(() => ConnectFacilityItemDto)
    facilityItem?: ConnectFacilityItemDto;

    @ValidateNested()
    @Type(() => ConnectSwabPeriodDto)
    swabPeriod?: ConnectSwabPeriodDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => ConnectUserDto)
    recordedUser: ConnectUserDto;
}