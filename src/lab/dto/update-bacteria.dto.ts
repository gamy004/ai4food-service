import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CreateBacteriaDto } from './create-bacteria.dto';

export class UpdateBacteriaDto extends PartialType(CreateBacteriaDto) {}
