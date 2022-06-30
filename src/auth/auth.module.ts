import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthController } from './controllers/auth.controller';
import { UserService } from './services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ]),
    PassportModule
  ],
  providers: [AuthService, UserService, LocalStrategy],
  controllers: [AuthController]
})
export class AuthModule { }
