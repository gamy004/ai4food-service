import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { loggingMiddleware } from './middlewares/logging-middleware';
// import { softDeleteMiddleware } from './middlewares/soft-delete-middleware';
// import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserModule } from './user/user.module';
// import mikroOrmConfig from './config/mikro-orm.config';
import typeormConfig from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...typeormConfig,
      autoLoadEntities: true,
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
