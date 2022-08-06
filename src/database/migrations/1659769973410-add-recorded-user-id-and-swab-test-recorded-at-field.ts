import { MigrationInterface, QueryRunner } from "typeorm";

export class addRecordedUserIdAndSwabTestRecordedAtField1659769973410 implements MigrationInterface {
    name = 'addRecordedUserIdAndSwabTestRecordedAtField1659769973410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`swab_test_recorded_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`recorded_user_ind\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`recorded_user_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`recorded_user_ind\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD \`recorded_user_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD \`recorded_user_ind\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD \`recorded_user_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD CONSTRAINT \`FK_83bc153b0c3652eac6a5f53e9c6\` FOREIGN KEY (\`recorded_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` ADD CONSTRAINT \`FK_912434d7dcebb63af2bbcd0fc47\` FOREIGN KEY (\`recorded_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD CONSTRAINT \`FK_640a4ab1b74a94c8e501c8c146b\` FOREIGN KEY (\`recorded_user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP FOREIGN KEY \`FK_640a4ab1b74a94c8e501c8c146b\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP FOREIGN KEY \`FK_912434d7dcebb63af2bbcd0fc47\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP FOREIGN KEY \`FK_83bc153b0c3652eac6a5f53e9c6\``);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP COLUMN \`recorded_user_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP COLUMN \`recorded_user_ind\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`recorded_user_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history\` DROP COLUMN \`recorded_user_ind\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`recorded_user_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`recorded_user_ind\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`swab_test_recorded_at\``);
    }

}
