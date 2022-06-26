import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { loggingMiddleware } from './middlewares/logging-middleware';
// import { softDeleteMiddleware } from './middlewares/soft-delete-middleware';
// import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserModule } from './user/user.module';
// import mikroOrmConfig from './config/mikro-orm.config';
import typeormConfig from './config/typeorm.config';
import databaseConfig from './config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
