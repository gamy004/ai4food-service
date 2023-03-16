import { IsNotEmpty } from 'class-validator';

export class QuerySwabTestByCodeDto {
  @IsNotEmpty()
  swabTestCodes: string[];
}
