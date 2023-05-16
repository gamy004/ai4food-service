import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePresignedUrlDto {
  @ApiProperty()
  @IsNotEmpty()
  key!: string;

  @ApiProperty()
  @IsOptional()
  fileName?: string;
}
