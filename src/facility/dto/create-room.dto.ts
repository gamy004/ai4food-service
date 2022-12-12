import { Type } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator";
import { ConnectZoneDto } from "./connect-zone.dto";

export class CreateRoomDto {
    @IsNotEmpty()
    roomName: string;

    @ValidateNested()
    @Type(() => ConnectZoneDto)
    zone: ConnectZoneDto;
}
