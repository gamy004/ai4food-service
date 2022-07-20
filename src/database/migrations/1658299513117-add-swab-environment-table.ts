import { MigrationInterface, QueryRunner } from "typeorm";

export class addSwabEnvironmentTable1658299513117 implements MigrationInterface {
    name = 'addSwabEnvironmentTable1658299513117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`swab_environment\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_environment_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_4f14fa352abc1aaf150d050a2b\` (\`swab_environment_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`swab_environment_id\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD UNIQUE INDEX \`IDX_a725747f2e8b26ddcee94307ec\` (\`swab_environment_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_a725747f2e8b26ddcee94307ec\` ON \`swab_area_history\` (\`swab_environment_id\`)`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_a725747f2e8b26ddcee94307ece\` FOREIGN KEY (\`swab_environment_id\`) REFERENCES \`swab_environment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_a725747f2e8b26ddcee94307ece\``);
        await queryRunner.query(`DROP INDEX \`REL_a725747f2e8b26ddcee94307ec\` ON \`swab_area_history\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP INDEX \`IDX_a725747f2e8b26ddcee94307ec\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`swab_environment_id\``);
        await queryRunner.query(`DROP INDEX \`IDX_4f14fa352abc1aaf150d050a2b\` ON \`swab_environment\``);
        await queryRunner.query(`DROP TABLE \`swab_environment\``);
    }

}
