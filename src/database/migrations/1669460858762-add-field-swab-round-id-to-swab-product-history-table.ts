import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldSwabRoundIdToSwabProductHistoryTable1669460858762 implements MigrationInterface {
    name = 'addFieldSwabRoundIdToSwabProductHistoryTable1669460858762'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD \`swab_round_id\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD CONSTRAINT \`FK_a0d940a6be6acc39aa115fd55e9\` FOREIGN KEY (\`swab_round_id\`) REFERENCES \`swab_round\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP FOREIGN KEY \`FK_a0d940a6be6acc39aa115fd55e9\``);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP COLUMN \`swab_round_id\``);
    }

}
