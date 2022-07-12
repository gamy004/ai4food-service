import { MigrationInterface, QueryRunner } from "typeorm";

export class addEnumValueSwabInUserTeamEnum1657539976754 implements MigrationInterface {
    name = 'addEnumValueSwabInUserTeamEnum1657539976754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`team\` enum ('admin', 'qa', 'swab', 'lab', 'production') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`team\``);
    }

}
