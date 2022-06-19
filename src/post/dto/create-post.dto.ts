import { ApiExtraModels } from '@nestjs/swagger';
import { ConnectUserDto } from '../../user/dto/connect-user.dto';

export class CreatePostAuthorRelationInputDto {
  connect: ConnectUserDto;
}

@ApiExtraModels(ConnectUserDto, CreatePostAuthorRelationInputDto)
export class CreatePostDto {
  title: string;
  content?: string;
  published?: boolean;
  author?: CreatePostAuthorRelationInputDto;
}
