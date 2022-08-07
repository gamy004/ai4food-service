import { MigrationInterface, QueryRunner } from "typeorm";

export class removeFieldListeriaMonoDetectedFromSwabTestTable1659630710776 implements MigrationInterface {
    name = 'removeFieldListeriaMonoDetectedFromSwabTestTable1659630710776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`listeria_mono_detected\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`listeria_mono_value\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`listeria_mono_value\` float NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`listeria_mono_detected\` tinyint NULL`);
    }

}
