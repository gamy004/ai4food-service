import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  Query,
  Put,
  Param,
  ForbiddenException,
  Delete,
} from '@nestjs/common';
import { DataCollectorImporterInterface } from '~/data-collector/interface/data-collector-importer-interface';
import { ImportTransactionService } from '~/import-transaction/import-transaction.service';
import { ApiTags } from '@nestjs/swagger';
import { ImportProductScheduleDto } from '../dto/import-product-schedule.dto';
import { QueryProductScheduleDto } from '../dto/query-product-schedule.dto';
import { ResponseQueryProductScheduleDto } from '../dto/response-query-product-schedule.dto';
import { ProductSchedule } from '../entities/product-schedule.entity';
import { ProductScheduleQueryService } from '../services/product-schedule-query.service';
import {
  ParamUpdateProductScheduleDto,
  BodyUpdateProductScheduleDto,
} from '../dto/update-product-schedule.dto';
import { ProductScheduleManagerService } from '../services/product-schedule-manager.service';
import { ParamDeleteProductScheduleDto } from '../dto/delete-product-schedule.dto';
// Infra Layer
@Controller('product-schedule')
@ApiTags('Product')
export class ProductScheduleController {
  constructor(
    private readonly importTransactionService: ImportTransactionService,
    private readonly productScheduleQueryService: ProductScheduleQueryService,
    private readonly productScheduleManagerService: ProductScheduleManagerService,
    @Inject('DataCollectorImporterInterface<ProductSchedule>')
    private readonly productScheduleImporter: DataCollectorImporterInterface<ProductSchedule>,
  ) {}

  @Get('')
  queryProductSchedule(
    @Query() dto: QueryProductScheduleDto,
  ): Promise<ResponseQueryProductScheduleDto> {
    return this.productScheduleQueryService.findMany(dto);
  }

  @Post('import')
  async import(
    @Body() importProductScheduleDto: ImportProductScheduleDto,
  ): Promise<void> {
    const importTransaction = await this.importTransactionService.findOneBy(
      importProductScheduleDto.importTransaction,
    );

    return this.productScheduleImporter.import(
      importTransaction,
      ProductSchedule.create<ProductSchedule>(importProductScheduleDto.records),
    );
  }

  @Put(':id')
  async update(
    @Param() param: ParamUpdateProductScheduleDto,
    @Body() body: BodyUpdateProductScheduleDto,
  ) {
    let productSchedule;

    try {
      productSchedule =
        await this.productScheduleManagerService.commandUpdateProductScheduleById(
          param.id,
          body,
        );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return productSchedule;
  }

  @Delete(':id')
  async remove(@Param() param: ParamDeleteProductScheduleDto) {
    let productSchedule;

    try {
      productSchedule =
        await this.productScheduleManagerService.commandDeleteProductScheduleById(
          param.id,
        );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return productSchedule;
  }
}
