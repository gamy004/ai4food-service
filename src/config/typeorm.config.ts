import { DataSourceOptions } from "typeorm";

const config: DataSourceOptions = {
    type: 'mysql',
    timezone: process.env.DATABASE_TIMEZONE || 'Z',
    url: process.env.DATABASE_URL || 'mysql://root:rootPassword@mysql:3306/default',
    debug: process.env.DATABASE_DEBUG !== undefined,
    logging: process.env.DATABASE_LOGGING !== undefined,
    entities: ['dist/**/entities/*.entity.js'], // path to our JS entities (dist), relative to `baseDir`,
    migrations: [
        'dist/migrations/*.js'
    ],
    migrationsRun: false,
    // migrations: {
    //     path: 'dist/migrations',
    //     pathTs: 'src/migrations',
    // },
    synchronize: false
    // scope: Scope.REQUEST
};

export default config;