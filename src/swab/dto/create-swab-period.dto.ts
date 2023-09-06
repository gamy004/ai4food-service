import { IsNotEmpty } from 'class-validator';

export class CreateSwabPeriodDto {
  @IsNotEmpty()
  swabPeriodName!: string;
}
