import { MigrationInterface, QueryRunner } from "typeorm";

export class createSwabPeriodTable1657985353492 implements MigrationInterface {
    name = 'createSwabPeriodTable1657985353492'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`swab_period\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_period_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_882badc02340dcc2472f33027e\` (\`swab_period_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_882badc02340dcc2472f33027e\` ON \`swab_period\``);
        await queryRunner.query(`DROP TABLE \`swab_period\``);
    }

}
