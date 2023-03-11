import {
  Controller,
  ForbiddenException,
  Body,
  Param,
  Put,
  Post,
  Inject,
  Get,
} from '@nestjs/common';
import { SwabLabManagerService } from '../services/swab-lab-manager.service';
import {
  BodyUpdateSwabTestDto,
  ParamUpdateSwabTestDto,
} from '../dto/command-update-swab-test.dto';
import { Authenticated } from '~/auth/decorators/authenticated.decortator';
import { AuthUser } from '~/auth/decorators/auth-user.decorator';
import { User } from '~/auth/entities/user.entity';
import { CommandUpdateSwabTestBacteriaSpecieDto } from '../dto/command-update-swab-test-bacteria-specie.dto';
import { ApiTags } from '@nestjs/swagger';
import { ImportSwabTestDto } from '../dto/import-swab-test.dto';
import { SwabTest } from '../entities/swab-test.entity';
import { DataCollectorImporterInterface } from '~/data-collector/interface/data-collector-importer-interface';
import { ImportTransactionService } from '~/import-transaction/import-transaction.service';
import * as XLSX from 'xlsx';
import { BacteriaService } from '~/lab/services/bacteria.service';
import { ImportType } from '~/import-transaction/entities/import-transaction.entity';
import { SwabTestService } from '../services/swab-test.service';

@Controller('swab-test')
@ApiTags('Swab')
export class SwabTestController {
  constructor(
    private readonly importTransactionService: ImportTransactionService,
    private readonly swabLabManagerService: SwabLabManagerService,
    private readonly bacteriaService: BacteriaService,
    private readonly swabtestService: SwabTestService,
    @Inject('DataCollectorImporterInterface<SwabTest>')
    private readonly swabTestImporter: DataCollectorImporterInterface<SwabTest>,
  ) {}

  @Get()
  findAll() {
    return this.swabtestService.find({
      relations: ['bacteria'],
      order: {
        createdAt: 'asc',
      },
    });
  }

  @Authenticated()
  @Post('extact-xlsx')
  async extactXlsx(@AuthUser() user: User): Promise<void> {
    var workbook = XLSX.readFile('RunReport_211165-1.xls', {});
    const { Sheets = {} } = workbook;
    const bacteriaData = await this.bacteriaService.find({
      select: {
        id: true,
      },
    });

    const importTransaction = await this.importTransactionService.findOne({
      where: {
        importType: ImportType.SWAB_TEST,
      },
      select: {
        id: true,
      },
    });

    function findSwabTestCodeIndex(sheetDatas = []) {
      let swabTestCodeIndex = null;
      const keyOfSwabTestCode = 'Sample ID';
      for (let index = 0; index < sheetDatas.length; index++) {
        const sheetData = sheetDatas[index];
        for (const key in sheetData) {
          if (Object.prototype.hasOwnProperty.call(sheetData, key)) {
            const element = sheetData[key];
            if (keyOfSwabTestCode === element) {
              swabTestCodeIndex = index;
              break;
            }
          }
        }
      }
      return swabTestCodeIndex;
    }

    function findKey(keys = [], data = {}) {
      let result = [];
      for (let index = 0; index < keys.length; index++) {
        const element = keys[index];
        for (const key in data) {
          if (data[key] === element) result.push(key);
        }
      }
      return result;
    }

    /* loop foreach sheets */
    let records = [];
    for (const sheetName in Sheets) {
      const sheetDatas = XLSX.utils.sheet_to_json(Sheets[sheetName]);
      if (sheetDatas && sheetDatas.length) {
        const swabTestCodeStartIndex = await findSwabTestCodeIndex(sheetDatas);

        if (swabTestCodeStartIndex === null)
          throw Error(`Can't found index of swab-test code`);

        const [swabTestCodeKey, bacteriaKey] = await findKey(
          ['Sample ID', 'Result'],
          sheetDatas[swabTestCodeStartIndex],
        );

        for (
          let index = swabTestCodeStartIndex + 1;
          index < sheetDatas.length;
          index++
        ) {
          const data = sheetDatas[index];
          const positiveKey = ['positive', 'POSITIVE', 'Positive'];
          const swabTestCode = data[swabTestCodeKey];
          const resultBacteria = data[bacteriaKey];
          let bacteria = [];

          const rule = (x) => x === resultBacteria;
          if (positiveKey.some(rule)) {
            bacteria = bacteriaData;
          }

          if (swabTestCode !== undefined) {
            records.push({
              recordedUser: user,
              bacteriaRecordedUser: user,
              swabTestRecordedAt: new Date(),
              bacteriaRecordedAt: new Date(),
              bacteria,
              swabTestCode,
            });
          }
        }
      }
    }
    await this.import({ importTransaction, records });

    return;
  }

  @Post('import')
  async import(@Body() importSwabTestDto: ImportSwabTestDto): Promise<void> {
    const importTransaction = await this.importTransactionService.findOneBy(
      importSwabTestDto.importTransaction,
    );

    if (importSwabTestDto.timezone) {
      this.swabTestImporter.setTimezone(importSwabTestDto.timezone);
    }

    return this.swabTestImporter.import(
      importTransaction,
      SwabTest.create<SwabTest>(importSwabTestDto.records),
    );
  }

  @Authenticated()
  @Put(':id')
  async commandUpdateSwabTest(
    @AuthUser() user: User,
    @Param() paramUpdateSwabTestDto: ParamUpdateSwabTestDto,
    @Body() bodyUpdateSwabTestDto: BodyUpdateSwabTestDto,
  ) {
    try {
      await this.swabLabManagerService.commandUpdateBacteria(
        paramUpdateSwabTestDto.id,
        { ...bodyUpdateSwabTestDto },
        user,
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return {
      ok: true,
      message: 'update lab result success',
    };
  }

  @Authenticated()
  @Put(':id/bacteria-specie')
  async commandUpdateSwabTestBacteriaSpecie(
    @AuthUser() user: User,
    @Param() paramUpdateSwabTestDto: ParamUpdateSwabTestDto,
    @Body() body: CommandUpdateSwabTestBacteriaSpecieDto,
  ) {
    let result;

    try {
      result = await this.swabLabManagerService.commandUpdateBacteriaSpecie(
        paramUpdateSwabTestDto.id,
        { ...body },
        user,
      );
    } catch (error) {
      throw new ForbiddenException(error.message);
    }

    return {
      ok: true,
      message: 'update bacteria specie success',
      result,
    };
  }
}
