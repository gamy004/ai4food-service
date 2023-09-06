import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class GenerateRunningNumberDto {
  @IsNotEmpty()
  key!: string;

  @IsOptional()
  @IsNumber()
  offset?: number;
}
