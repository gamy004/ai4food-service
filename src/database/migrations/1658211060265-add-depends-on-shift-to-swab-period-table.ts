import { MigrationInterface, QueryRunner } from "typeorm";

export class addDependsOnShiftToSwabPeriodTable1658211060265 implements MigrationInterface {
    name = 'addDependsOnShiftToSwabPeriodTable1658211060265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_period\` ADD \`depends_on_shift\` tinyint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_period\` DROP COLUMN \`depends_on_shift\``);
    }

}
