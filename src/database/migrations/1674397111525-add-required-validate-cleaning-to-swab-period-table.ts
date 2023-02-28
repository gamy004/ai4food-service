import { MigrationInterface, QueryRunner } from "typeorm";

export class addRequiredValidateCleaningToSwabPeriodTable1674397111525 implements MigrationInterface {
    name = 'addRequiredValidateCleaningToSwabPeriodTable1674397111525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_812f367be2d5f1afa41b5baccf\` ON \`swab_area_history\``);
        await queryRunner.query(`ALTER TABLE \`swab_period\` ADD \`required_validate_cleaning\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_period\` DROP COLUMN \`required_validate_cleaning\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_812f367be2d5f1afa41b5baccf\` ON \`swab_area_history\` (\`cleaning_history_id\`)`);
    }

}
