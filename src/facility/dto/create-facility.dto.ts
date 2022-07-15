import { IsEnum, IsNotEmpty } from "class-validator";
import { FacilityType } from "../entities/facility.entity";

export class CreateFacilityDto {
    @IsNotEmpty()
    facilityName!: string;

    @IsEnum(FacilityType)
    facilityType!: FacilityType;
}
