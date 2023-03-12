import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { FilterSwabTestDto } from '../dto/filter-swab-test.dto';
import { SwabTest } from '../entities/swab-test.entity';

@Injectable()
export class SwabTestQueryService {
  constructor(
    @InjectRepository(SwabTest)
    private readonly repository: Repository<SwabTest>,
  ) {}

  toQuery(dto: FilterSwabTestDto): SelectQueryBuilder<SwabTest> {
    let { importTransactionId } = dto;

    const query = this.repository
      .createQueryBuilder('swab_test')
      .leftJoinAndSelect('swab_test.bacteria', 'bacteria')
      .where('swab_test.id IS NOT NULL');

    if (importTransactionId) {
      query.andWhere('swab_test.importTransactionId = :importTransactionId', {
        importTransactionId,
      });
    }

    return query;
  }

  async query(dto: FilterSwabTestDto): Promise<SwabTest[]> {
    const query = this.toQuery(dto);

    return query.orderBy('swab_test.id', 'ASC').getMany();
  }
}
