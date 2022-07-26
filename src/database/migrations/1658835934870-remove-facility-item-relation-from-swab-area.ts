import { MigrationInterface, QueryRunner } from "typeorm";

export class removeFacilityItemRelationFromSwabArea1658835934870 implements MigrationInterface {
    name = 'removeFacilityItemRelationFromSwabArea1658835934870'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area\` DROP FOREIGN KEY \`FK_72aa4d4c72758b89505b1d661ff\``);
        await queryRunner.query(`ALTER TABLE \`swab_area\` DROP COLUMN \`facility_item_id\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`swab_area\` ADD \`facility_item_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`swab_area\` ADD CONSTRAINT \`FK_72aa4d4c72758b89505b1d661ff\` FOREIGN KEY (\`facility_item_id\`) REFERENCES \`facility_item\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
