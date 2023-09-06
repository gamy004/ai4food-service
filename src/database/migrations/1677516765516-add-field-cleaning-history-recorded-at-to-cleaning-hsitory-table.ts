import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldCleaningHistoryRecordedAtToCleaningHsitoryTable1677516765516
  implements MigrationInterface
{
  name = 'addFieldCleaningHistoryRecordedAtToCleaningHsitoryTable1677516765516';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history\` ADD \`cleaning_history_recorded_at\` timestamp NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history\` DROP COLUMN \`cleaning_history_recorded_at\``,
    );
  }
}
