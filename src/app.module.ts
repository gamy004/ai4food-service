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
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guard';

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
  ],
  providers: [
    AppService
  ],
})
export class AppModule { }
