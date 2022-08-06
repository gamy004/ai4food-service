import { Type } from "class-transformer";
import { IsMimeType, IsNotEmpty, IsOptional, IsUrl, ValidateNested } from "class-validator";
import { ConnectUserDto } from "~/auth/dto/connect-user.dto";

export class CreateFileDto {
    @IsNotEmpty()
    fileKey!: string;

    @IsNotEmpty()
    @IsUrl()
    fileSource!: string;

    @IsNotEmpty()
    fileName!: string;

    @IsNotEmpty()
    @IsMimeType()
    fileContentType!: string;

    @IsNotEmpty()
    fileSize!: number;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ConnectUserDto)
    user: ConnectUserDto;
}
