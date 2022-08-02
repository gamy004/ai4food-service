import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsUrl, IsUUID, Validate, ValidateNested } from "class-validator";
import { UpsertFileDto } from "~/common/dto/upsert.file.dto";
import { SwabAreaHistoryImageExistsRule } from "../validators/swab-area-history-image-exists-validator";

export class UpsertSwabAreaHistoryImageDto {
    @IsOptional()
    @IsUUID()
    @Validate(SwabAreaHistoryImageExistsRule)
    id?: string;

    @IsOptional()
    @IsNotEmpty()
    swabAreaHistoryImageDescription?: string;

    @ValidateNested()
    @Type(() => UpsertFileDto)
    file: UpsertFileDto;
}