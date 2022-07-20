import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import databaseConfig from './database/config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportTransactionModule } from './import-transaction/import-transaction.module';
import { ProductScheduleModule } from './product-schedule/product-schedule.module';
import { ProductModule } from './product/product.module';
import { DataCollectorModule } from './data-collector/data-collector.module';
import { AuthModule } from './auth/auth.module';
import { SwabModule } from './swab/swab.module';
import { FacilityModule } from './facility/facility.module';
import { AwsModule } from './aws/aws.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('database'),
        autoLoadEntities: true,
      })
    }),
    ImportTransactionModule,
    ProductScheduleModule,
    ProductModule,
    DataCollectorModule,
    AuthModule,
    SwabModule,
    FacilityModule,
    AwsModule,
  ],
  providers: [
    AppService
  ],
})
export class AppModule { }
