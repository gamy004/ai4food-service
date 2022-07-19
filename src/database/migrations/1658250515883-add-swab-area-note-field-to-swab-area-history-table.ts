import { MigrationInterface, QueryRunner } from "typeorm";

export class addSwabAreaNoteFieldToSwabAreaHistoryTable1658250515883 implements MigrationInterface {
    name = 'addSwabAreaNoteFieldToSwabAreaHistoryTable1658250515883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`swab_area_note\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`swab_area_note\``);
    }

}
