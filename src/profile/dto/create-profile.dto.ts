import { ApiExtraModels } from '@nestjs/swagger';
import { ConnectUserDto } from '../../user/dto/connect-user.dto';

export class CreateProfileUserRelationInputDto {
  connect: ConnectUserDto;
}

@ApiExtraModels(ConnectUserDto, CreateProfileUserRelationInputDto)
export class CreateProfileDto {
  bio?: string;
  user: CreateProfileUserRelationInputDto;
}
