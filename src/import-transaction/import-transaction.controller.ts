import { Controller, Post, Body, Param, Put } from '@nestjs/common';
import { ImportTransactionService } from './import-transaction.service';
import { CreateImportTransactionDto } from './dto/create-import-transaction.dto';
import { ParamImportTransactionDto } from './dto/param-import-transaction.dto';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { AuthUser } from '~/auth/decorators/auth-user.decorator';
import { User } from '~/auth/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('import-transaction')
@ApiTags('Importing')
export class ImportTransactionController {
  constructor(
    private readonly importTransactionService: ImportTransactionService,
  ) {}

  @Authenticated()
  @Post()
  create(
    @AuthUser() importedUser: User,
    @Body() createImportTransactionDto: CreateImportTransactionDto,
  ) {
    createImportTransactionDto.importedUser = importedUser;

    return this.importTransactionService.create(createImportTransactionDto);
  }

  @Put(':id/complete')
  complete(@Param() params: ParamImportTransactionDto) {
    return this.importTransactionService.complete(params.id);
  }

  @Put(':id/cancel')
  cancel(@Param() params: ParamImportTransactionDto) {
    return this.importTransactionService.cancel(params.id);
  }
}
