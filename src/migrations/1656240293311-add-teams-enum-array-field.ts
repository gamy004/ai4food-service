import { MigrationInterface, QueryRunner } from "typeorm";

export class addTeamsEnumArrayField1656240293311 implements MigrationInterface {
    name = 'addTeamsEnumArrayField1656240293311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`teams\` enum array ('admin', 'qa', 'lab', 'production', 'worker') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`teams\``);
    }

}
