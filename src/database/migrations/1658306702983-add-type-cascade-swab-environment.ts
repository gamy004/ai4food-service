import { MigrationInterface, QueryRunner } from "typeorm";

export class addTypeCascadeSwabEnvironment1658306702983 implements MigrationInterface {
    name = 'addTypeCascadeSwabEnvironment1658306702983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_a725747f2e8b26ddcee94307ec\` ON \`swab_area_history\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_a725747f2e8b26ddcee94307ec\` ON \`swab_area_history\` (\`swab_environment_id\`)`);
    }

}
