import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldShiftToProductScheduleTable1669138341535 implements MigrationInterface {
    name = 'addFieldShiftToProductScheduleTable1669138341535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_schedule\` ADD \`shift\` enum ('day', 'night') NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_schedule\` DROP COLUMN \`shift\``);
    }

}
