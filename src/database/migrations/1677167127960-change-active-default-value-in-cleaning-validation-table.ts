import { MigrationInterface, QueryRunner } from "typeorm";

export class changeActiveDefaultValueInCleaningValidationTable1677167127960 implements MigrationInterface {
    name = 'changeActiveDefaultValueInCleaningValidationTable1677167127960'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cleaning_validation\` CHANGE \`active\` \`active\` tinyint NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cleaning_validation\` CHANGE \`active\` \`active\` tinyint NOT NULL DEFAULT '0'`);
    }

}
