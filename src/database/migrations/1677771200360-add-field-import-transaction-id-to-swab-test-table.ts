import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldImportTransactionIdToSwabTestTable1677771200360 implements MigrationInterface {
    name = 'addFieldImportTransactionIdToSwabTestTable1677771200360'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_812f367be2d5f1afa41b5baccff\``);
        await queryRunner.query(`DROP INDEX \`REL_812f367be2d5f1afa41b5baccf\` ON \`swab_area_history\``);
        await queryRunner.query(`ALTER TABLE \`swab_period\` DROP COLUMN \`required_validate_cleaning\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`cleaning_history_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`import_transaction_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` CHANGE \`import_type\` \`import_type\` enum ('product_schedule', 'cleaning_plan', 'cleaning_room_history', 'swab_test') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD CONSTRAINT \`FK_560658cee84c25bea0ca556ff11\` FOREIGN KEY (\`import_transaction_id\`) REFERENCES \`import_transaction\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP FOREIGN KEY \`FK_560658cee84c25bea0ca556ff11\``);
        await queryRunner.query(`ALTER TABLE \`import_transaction\` CHANGE \`import_type\` \`import_type\` enum ('product_schedule', 'cleaning_plan', 'cleaning_room_history') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`import_transaction_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`cleaning_history_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_period\` ADD \`required_validate_cleaning\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_812f367be2d5f1afa41b5baccf\` ON \`swab_area_history\` (\`cleaning_history_id\`)`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_812f367be2d5f1afa41b5baccff\` FOREIGN KEY (\`cleaning_history_id\`) REFERENCES \`cleaning_history\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
