import { IsNotEmpty } from "class-validator";

export class CreateSwabEnvironmentDto {
    @IsNotEmpty()
    swabEnvironmentName!: string;
}
