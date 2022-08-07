import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidatorConstraint } from "class-validator";
import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";
import { EntityExistsRule } from "~/common/validators/entity-exists-validator";
import { SwabEnvironment } from "../entities/swab-environment.entity";

@ValidatorConstraint({ name: 'SwabEnvironmentExists', async: true })
@Injectable()
export class SwabEnvironmentExistsRule extends EntityExistsRule<SwabEnvironment> {
    constructor(
        @InjectRepository(SwabEnvironment)
        repository: CommonRepositoryInterface<SwabEnvironment>
    ) {
        super(repository);
    }
}