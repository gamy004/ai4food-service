import { MigrationInterface, QueryRunner } from "typeorm";

export class changeTypeIdSwabEnvironmentToUid1658305682583 implements MigrationInterface {
    name = 'changeTypeIdSwabEnvironmentToUid1658305682583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_a725747f2e8b26ddcee94307ec\` ON \`swab_area_history\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_a725747f2e8b26ddcee94307ece\``);
        await queryRunner.query(`ALTER TABLE \`swab_environment\` CHANGE \`id\` \`id\` bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_environment\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`swab_environment\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`swab_environment\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`);
        await queryRunner.query(`DROP INDEX \`REL_a725747f2e8b26ddcee94307ec\` ON \`swab_area_history\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`swab_environment_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`swab_environment_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD UNIQUE INDEX \`IDX_a725747f2e8b26ddcee94307ec\` (\`swab_environment_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_a725747f2e8b26ddcee94307ec\` ON \`swab_area_history\` (\`swab_environment_id\`)`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_a725747f2e8b26ddcee94307ece\` FOREIGN KEY (\`swab_environment_id\`) REFERENCES \`swab_environment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_a725747f2e8b26ddcee94307ece\``);
        await queryRunner.query(`DROP INDEX \`REL_a725747f2e8b26ddcee94307ec\` ON \`swab_area_history\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP INDEX \`IDX_a725747f2e8b26ddcee94307ec\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`swab_environment_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`swab_environment_id\` bigint NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_a725747f2e8b26ddcee94307ec\` ON \`swab_area_history\` (\`swab_environment_id\`)`);
        await queryRunner.query(`ALTER TABLE \`swab_environment\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`swab_environment\` ADD \`id\` bigint NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`swab_environment\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`swab_environment\` CHANGE \`id\` \`id\` bigint NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_a725747f2e8b26ddcee94307ece\` FOREIGN KEY (\`swab_environment_id\`) REFERENCES \`swab_environment\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_a725747f2e8b26ddcee94307ec\` ON \`swab_area_history\` (\`swab_environment_id\`)`);
    }

}
