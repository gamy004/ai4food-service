import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidatorConstraint } from "class-validator";
import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";
import { EntityExistsRule } from "~/common/validators/entity-exists-validator";
import { SwabAreaHistoryImage } from "../entities/swab-area-history-image.entity";

@ValidatorConstraint({ name: 'SwabAreaHistoryImageExists', async: true })
@Injectable()
export class SwabAreaHistoryImageExistsRule extends EntityExistsRule<SwabAreaHistoryImage> {
    constructor(
        @InjectRepository(SwabAreaHistoryImage)
        repository: CommonRepositoryInterface<SwabAreaHistoryImage>
    ) {
        super(repository);
    }
}