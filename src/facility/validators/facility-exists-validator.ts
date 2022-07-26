import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidatorConstraint } from "class-validator";
import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";
import { EntityExistsRule } from "~/common/validators/entity-exists-validator";
import { Facility } from "../entities/facility.entity";

@ValidatorConstraint({ name: 'facilityExists', async: true })
@Injectable()
export class FacilityExistsRule extends EntityExistsRule<Facility> {
    constructor(
        @InjectRepository(Facility)
        repository: CommonRepositoryInterface<Facility>
    ) {
        super(repository);
    }
}