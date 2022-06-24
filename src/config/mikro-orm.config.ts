// import { Scope } from '@nestjs/common';
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { LoadStrategy } from '@mikro-orm/core';

const config: MikroOrmModuleOptions = {
    entities: ['dist/**/entities/*.entity.js'], // path to our JS entities (dist), relative to `baseDir`
    entitiesTs: ['src/**/entities/*.entity.ts'], // path to our TS entities (source), relative to `baseDir`
    autoLoadEntities: true,
    metadataProvider: TsMorphMetadataProvider,
    loadStrategy: LoadStrategy.JOINED,
    registerRequestContext: false,
    highlighter: new SqlHighlighter(),
    migrations: {
        path: 'dist/migrations',
        pathTs: 'src/migrations',
    },
    // scope: Scope.REQUEST
};

export default config;