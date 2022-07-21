import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsUUID, Max, Min, Validate, ValidateNested } from "class-validator";
import { SwabAreaHistoryExistsRule } from "../validators/swab-area-history-exists-validator";
import { UpsertSwabAreaHistoryImageDto } from "./upsert-swab-area-history-image.dto";
import { UpsertSwabEnvironmentDto } from "./upsert-swab-environment.dto";

export class ParamCommandUpdateSwabPlanByIdDto {
    @IsUUID()
    @Validate(SwabAreaHistoryExistsRule)
    id: string;

}

export class BodyCommandUpdateSwabPlanByIdDto {
    @IsOptional()
    @IsNotEmpty()
    @Min(0)
    @Max(100)
    swabAreaTemperature?: number;

    @IsOptional()
    @IsNotEmpty()
    @Min(0)
    @Max(100)
    swabAreaHumidity?: number;

    @ValidateNested({ each: true })
    @Type(() => UpsertSwabEnvironmentDto)
    swabEnvironments: UpsertSwabEnvironmentDto[];

    @ValidateNested({ each: true })
    @Type(() => UpsertSwabAreaHistoryImageDto)
    swabAreaHistoryImages: UpsertSwabAreaHistoryImageDto[];
}