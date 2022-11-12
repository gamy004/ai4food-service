import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ValidatorConstraint } from "class-validator";
import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";
import { EntityExistsRule } from "~/common/validators/entity-exists-validator";
import { Room } from "../entities/room.entity";

@ValidatorConstraint({ name: 'roomExists', async: true })
@Injectable()
export class RoomExistsRule extends EntityExistsRule<Room> {
    constructor(
        @InjectRepository(Room)
        repository: CommonRepositoryInterface<Room>
    ) {
        super(repository);
    }
}