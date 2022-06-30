import { DataSource } from "typeorm";

import typeormConfig from "../../database/config/typeorm.config";

const datasource = new DataSource({
    ...typeormConfig
});

export default datasource;