import { IsNotEmpty, IsOptional, IsUrl, IsUUID, Validate } from "class-validator";
import { SwabAreaHistoryImageExistsRule } from "../validators/swab-area-history-image-exists-validator";

export class UpsertSwabAreaHistoryImageDto {
    @IsOptional()
    @IsUUID()
    @Validate(SwabAreaHistoryImageExistsRule)
    id?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsUrl()
    swabAreaHistoryImageUrl?: string;

    @IsOptional()
    @IsNotEmpty()
    swabAreaHistoryImageDescription?: string;
}