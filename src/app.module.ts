import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostService } from './post.service';
import { PrismaModule } from 'nestjs-prisma';
import { loggingMiddleware } from './middlewares/logging-middleware';
import { softDeleteMiddleware } from './middlewares/soft-delete-middleware';
import { UserModule } from './user/user.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './config/mikro-orm.config';

@Module({
  imports: [
    MikroOrmModule.forRoot(mikroOrmConfig),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, PostService],
})
export class AppModule {}
