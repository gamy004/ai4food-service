import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFieldsFullTimestampForProductScheduleTable1669130526614
  implements MigrationInterface
{
  name = 'addFieldsFullTimestampForProductScheduleTable1669130526614';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_schedule\` ADD \`product_schedule_started_at_timestamp\` timestamp NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_schedule\` ADD \`product_schedule_ended_at_timestamp\` timestamp NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_schedule\` DROP COLUMN \`product_schedule_ended_at_timestamp\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_schedule\` DROP COLUMN \`product_schedule_started_at_timestamp\``,
    );
  }
}
