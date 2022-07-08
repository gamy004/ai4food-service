import { IsUUID, Validate } from "class-validator";
import { UserExistsRule } from "../validators/user-exists-validator";

export class ConnectUserDto {
    @IsUUID()
    @Validate(UserExistsRule)
    id: string;
}
