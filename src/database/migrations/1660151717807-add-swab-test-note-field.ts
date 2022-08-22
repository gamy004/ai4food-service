import { MigrationInterface, QueryRunner } from "typeorm";

export class addSwabTestNoteField1660151717807 implements MigrationInterface {
    name = 'addSwabTestNoteField1660151717807'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`swab_test_note\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`swab_test_note\``);
    }

}
