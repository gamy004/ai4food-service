import { MigrationInterface, QueryRunner } from "typeorm";

export class changeSwabAreaImageToSwabAreaHistoryImageTable1658209889245 implements MigrationInterface {
    name = 'changeSwabAreaImageToSwabAreaHistoryImageTable1658209889245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`swab_area_history_image\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_area_history_image_url\` text NOT NULL, \`swab_area_history_image_description\` text NULL, \`swab_area_history_id\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`swab_area_history_image\` ADD CONSTRAINT \`FK_53b71156bad42caa95e2fb5a0a1\` FOREIGN KEY (\`swab_area_history_id\`) REFERENCES \`swab_area_history\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area_history_image\` DROP FOREIGN KEY \`FK_53b71156bad42caa95e2fb5a0a1\``);
        await queryRunner.query(`DROP TABLE \`swab_area_history_image\``);
    }

}
