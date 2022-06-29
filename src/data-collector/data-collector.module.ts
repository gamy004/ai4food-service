import { Module } from '@nestjs/common';
import { DataCollectorService } from './data-collector.service';

@Module({
    providers: [DataCollectorService]
})
export class DataCollectorModule {
}