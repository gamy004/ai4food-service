import { hash, compare } from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { RegisterDto } from '../dto/register-dto';
import { User } from '../entities/user.entity';

export const HASH_SALT: number = 14;

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    userName: string,
    validatedPassword: string,
  ): Promise<any> {
    const user = await this.userService.findByUsername(userName);

    if (user) {
      const isValidPassword = await compare(validatedPassword, user.password);

      if (isValidPassword) {
        const { password, ...result } = user;

        return result;
      }
    }

    return null;
  }

  async login(user: any) {
    return {
      access_token: await this.jwtService.signAsync({ user }),
    };
  }

  async register(data: RegisterDto): Promise<User> {
    const hashedPassword = await hash(data.password, HASH_SALT);

    return this.userService.create({
      userName: data.userName,
      password: hashedPassword,
      role: data.role,
      team: data.team,
    });
  }
}
