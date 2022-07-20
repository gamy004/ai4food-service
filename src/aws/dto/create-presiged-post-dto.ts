import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreatePresignedPostDto {
    @ApiProperty()
    @IsNotEmpty()
    key!: string;

    @ApiProperty()
    @IsNotEmpty()
    contentType!: string;
}