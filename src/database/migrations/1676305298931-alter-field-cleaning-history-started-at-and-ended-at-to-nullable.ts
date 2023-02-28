import { MigrationInterface, QueryRunner } from "typeorm";

export class alterFieldCleaningHistoryStartedAtAndEndedAtToNullable1676305298931 implements MigrationInterface {
    name = 'alterFieldCleaningHistoryStartedAtAndEndedAtToNullable1676305298931'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cleaning_history\` CHANGE \`cleaning_history_started_at\` \`cleaning_history_started_at\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`cleaning_history\` CHANGE \`cleaning_history_ended_at\` \`cleaning_history_ended_at\` timestamp NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cleaning_history\` CHANGE \`cleaning_history_ended_at\` \`cleaning_history_ended_at\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`cleaning_history\` CHANGE \`cleaning_history_started_at\` \`cleaning_history_started_at\` timestamp NOT NULL`);
    }

}
