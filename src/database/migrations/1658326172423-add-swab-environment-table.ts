import { MigrationInterface, QueryRunner } from "typeorm";

export class addSwabEnvironmentTable1658326172423 implements MigrationInterface {
    name = 'addSwabEnvironmentTable1658326172423'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`swab_environment\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_environment_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_4f14fa352abc1aaf150d050a2b\` (\`swab_environment_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`swab_area_history_swab_environments_swab_environment\` (\`swab_area_history_id\` varchar(36) NOT NULL, \`swab_environment_id\` varchar(36) NOT NULL, INDEX \`IDX_2d8c0485d2b349120ef3570d1f\` (\`swab_area_history_id\`), INDEX \`IDX_91131c9ab12f4257151b7aae24\` (\`swab_environment_id\`), PRIMARY KEY (\`swab_area_history_id\`, \`swab_environment_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_swab_environments_swab_environment\` ADD CONSTRAINT \`FK_2d8c0485d2b349120ef3570d1f9\` FOREIGN KEY (\`swab_area_history_id\`) REFERENCES \`swab_area_history\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_swab_environments_swab_environment\` ADD CONSTRAINT \`FK_91131c9ab12f4257151b7aae243\` FOREIGN KEY (\`swab_environment_id\`) REFERENCES \`swab_environment\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history_swab_environments_swab_environment\` DROP FOREIGN KEY \`FK_91131c9ab12f4257151b7aae243\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_swab_environments_swab_environment\` DROP FOREIGN KEY \`FK_2d8c0485d2b349120ef3570d1f9\``);
        await queryRunner.query(`DROP INDEX \`IDX_91131c9ab12f4257151b7aae24\` ON \`swab_area_history_swab_environments_swab_environment\``);
        await queryRunner.query(`DROP INDEX \`IDX_2d8c0485d2b349120ef3570d1f\` ON \`swab_area_history_swab_environments_swab_environment\``);
        await queryRunner.query(`DROP TABLE \`swab_area_history_swab_environments_swab_environment\``);
        await queryRunner.query(`DROP INDEX \`IDX_4f14fa352abc1aaf150d050a2b\` ON \`swab_environment\``);
        await queryRunner.query(`DROP TABLE \`swab_environment\``);
    }

}
