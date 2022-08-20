import { format } from 'date-fns-tz';
import { Injectable } from "@nestjs/common";
import { FindOptionsWhere, Repository, In, Equal } from "typeorm";
import { QuerySwabProductDto } from "../dto/query-swab-product.dto";
import { ResponseSwabProductDto } from "../dto/response-swab-product.dto";
import { SwabProductHistory } from "../entities/swab-product-history.entity";
import { FacilityService } from '~/facility/facility.service';
import { SwabPeriodService } from './swab-period.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductService } from '~/product/product.service';
import { FacilityItemService } from '~/facility/facility-item.service';
import { Product } from '~/product/entities/product.entity';
import { FacilityItem } from '~/facility/entities/facility-item.entity';

@Injectable()
export class SwabProductQueryService {
    constructor(
        protected readonly facilityService: FacilityService,
        protected readonly facilityItemService: FacilityItemService,
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
            where.swabProductDate = Equal(swabProductDate);
        }

        return where;
    }

    async querySwabProduct(querySwabProductDto: QuerySwabProductDto): Promise<ResponseSwabProductDto> {
        const where: FindOptionsWhere<SwabProductHistory> = this.transformQuerySwabProductDto(
            querySwabProductDto
        );

        let products: Product[] = [];
        let facilityItems: FacilityItem[] = [];

        const swabProductHistories = await this.swabProductHistoryRepository.find({
            where: {
                ...where,
            },
            relations: {
                swabTest: true,
                // swabPeriod: true,
                // product: true,
                // facilityItem: true
            },
            select: {
                id: true,
                productId: true,
                // product: {
                //     id: true,
                //     productName: true,
                //     productCode: true,
                //     alternateProductCode: true
                // },
                productLot: true,
                swabProductDate: true,
                swabPeriodId: true,
                // swabPeriod: {
                //     id: true,
                //     swabPeriodName: true
                // },
                shift: true,
                swabProductSwabedAt: true,
                swabTestId: true,
                swabTest: {
                    id: true,
                    swabTestCode: true
                },
                facilityItemId: true,
                // facilityItem: {
                //     facilityItemName: true,
                //     facilityId: true,
                //     roomId: true,
                //     zoneId: true
                // }
            },
            order: {
                swabProductDate: 'desc',
                swabProductSwabedAt: 'desc',
            }
        });

        if (swabProductHistories.length) {
            const facilityItemIds = [...new Set(swabProductHistories.map(({ facilityItemId }) => facilityItemId))].filter(Boolean);

            if (facilityItemIds.length) {
                facilityItems = await this.facilityItemService.find({
                    where: {
                        id: In(facilityItemIds)
                    },
                    select: {
                        id: true,
                        facilityItemName: true,
                        facilityId: true
                    }
                });
            }

            const productIds = [...new Set(swabProductHistories.map(({ productId }) => productId))].filter(Boolean);

            if (productIds.length) {
                products = await this.productService.find({
                    where: {
                        id: In(productIds)
                    },
                    select: {
                        id: true,
                        productName: true,
                        productCode: true,
                        alternateProductCode: true
                    }
                });
            }
        }

        return {
            swabProductHistories,
            products,
            facilityItems
        }
    }

    async querySwabProductById(id: string): Promise<SwabProductHistory> {
        const swabProductHistory = await this.swabProductHistoryRepository.findOne({
            where: { id },
            relations: {
                swabTest: true,
                // swabPeriod: true,
                // product: true,
                facilityItem: {
                    facility: true
                }
            },
            select: {
                id: true,
                productId: true,
                // product: {
                //     id: true,
                //     productName: true,
                //     productCode: true,
                //     alternateProductCode: true
                // },
                productDate: true,
                productLot: true,
                swabProductDate: true,
                swabPeriodId: true,
                // swabPeriod: {
                //     id: true,
                //     swabPeriodName: true
                // },
                shift: true,
                swabProductSwabedAt: true,
                swabProductNote: true,
                swabTestId: true,
                swabTest: {
                    id: true,
                    swabTestCode: true
                },
                facilityItemId: true,
                facilityItem: {
                    id: true,
                    facilityItemName: true,
                    facilityId: true,
                    // roomId: true,
                    // zoneId: true
                }
            }
        });

        return swabProductHistory;
    }
}