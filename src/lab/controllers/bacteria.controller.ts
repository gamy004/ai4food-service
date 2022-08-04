import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BacteriaService } from '../services/bacteria.service';

@Controller('bacteria')
export class BacteriaController {
    constructor(private readonly BacteriaService: BacteriaService) { }

    @Get()
    findAll() {
        return this.BacteriaService.findAll();
    }
}
