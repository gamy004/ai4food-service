import { MigrationInterface, QueryRunner } from 'typeorm';

export class removeUniqueFieldFromProductTable1664449835012
  implements MigrationInterface
{
  name = 'removeUniqueFieldFromProductTable1664449835012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_3d4628fd27bebc45bb276c3ae3\` ON \`product\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_fb912a8e66bfe036057ba4651f\` ON \`product\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_fb912a8e66bfe036057ba4651f\` ON \`product\` (\`product_code\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_3d4628fd27bebc45bb276c3ae3\` ON \`product\` (\`alternate_product_code\`)`,
    );
  }
}
