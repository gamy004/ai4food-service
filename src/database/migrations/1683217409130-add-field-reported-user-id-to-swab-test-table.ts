import { MigrationInterface, QueryRunner } from "typeorm";

export class addFieldReportedUserIdToSwabTestTable1683217409130 implements MigrationInterface {
    name = 'addFieldReportedUserIdToSwabTestTable1683217409130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`reported_user_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD CONSTRAINT \`FK_399b7a27f16927ec296971c56b6\` FOREIGN KEY (\`reported_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP FOREIGN KEY \`FK_399b7a27f16927ec296971c56b6\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`reported_user_id\``);
    }

}
