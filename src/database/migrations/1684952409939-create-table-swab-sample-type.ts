import { MigrationInterface, QueryRunner } from "typeorm";

export class createTableSwabSampleType1684952409939 implements MigrationInterface {
    name = 'createTableSwabSampleType1684952409939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`swab_sample_type\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`swab_sample_type_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_f142bf67e1f428276de133b1c4\` (\`swab_sample_type_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD \`swab_sample_type_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_test\` ADD CONSTRAINT \`FK_6403871903411a5eae9b9c76489\` FOREIGN KEY (\`swab_sample_type_id\`) REFERENCES \`swab_sample_type\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP FOREIGN KEY \`FK_6403871903411a5eae9b9c76489\``);
        await queryRunner.query(`ALTER TABLE \`swab_test\` DROP COLUMN \`swab_sample_type_id\``);
        await queryRunner.query(`DROP INDEX \`IDX_f142bf67e1f428276de133b1c4\` ON \`swab_sample_type\``);
        await queryRunner.query(`DROP TABLE \`swab_sample_type\``);
    }

}
