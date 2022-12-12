import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldShiftToCleaningRoomHistoryTable1669891500364 implements MigrationInterface {
    name = 'addFieldShiftToCleaningRoomHistoryTable1669891500364'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cleaning_room_history\` ADD \`shift\` enum ('day', 'night') NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cleaning_room_history\` DROP COLUMN \`shift\``);
    }

}
