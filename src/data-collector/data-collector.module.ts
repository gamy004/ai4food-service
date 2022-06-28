import { Module } from '@nestjs/common';
import { DataCollectorController } from './data-collector.controller';

@Module({})
export class DataCollectorModule {
    controllers: [DataCollectorController]
}
