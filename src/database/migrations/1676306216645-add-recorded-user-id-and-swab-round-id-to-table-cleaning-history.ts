import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRecordedUserIdAndSwabRoundIdToTableCleaningHistory1676306216645
  implements MigrationInterface
{
  name = 'addRecordedUserIdAndSwabRoundIdToTableCleaningHistory1676306216645';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history\` ADD \`recorded_user_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history\` ADD \`swab_round_id\` bigint NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history\` ADD CONSTRAINT \`FK_5d9c701fe5c6b72ae23a6c218d3\` FOREIGN KEY (\`recorded_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history\` ADD CONSTRAINT \`FK_b6fdfab156bf7e859230b21d3a4\` FOREIGN KEY (\`swab_round_id\`) REFERENCES \`swab_round\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history\` DROP FOREIGN KEY \`FK_b6fdfab156bf7e859230b21d3a4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history\` DROP FOREIGN KEY \`FK_5d9c701fe5c6b72ae23a6c218d3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history\` DROP COLUMN \`swab_round_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history\` DROP COLUMN \`recorded_user_id\``,
    );
  }
}
