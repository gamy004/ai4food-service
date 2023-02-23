import { MigrationInterface, QueryRunner } from "typeorm";

export class addSwabPeriodToCleaningValidationTable1677161716665 implements MigrationInterface {
    name = 'addSwabPeriodToCleaningValidationTable1677161716665'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cleaning_validation\` ADD \`swab_period_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`cleaning_validation\` ADD CONSTRAINT \`FK_697995e2a17d0a33cb33799fac2\` FOREIGN KEY (\`swab_period_id\`) REFERENCES \`swab_period\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cleaning_validation\` DROP FOREIGN KEY \`FK_697995e2a17d0a33cb33799fac2\``);
        await queryRunner.query(`ALTER TABLE \`cleaning_validation\` DROP COLUMN \`swab_period_id\``);
    }

}
