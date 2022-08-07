import { IsUUID, Validate } from "class-validator";
import { FacilityExistsRule } from "../validators/facility-exists-validator";

export class QueryFindAllFacilityItemDto {
    @IsUUID()
    @Validate(FacilityExistsRule)
    id!: string;
}
