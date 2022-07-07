import { MigrationInterface, QueryRunner } from "typeorm";

export class changeEnumFieldProductionScheduleToProductSchedule1657210300370 implements MigrationInterface {
    name = 'changeEnumFieldProductionScheduleToProductSchedule1657210300370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` CHANGE \`import_type\` \`import_type\` enum ('product_schedule', 'cleaning_plan', 'cleaning_room_history') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` CHANGE \`import_type\` \`import_type\` enum ('production_schedule', 'cleaning_plan', 'cleaning_room_history') NOT NULL`);
    }

}
