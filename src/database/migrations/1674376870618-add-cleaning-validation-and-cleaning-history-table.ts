import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCleaningValidationAndCleaningHistoryTable1674376870618
  implements MigrationInterface
{
  name = 'addCleaningValidationAndCleaningHistoryTable1674376870618';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`cleaning_history\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`cleaning_history_started_at\` timestamp NOT NULL, \`cleaning_history_ended_at\` timestamp NOT NULL, \`cleaning_program_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`cleaning_validation\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`cleaning_validation_name\` varchar(255) NOT NULL, \`cleaning_validation_description\` text NULL, \`active\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`cleaning_history_cleaning_validation\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`cleaning_history_id\` varchar(36) NOT NULL, \`cleaning_validation_id\` varchar(36) NOT NULL, \`pass\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` ADD \`cleaning_history_id\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` ADD UNIQUE INDEX \`IDX_812f367be2d5f1afa41b5baccf\` (\`cleaning_history_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_812f367be2d5f1afa41b5baccf\` ON \`swab_area_history\` (\`cleaning_history_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_812f367be2d5f1afa41b5baccff\` FOREIGN KEY (\`cleaning_history_id\`) REFERENCES \`cleaning_history\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history\` ADD CONSTRAINT \`FK_cd760c81ba55896b606e8cd087f\` FOREIGN KEY (\`cleaning_program_id\`) REFERENCES \`cleaning_program\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history_cleaning_validation\` ADD CONSTRAINT \`FK_62e23eb8a9346c123450aef4386\` FOREIGN KEY (\`cleaning_history_id\`) REFERENCES \`cleaning_history\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history_cleaning_validation\` ADD CONSTRAINT \`FK_a96116d04d1b0460ca345c7e868\` FOREIGN KEY (\`cleaning_validation_id\`) REFERENCES \`cleaning_validation\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history_cleaning_validation\` DROP FOREIGN KEY \`FK_a96116d04d1b0460ca345c7e868\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history_cleaning_validation\` DROP FOREIGN KEY \`FK_62e23eb8a9346c123450aef4386\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cleaning_history\` DROP FOREIGN KEY \`FK_cd760c81ba55896b606e8cd087f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_812f367be2d5f1afa41b5baccff\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_812f367be2d5f1afa41b5baccf\` ON \`swab_area_history\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` DROP INDEX \`IDX_812f367be2d5f1afa41b5baccf\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` DROP COLUMN \`cleaning_history_id\``,
    );
    await queryRunner.query(
      `DROP TABLE \`cleaning_history_cleaning_validation\``,
    );
    await queryRunner.query(`DROP TABLE \`cleaning_validation\``);
    await queryRunner.query(`DROP TABLE \`cleaning_history\``);
  }
}
