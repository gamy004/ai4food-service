import { MigrationInterface, QueryRunner } from "typeorm";

export class addIsReportedAndReportReasonFieldsToSwabTestTable1683045284399 implements MigrationInterface {
    name = 'addIsReportedAndReportReasonFieldsToSwabTestTable1683045284399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_c824e6c68fbec3e84f14d97d92\` ON \`import_transaction\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`is_reported\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`report_reason\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`report_reason\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`is_reported\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_c824e6c68fbec3e84f14d97d92\` ON \`import_transaction\` (\`imported_file_id\`)`);
    }

}
