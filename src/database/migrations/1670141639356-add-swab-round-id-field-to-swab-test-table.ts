import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSwabRoundIdFieldToSwabTestTable1670141639356
  implements MigrationInterface
{
  name = 'addSwabRoundIdFieldToSwabTestTable1670141639356';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_test\` ADD \`swab_round_id\` bigint NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_test\` ADD CONSTRAINT \`FK_573c8c5c4d3345701a46ae31685\` FOREIGN KEY (\`swab_round_id\`) REFERENCES \`swab_round\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_test\` DROP FOREIGN KEY \`FK_573c8c5c4d3345701a46ae31685\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`swab_test\` DROP COLUMN \`swab_round_id\``,
    );
  }
}
