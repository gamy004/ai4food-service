import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidatorConstraint } from "class-validator";
import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";
import { EntityExistsRule } from "~/common/validators/entity-exists-validator";
import { SwabProductHistory } from "../entities/swab-product-history.entity";

@ValidatorConstraint({ name: 'SwabProductHistoryExists', async: true })
@Injectable()
export class SwabProductHistoryExistsRule extends EntityExistsRule<SwabProductHistory> {
    constructor(
        @InjectRepository(SwabProductHistory)
        repository: CommonRepositoryInterface<SwabProductHistory>
    ) {
        super(repository);
    }
}