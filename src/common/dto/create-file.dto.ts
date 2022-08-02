import { IsMimeType, IsNotEmpty, IsUrl } from "class-validator";

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
}
