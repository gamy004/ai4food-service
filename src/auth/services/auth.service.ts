import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
    constructor(private userService: UserService) { }

    async validateUser(userName: string, pass: string): Promise<any> {
        const user = await this.userService.findOne(userName);
        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
}
