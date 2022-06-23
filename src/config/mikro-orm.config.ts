export default {
    entities: [], // no need for `entitiesTs` this way
    dbName: process.env.DATABASE_NAME,
    type: process.env.DATABASE_TYPE, // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
};