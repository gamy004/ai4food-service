import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidatorConstraint } from "class-validator";
import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";
import { EntityExistsRule } from "~/common/validators/entity-exists-validator";
import { User } from "../entities/user.entity";

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class UserExistsRule extends EntityExistsRule<User> {
    constructor(
        @InjectRepository(User)
        repository: CommonRepositoryInterface<User>
    ) {
        super(repository);
    }
}