import { IsNotEmpty, IsOptional } from 'class-validator';

export class CommandReportSwabTestDto {
  @IsNotEmpty()
  reportReason!: string;

  @IsOptional()
  @IsNotEmpty()
  reportDetail?: string;
}
