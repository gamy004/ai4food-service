import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { SwabEnvironment } from '../entities/swab-environment.entity';
import { CreateSwabAreaHistoryDto } from './create-swab-area-history.dto';

export class UpdateSwabAreaHistoryDto extends PartialType(CreateSwabAreaHistoryDto) {
    @IsNotEmpty()
    swabAreaDate: Date;

    @IsNotEmpty()
    swabAreaSwabedAt: Date;

    @IsNotEmpty()
    swabAreaTemperature: number;

    @IsNotEmpty()
    swabAreaHumidity: number;

    @IsNotEmpty()
    swabAreaAtp: number;

    @IsNotEmpty()
    swabPeriodId: string;

    @IsNotEmpty()
    swabAreaId: string;

    @IsNotEmpty()
    swabTestId: number;

    swabEnvironmentId: string;

    @IsNotEmpty()
    swabEnvironment: SwabEnvironment;
}
