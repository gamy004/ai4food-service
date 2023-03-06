import { MigrationInterface, QueryRunner } from "typeorm";

export class addSwabCleaningValidationTable1677991755152 implements MigrationInterface {
    name = 'addSwabCleaningValidationTable1677991755152'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`swab_cleaning_validation\` (\`cleaning_validation_id\` varchar(36) NOT NULL, \`swab_period_id\` varchar(36) NOT NULL, \`swab_area_id\` varchar(36) NOT NULL, PRIMARY KEY (\`cleaning_validation_id\`, \`swab_period_id\`, \`swab_area_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`swab_cleaning_validation\` ADD CONSTRAINT \`FK_b8523e9471f0d0115e7b8226088\` FOREIGN KEY (\`cleaning_validation_id\`) REFERENCES \`cleaning_validation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_cleaning_validation\` ADD CONSTRAINT \`FK_46624c3433dfc49a880d98c34e9\` FOREIGN KEY (\`swab_period_id\`) REFERENCES \`swab_period\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`swab_cleaning_validation\` ADD CONSTRAINT \`FK_8ef3fe71f463d2dcf87f9a39722\` FOREIGN KEY (\`swab_area_id\`) REFERENCES \`swab_area\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_cleaning_validation\` DROP FOREIGN KEY \`FK_8ef3fe71f463d2dcf87f9a39722\``);
        await queryRunner.query(`ALTER TABLE \`swab_cleaning_validation\` DROP FOREIGN KEY \`FK_46624c3433dfc49a880d98c34e9\``);
        await queryRunner.query(`ALTER TABLE \`swab_cleaning_validation\` DROP FOREIGN KEY \`FK_b8523e9471f0d0115e7b8226088\``);
        await queryRunner.query(`DROP TABLE \`swab_cleaning_validation\``);
    }

}
