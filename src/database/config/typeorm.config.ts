import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const config: DataSourceOptions = {
  type: 'mysql',
  timezone: process.env.DATABASE_TIMEZONE,
  url:
    process.env.DATABASE_URL || 'mysql://root:rootPassword@mysql:3306/default',
  debug: process.env.DATABASE_DEBUG === 'true' || false,
  logging: process.env.DATABASE_LOGGING === 'true' || false,
  entities: ['dist/**/entities/*.entity.js'], // path to our JS entities (dist), relative to `baseDir`,
  migrations: ['dist/database/migrations/*.js'],
  migrationsRun: process.env.DATABASE_MIGRATE_ON_START === 'true' || false,
  supportBigNumbers: true,
  // migrationsTransactionMode: 'all',
  // migrations: {
  //     path: 'dist/migrations',
  //     pathTs: 'src/migrations',
  // },
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
  // scope: Scope.REQUEST
};

export default config;
