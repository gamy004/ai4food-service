import { MigrationInterface, QueryRunner } from "typeorm";

export class addIsLostAndLostReasonFieldsToSwabTestTable1683041286655 implements MigrationInterface {
    name = 'addIsLostAndLostReasonFieldsToSwabTestTable1683041286655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_c824e6c68fbec3e84f14d97d92\` ON \`import_transaction\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`is_lost\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`lost_reason\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`lost_reason\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`is_lost\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_c824e6c68fbec3e84f14d97d92\` ON \`import_transaction\` (\`imported_file_id\`)`);
    }

}
