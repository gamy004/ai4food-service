import { MigrationInterface, QueryRunner } from "typeorm";

export class changeEnumValuesImportTypeFieldInTableImportTransactions1656256823812 implements MigrationInterface {
    name = 'changeEnumValuesImportTypeFieldInTableImportTransactions1656256823812'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` CHANGE \`import_type\` \`import_type\` enum ('productSchedule', 'cleaningPlan') NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`import_transaction\` CHANGE \`import_type\` \`import_type\` enum ('admin', 'user') NULL`);
    }

}
