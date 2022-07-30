import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidatorConstraint } from "class-validator";
import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";
import { EntityExistsRule } from "~/common/validators/entity-exists-validator";
import { File } from "../entities/file.entity";

@ValidatorConstraint({ name: 'FileExists', async: true })
@Injectable()
export class FileExistsRule extends EntityExistsRule<File> {
    constructor(
        @InjectRepository(File)
        repository: CommonRepositoryInterface<File>
    ) {
        super(repository);
    }
}