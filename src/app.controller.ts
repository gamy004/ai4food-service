import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor() // private readonly appService: AppService,
  {}

  @Get('ping')
  getPing(): string {
    return 'Hello';
  }
}
