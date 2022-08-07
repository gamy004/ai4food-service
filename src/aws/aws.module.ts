// app.module.ts
import { Module } from '@nestjs/common';
import { s3Client } from './s3-client';
import { S3ManagerService } from './s3-manager.service';
import { S3Controller } from './s3.controller';

@Module({
    providers: [
        {
            provide: 's3Client',
            useValue: s3Client
        },
        S3ManagerService,
        S3Controller
    ],
    controllers: [
        S3Controller
    ],
    exports: [S3ManagerService],
})
export class AwsModule { }