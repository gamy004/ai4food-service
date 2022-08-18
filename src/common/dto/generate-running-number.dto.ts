import { IsNotEmpty } from "class-validator";

export class GenerateRunningNumberDto {
    @IsNotEmpty()
    key!: string;
}
