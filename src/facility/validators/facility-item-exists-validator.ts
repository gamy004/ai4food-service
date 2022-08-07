import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidatorConstraint } from "class-validator";
import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";
import { EntityExistsRule } from "~/common/validators/entity-exists-validator";
import { FacilityItem } from "../entities/facility-item.entity";

@ValidatorConstraint({ name: 'facilityItemExists', async: true })
@Injectable()
export class FacilityItemExistsRule extends EntityExistsRule<FacilityItem> {
    constructor(
        @InjectRepository(FacilityItem)
        repository: CommonRepositoryInterface<FacilityItem>
    ) {
        super(repository);
    }
}