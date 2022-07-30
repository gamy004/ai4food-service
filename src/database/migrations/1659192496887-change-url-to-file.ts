import { MigrationInterface, QueryRunner } from "typeorm";

export class changeUrlToFile1659192496887 implements MigrationInterface {
    name = 'changeUrlToFile1659192496887'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history_image\` CHANGE \`swab_area_history_image_url\` \`file_id\` text NOT NULL`);
        await queryRunner.query(`CREATE TABLE \`file\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`file_key\` text NOT NULL, \`file_name\` varchar(255) NOT NULL, \`file_source\` text NOT NULL, \`file_content_type\` varchar(255) NOT NULL, \`file_size\` int NOT NULL, \`user_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_image\` DROP COLUMN \`file_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_image\` ADD \`file_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_image\` ADD UNIQUE INDEX \`IDX_439991ba4e96d7868a5b9466a8\` (\`file_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_439991ba4e96d7868a5b9466a8\` ON \`swab_area_history_image\` (\`file_id\`)`);
        await queryRunner.query(`ALTER TABLE \`file\` ADD CONSTRAINT \`FK_516f1cf15166fd07b732b4b6ab0\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_image\` ADD CONSTRAINT \`FK_439991ba4e96d7868a5b9466a82\` FOREIGN KEY (\`file_id\`) REFERENCES \`file\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history_image\` DROP FOREIGN KEY \`FK_439991ba4e96d7868a5b9466a82\``);
        await queryRunner.query(`ALTER TABLE \`file\` DROP FOREIGN KEY \`FK_516f1cf15166fd07b732b4b6ab0\``);
        await queryRunner.query(`DROP INDEX \`REL_439991ba4e96d7868a5b9466a8\` ON \`swab_area_history_image\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_image\` DROP INDEX \`IDX_439991ba4e96d7868a5b9466a8\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_image\` DROP COLUMN \`file_id\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_image\` ADD \`file_id\` text NOT NULL`);
        await queryRunner.query(`DROP TABLE \`file\``);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_image\` CHANGE \`file_id\` \`swab_area_history_image_url\` text NOT NULL`);
    }

}
