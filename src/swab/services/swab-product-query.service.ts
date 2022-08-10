import { format } from 'date-fns-tz';
import { Injectable } from "@nestjs/common";
import { FindOptionsWhere, Raw, Repository } from "typeorm";
import { QuerySwabProductDto } from "../dto/query-swab-product.dto";
import { ResponseSwabProductDto } from "../dto/response-swab-product.dto";
import { SwabProductHistory } from "../entities/swab-product-history.entity";
import { FacilityService } from '~/facility/facility.service';
import { SwabPeriodService } from './swab-period.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductService } from '~/product/product.service';

@Injectable()
export class SwabProductQueryService {
    constructor(
        protected readonly facilityService: FacilityService,
        protected readonly swabPeriodService: SwabPeriodService,
        protected readonly productService: ProductService,
        @InjectRepository(SwabProductHistory)
        protected readonly swabProductHistoryRepository: Repository<SwabProductHistory>,
    ) { }

    private transformQuerySwabProductDto(querySwabProductDto: QuerySwabProductDto): FindOptionsWhere<SwabProductHistory> {
        const { swabProductDate: swabProductDateString } = querySwabProductDto;

        const where: FindOptionsWhere<SwabProductHistory> = {};

        let swabProductDate;

        if (swabProductDateString) {
            swabProductDate = new Date(swabProductDateString);

            swabProductDate.setMinutes(0, 0, 0);

            swabProductDate = format(swabProductDate, "yyyy-MM-dd");
        }

        if (swabProductDate) {
            where.swabProductDate = Raw(field => `${field} = '${swabProductDateString}'`);
        }
        return where;
    }

    async querySwabProduct(querySwabProductDto: QuerySwabProductDto): Promise<ResponseSwabProductDto> {
        const where: FindOptionsWhere<SwabProductHistory> = this.transformQuerySwabProductDto(
            querySwabProductDto
        );

        const swabProductHistories = await this.swabProductHistoryRepository.find({
            where: {
                ...where,
            },
            relations: {
                swabTest: true,
                swabPeriod: true,
                product: true,
                facilityItem: true

            },
            select: {
                id: true,
                productId: true,
                product: {
                    id: true,
                    productName: true,
                    productCode: true,
                    alternateProductCode: true
                },
                swabProductLot: true,
                swabProductDate: true,
                swabPeriodId: true,
                swabPeriod: {
                    id: true,
                    swabPeriodName: true
                },
                shift: true,
                swabProductSwabedAt: true,
                swabTestId: true,
                swabTest: {
                    id: true,
                    swabTestCode: true
                },
                facilityItemId: true,
                facilityItem: {
                    facilityItemName: true,
                    facilityId: true,
                    roomId: true,
                    zoneId: true
                }
            },
            order: {
                swabProductDate: 'desc',
                swabProductSwabedAt: 'desc',
            }
        });

        return {
            swabProductHistories
        }
    }
}