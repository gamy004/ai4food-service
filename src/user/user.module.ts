import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
// import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  controllers: [UserController],
  providers: [
    {
      provide: UserService,
      useClass: UserService,
    }
  ]
})
export class UserModule { }
