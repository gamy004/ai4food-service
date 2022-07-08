import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidatorConstraint } from "class-validator";
import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";
import { EntityExistsRule } from "~/common/validators/entity-exists-validator";
import { ImportTransaction } from "../entities/import-transaction.entity";

@ValidatorConstraint({ name: 'ImportTransactionExists', async: true })
@Injectable()
export class ImportTransactionExistsRule extends EntityExistsRule<ImportTransaction> {
    constructor(
        @InjectRepository(ImportTransaction)
        repository: CommonRepositoryInterface<ImportTransaction>
    ) {
        super(repository);
    }
}