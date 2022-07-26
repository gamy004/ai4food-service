import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsUUID, Max, Min, Validate, ValidateNested } from "class-validator";
import { DateOnlyRule } from "~/common/validators/date-only-validator";
import { TimeOnlyRule } from "~/common/validators/time-only-validator";
import { ConnectProductDto } from "~/product/dto/connect-product.dto";
import { SwabAreaHistoryExistsRule } from "../validators/swab-area-history-exists-validator";
import { UpsertSwabAreaHistoryImageDto } from "./upsert-swab-area-history-image.dto";
import { UpsertSwabEnvironmentDto } from "./upsert-swab-environment.dto";

export class ParamCommandUpdateSwabPlanByIdDto {
    @IsUUID()
    @Validate(SwabAreaHistoryExistsRule)
    id: string;

}

export class BodyCommandUpdateSwabPlanByIdDto {
    @IsNotEmpty()
    @Validate(TimeOnlyRule)
    swabAreaSwabedAt: string;

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

    @IsOptional()
    @IsNotEmpty()
    swabAreaNote?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => ConnectProductDto)
    product!: ConnectProductDto;

    @Validate(DateOnlyRule)
    productDate?: string;

    @IsOptional()
    @IsNotEmpty()
    productLot?: string;

    @ValidateNested({ each: true })
    @Type(() => UpsertSwabEnvironmentDto)
    swabEnvironments: UpsertSwabEnvironmentDto[];

    @ValidateNested({ each: true })
    @Type(() => UpsertSwabAreaHistoryImageDto)
    swabAreaHistoryImages: UpsertSwabAreaHistoryImageDto[];
}