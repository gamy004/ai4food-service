import { Migration } from '@mikro-orm/migrations';

export class Migration20220624114144 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `user` (`id` varchar(255) not null, `created_at` datetime not null, `updated_at` datetime not null, `deleted_at` datetime null, `user_name` varchar(255) not null, `password` varchar(255) not null, `first_name` varchar(255) not null, `last_name` varchar(255) not null, `email` varchar(255) not null, `role` enum(\'admin\', \'user\') not null, `teams` text not null, primary key (`id`)) default character set utf8mb4 engine = InnoDB;');
  }

}
