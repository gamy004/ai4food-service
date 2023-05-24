import { MigrationInterface, QueryRunner } from "typeorm";

export class createTableSwabSampleType1684949102721 implements MigrationInterface {
    name = 'createTableSwabSampleType1684949102721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`swab_sample_type\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_sample_type_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_f142bf67e1f428276de133b1c4\` (\`swab_sample_type_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD \`swab_sample_type_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` ADD CONSTRAINT \`FK_f17ea3980630d2dfb1d597e10b9\` FOREIGN KEY (\`swab_sample_type_id\`) REFERENCES \`swab_sample_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP FOREIGN KEY \`FK_f17ea3980630d2dfb1d597e10b9\``);
        await queryRunner.query(`ALTER TABLE \`swab_product_history\` DROP COLUMN \`swab_sample_type_id\``);
        await queryRunner.query(`DROP INDEX \`IDX_f142bf67e1f428276de133b1c4\` ON \`swab_sample_type\``);
        await queryRunner.query(`DROP TABLE \`swab_sample_type\``);
    }

}
