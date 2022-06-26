import { MigrationInterface, QueryRunner } from "typeorm";

export class createImportTransactionsTable1656250863811 implements MigrationInterface {
    name = 'createImportTransactionsTable1656250863811'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`import_transaction\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`transaction_number\` varchar(255) NOT NULL, \`import_type\` enum ('admin', 'user') NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`import_transaction\``);
    }

}
