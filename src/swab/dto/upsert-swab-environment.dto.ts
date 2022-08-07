import { IsNotEmpty, IsOptional, IsUUID, Validate } from "class-validator";
import { SwabEnvironmentExistsRule } from "../validators/swab-environment-exists-validator";

export class UpsertSwabEnvironmentDto {
    @IsOptional()
    @IsUUID()
    @Validate(SwabEnvironmentExistsRule)
    id?: string;

    @IsOptional()
    @IsNotEmpty()
    swabEnvironmentName?: string;
}