import { MigrationInterface, QueryRunner } from "typeorm";

export class addRunningNumberTable1660841923962 implements MigrationInterface {
    name = 'addRunningNumberTable1660841923962'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`running_number\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`key\` varchar(255) NOT NULL, \`latest_running_number\` int NOT NULL, UNIQUE INDEX \`IDX_eab27f248e2b70339f261fcd48\` (\`key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_eab27f248e2b70339f261fcd48\` ON \`running_number\``);
        await queryRunner.query(`DROP TABLE \`running_number\``);
    }

}
