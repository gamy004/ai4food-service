import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Column } from 'typeorm';
import { Shift } from '~/common/enums/shift';
import { SwabEnvironment } from '../entities/swab-environment.entity';
import { CreateSwabAreaHistoryDto } from './create-swab-area-history.dto';

export class UpdateSwabAreaHistoryDto extends PartialType(CreateSwabAreaHistoryDto) {
    @IsNotEmpty()
    swabAreaDate: Date;

    @Column()
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

    @Column()
    swabEnvironmentId: string;

    @IsNotEmpty()
    swabEnvironment: SwabEnvironment;

    @Column({ type: "enum", enum: Shift, nullable: true })
    shift: Shift;
}
