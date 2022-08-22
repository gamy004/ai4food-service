import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GenerateRunningNumberDto } from '../dto/generate-running-number.dto';
import { RunningNumberService } from '../services/running-number.service';

@Controller('running-number')
export class RunningNumberController {
  constructor(private readonly RunningNumberService: RunningNumberService) { }

  @Post("generate")
  async create(@Body() body: GenerateRunningNumberDto) {
    const generatedRunningNumber = await this.RunningNumberService.generate(body);

    return {
      status: "ok",
      message: "generate running number success",
      generatedRunningNumber
    }
  }
}
