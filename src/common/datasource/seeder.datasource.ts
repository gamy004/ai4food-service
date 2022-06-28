import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import typeormConfig from "../../config/typeorm.config";

(async () => {
    const options: DataSourceOptions & SeederOptions = {
        ...typeormConfig,
        migrationsRun: false,
        seeds: ["dist/database/seeders/*.js"],
        factories: ["dist/database/factories/*.js"]
    };

    console.log("===========Start Seeding!!!===========");

    const dataSource = new DataSource(options);

    await dataSource.initialize();

    await dataSource.runMigrations();

    await runSeeders(dataSource);

    await dataSource.destroy();

    console.log("===========Finish Seeding!!!===========");

    process.exit(1);
})();