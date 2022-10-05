import { PresignedPost } from '@aws-sdk/s3-presigned-post';
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePresignedPostDto } from './dto/create-presiged-post-dto';
import { S3ManagerService } from './s3-manager.service';

@Controller('s3')
@ApiTags('AWS')
export class S3Controller {
  constructor(private readonly s3Manager: S3ManagerService) {}

  @Post('presigned')
  createPresignedPost(
    @Body() createPresignedPostDto: CreatePresignedPostDto,
  ): Promise<PresignedPost> {
    return this.s3Manager.createPresignedPost(createPresignedPostDto);
  }
}
