import { Inject, Injectable } from '@nestjs/common';
import { CreatePresignedPostDto } from './dto/create-presiged-post-dto';
import {
  GetObjectCommand,
  GetObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CreatePresignedUrlDto } from './dto/create-presiged-url-dto';
@Injectable()
export class S3ManagerService {
  constructor(@Inject('s3Client') private readonly s3Client: S3Client) {}

  //   async listBucketContents(bucket: string) {
  //     const response = await this.s3.listObjectsV2({ Bucket: bucket }).promise();

  //     return response.Contents.map(c => c.Key);
  //   }

  async createPresignedUrl(dto: CreatePresignedUrlDto) {
    const input: GetObjectCommandInput = {
      Bucket: process.env.AWS_S3_UPLOAD_BUCKET || 'web-upload-dev',
      Key: dto.key,
    };

    if (dto.fileName) {
      input.ResponseContentDisposition =
        'attachment; filename ="' + dto.fileName + '"';
    }

    const command = new GetObjectCommand(input);

    return await getSignedUrl(this.s3Client, command, { expiresIn: 600 });
  }

  async createPresignedPost(createPresignedPostDto: CreatePresignedPostDto) {
    return await createPresignedPost(this.s3Client, {
      Bucket: process.env.AWS_S3_UPLOAD_BUCKET || 'web-upload-dev',
      Key: createPresignedPostDto.key,
      Fields: {
        ContentType: createPresignedPostDto.contentType,
        ACL: 'bucket-owner-full-control',
      },
    });
  }
}
