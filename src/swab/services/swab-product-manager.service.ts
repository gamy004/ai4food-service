import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SwabPeriodService } from "./swab-period.service";
import { ProductService } from '~/product/product.service';
import { FacilityItemService } from '~/facility/facility-item.service';
import { SwabProductHistory } from '../entities/swab-product-history.entity';
import { User } from '~/auth/entities/user.entity';
import { DateTransformer } from '~/common/transformers/date-transformer';
import { BodyCommandUpdateSwabProductByIdDto } from "../dto/command-update-swab-product-history-by-id.dto";

@Injectable()
export class SwabProductManagerService {
    constructor(
        private readonly dateTransformer: DateTransformer,
        protected readonly facilityItemService: FacilityItemService,
        protected readonly productService: ProductService,
        protected readonly swabPeriodService: SwabPeriodService,
        @InjectRepository(SwabProductHistory)
        protected readonly swabProductHistoryRepository: Repository<SwabProductHistory>,

    ) { }

    async commandUpdateSwabProductHistoryById(
        id: string,
        body: BodyCommandUpdateSwabProductByIdDto,
        recordedUser: User
    ): Promise<void> {
        const {
            swabProductSwabedAt,
            swabProductDate,
            shift,
            product: connectProductDto,
            productDate,
            productLot,
            facilityItem: connectFacilityItemDto
        } = body;

        const swabProductHistory = await this.swabProductHistoryRepository.findOneBy({ id });

        if (recordedUser) {
            swabProductHistory.recordedUser = recordedUser;
        }

        if (swabProductDate) {
            swabProductHistory.swabProductDate = this.dateTransformer.toObject(swabProductDate);
        }

        if (swabProductSwabedAt) {
            swabProductHistory.swabProductSwabedAt = swabProductSwabedAt;
        }

        if (connectProductDto) {
            swabProductHistory.product = this.productService.make(connectProductDto);
        }

        if (productDate) {
            swabProductHistory.productDate = this.dateTransformer.toObject(productDate);
        }

        if (productLot) {
            swabProductHistory.productLot = productLot;
        }

        if (shift) {
            swabProductHistory.shift = shift;
        }

        if (connectFacilityItemDto) {
            swabProductHistory.facilityItem = this.facilityItemService.make(connectFacilityItemDto);
        }

        await this.swabProductHistoryRepository.save(swabProductHistory);
    }
}