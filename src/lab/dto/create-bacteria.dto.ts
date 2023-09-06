import { IsNotEmpty } from 'class-validator';

export class CreateBacteriaDto {
  @IsNotEmpty()
  bacteriaName!: string;
}
