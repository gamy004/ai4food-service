import { DataSource } from "typeorm";

import typeormConfig from "../../config/typeorm.config";

const datasource = new DataSource({
    ...typeormConfig
});

export default datasource;