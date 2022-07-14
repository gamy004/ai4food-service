import { compare } from "bcrypt";
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }

    async validateUser(userName: string, validatedPassword: string): Promise<any> {
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
}
