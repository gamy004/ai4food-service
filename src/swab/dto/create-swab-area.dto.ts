import { Type } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator"
import { ConnectFacilityDto } from "~/facility/dto/connect-facility.dto";
import { SwabArea } from "../entities/swab-area.entity";

export class CreateSwabAreaDto {
    @IsNotEmpty()
    swabAreaName!: string;

    @IsNotEmpty()
    subSwabAreas!: SwabArea[];

    @ValidateNested()
    @Type(() => ConnectFacilityDto)
    facility?: ConnectFacilityDto;
}
