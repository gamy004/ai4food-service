import { Controller, Post, Body, Param, Put, Get, Query } from '@nestjs/common';
import { ImportTransactionService } from './services/import-transaction.service';
import { CreateImportTransactionDto } from './dto/create-import-transaction.dto';
import { ParamImportTransactionDto } from './dto/param-import-transaction.dto';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { AuthUser } from '~/auth/decorators/auth-user.decorator';
import { User } from '~/auth/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { FilterImportTransactionDto } from './dto/filter-import-transaction.dto';
import { ImportTransactionQueryService } from './services/import-transaction-query.service';
import { UpdateImportTransactionDto } from './dto/update-import-transaction.dto';
import { FileService } from '~/common/services/file.service';
import { ImportTransaction } from './entities/import-transaction.entity';

@Controller('import-transaction')
@ApiTags('Importing')
export class ImportTransactionController {
  constructor(
    private readonly fileService: FileService,
    private readonly importTransactionService: ImportTransactionService,
    private readonly importTransactionQueryService: ImportTransactionQueryService,
  ) {}

  @Authenticated()
  @Get()
  load(@Query() dto: FilterImportTransactionDto) {
    return this.importTransactionQueryService.query(dto);
  }

  @Authenticated()
  @Post()
  create(
    @AuthUser() importedUser: User,
    @Body() createImportTransactionDto: CreateImportTransactionDto,
  ) {
    createImportTransactionDto.importedUser = importedUser;

    return this.importTransactionService.create(createImportTransactionDto);
  }

  @Authenticated()
  @Put(':id')
  async update(
    @Param() params: ParamImportTransactionDto,
    @Body() body: UpdateImportTransactionDto,
  ): Promise<ImportTransaction> {
    const importTransaction =
      await this.importTransactionService.findOneByOrFail({ id: params.id });

    console.log(importTransaction);

    if (body.importedFileName) {
      importTransaction.importedFileName = body.importedFileName;
    }

    if (body.importedFileUrl) {
      importTransaction.importedFileUrl = body.importedFileUrl;
    }

    if (body.importedFile) {
      importTransaction.importedFile = this.fileService.make(body.importedFile);
    }

    return this.importTransactionService.save(importTransaction);
  }

  @Authenticated()
  @Put(':id/complete')
  complete(@Param() params: ParamImportTransactionDto) {
    return this.importTransactionService.complete(params.id);
  }

  @Authenticated()
  @Put(':id/cancel')
  cancel(@Param() params: ParamImportTransactionDto) {
    return this.importTransactionService.cancel(params.id);
  }
}
