import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateFileDto } from '../dto/create-file.dto';
import { UpdateFileDto } from '../dto/update-file.dto';
import { FileService } from '../services/file.service';

@Controller('file')
@ApiTags('File')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  create(@Body() createFileDto: CreateFileDto) {
    return this.fileService.create(createFileDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileService.findOneBy({ id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.fileService.update({ id }, updateFileDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedFile = await this.fileService.findOneBy({ id });

    return this.fileService.removeOne(deletedFile);
  }
}
