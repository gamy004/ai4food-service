import { IsNotEmpty, IsOptional, IsUUID, Validate } from "class-validator";
import { SwabAreaHistoryImageExistsRule } from "../validators/swab-area-history-image-exists-validator";

export class UpsertSwabAreaHistoryImageDto {
    @IsOptional()
    @IsUUID()
    @Validate(SwabAreaHistoryImageExistsRule)
    id?: string;

    @IsNotEmpty()
    swabAreaHistoryImageUrl: string;

    @IsOptional()
    @IsNotEmpty()
    swabAreaHistoryImageDescription?: string;
}