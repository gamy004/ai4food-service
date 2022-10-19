import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsRelations,
  FindOptionsWhere,
} from 'typeorm';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { CrudService } from '~/common/services/abstract.crud.service';
import { FindAllBacteriaQuery } from '../dto/find-all-bacteria-query.dto';
import { Bacteria } from '../entities/bacteria.entity';

@Injectable()
export class BacteriaService extends CrudService<Bacteria> {
  constructor(
    @InjectRepository(Bacteria)
    repository: CommonRepositoryInterface<Bacteria>,
  ) {
    super(repository);
  }

  toFilter(dto: FindAllBacteriaQuery): FindManyOptions<Bacteria> {
    const { bacteriaName, bacteriaSpecies = false } = dto;

    const where: FindOptionsWhere<Bacteria> = {};
    const relations: FindOptionsRelations<Bacteria> = {
      bacteriaSpecies,
    };

    if (bacteriaName) {
      where.bacteriaName = bacteriaName;
    }

    return {
      where,
      relations,
      select: {
        id: true,
        bacteriaName: true,
        bacteriaSpecies: {
          id: true,
          bacteriaSpecieName: true,
          bacteriaId: true,
        },
      },
    };
  }
}
