import { Migration } from '@mikro-orm/migrations';

export class Migration20220624064930 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `user` (`id` varchar(255) not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists `user`;');
  }

}
