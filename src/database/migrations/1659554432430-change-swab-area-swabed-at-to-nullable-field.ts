import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeSwabAreaSwabedAtToNullableField1659554432430
  implements MigrationInterface
{
  name = 'changeSwabAreaSwabedAtToNullableField1659554432430';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` CHANGE \`swab_area_swabed_at\` \`swab_area_swabed_at\` time NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`swab_area_history\` CHANGE \`swab_area_swabed_at\` \`swab_area_swabed_at\` time NOT NULL`,
    );
  }
}
