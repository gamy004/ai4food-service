import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSwabPeriodToCleaningValidationTable1677169051256
  implements MigrationInterface
{
  name = 'addSwabPeriodToCleaningValidationTable1677169051256';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`swab_period_cleaning_validations_cleaning_validation\` (\`swab_period_id\` varchar(36) NOT NULL, \`cleaning_validation_id\` varchar(36) NOT NULL, INDEX \`IDX_5822b55934018f7c0ce3c7975b\` (\`swab_period_id\`), INDEX \`IDX_f8d66adab9cd0dcd9df0305bef\` (\`cleaning_validation_id\`), PRIMARY KEY (\`swab_period_id\`, \`cleaning_validation_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cleaning_validation\` CHANGE \`active\` \`active\` tinyint NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_period_cleaning_validations_cleaning_validation\` ADD CONSTRAINT \`FK_5822b55934018f7c0ce3c7975b0\` FOREIGN KEY (\`swab_period_id\`) REFERENCES \`swab_period\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_period_cleaning_validations_cleaning_validation\` ADD CONSTRAINT \`FK_f8d66adab9cd0dcd9df0305befe\` FOREIGN KEY (\`cleaning_validation_id\`) REFERENCES \`cleaning_validation\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_period_cleaning_validations_cleaning_validation\` DROP FOREIGN KEY \`FK_f8d66adab9cd0dcd9df0305befe\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_period_cleaning_validations_cleaning_validation\` DROP FOREIGN KEY \`FK_5822b55934018f7c0ce3c7975b0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cleaning_validation\` CHANGE \`active\` \`active\` tinyint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_f8d66adab9cd0dcd9df0305bef\` ON \`swab_period_cleaning_validations_cleaning_validation\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_5822b55934018f7c0ce3c7975b\` ON \`swab_period_cleaning_validations_cleaning_validation\``,
    );
    await queryRunner.query(
      `DROP TABLE \`swab_period_cleaning_validations_cleaning_validation\``,
    );
  }
}
