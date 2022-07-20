import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidatorConstraint } from "class-validator";
import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";
import { EntityExistsRule } from "~/common/validators/entity-exists-validator";
import { SwabAreaHistory } from "../entities/swab-area-history.entity";

@ValidatorConstraint({ name: 'SwabAreaHistoryExists', async: true })
@Injectable()
export class SwabAreaHistoryExistsRule extends EntityExistsRule<SwabAreaHistory> {
    constructor(
        @InjectRepository(SwabAreaHistory)
        repository: CommonRepositoryInterface<SwabAreaHistory>
    ) {
        super(repository);
    }
}