import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "~/auth/entities/user.entity";
import { FacilityItemService } from "~/facility/facility-item.service";
import { ProductService } from "~/product/product.service";
import { BodyCommandUpdateSwabProductHistoryByIdDto } from "../dto/command-update-swab-product-history-by-id.dto";
import { SwabProductHistory } from "../entities/swab-product-history.entity";

Injectable()
export class SwabProductManagerService {
    constructor(
        protected readonly productService: ProductService,
        protected readonly facilityItemService: FacilityItemService,
        @InjectRepository(SwabProductHistory)
        protected readonly swabProductHistoryRepository: Repository<SwabProductHistory>,
    ) { }

    async commandUpdateSwabProductHistoryById(
        id: string,
        bodyCommandUpdateSwabProductHistoryByIdDto: BodyCommandUpdateSwabProductHistoryByIdDto,
        recordedUser: User
    ): Promise<void> {
        const {
            swabProductSwabedAt,
            swabProductDate,
            swabProductLot,
            shift,
            product: connectProductDto,
            facilityItem: connectFacilityItemDto,
        } = bodyCommandUpdateSwabProductHistoryByIdDto;

        const swabProductHistory = await this.swabProductHistoryRepository.findOneBy({ id });

        swabProductHistory.recordedUser = recordedUser;
        swabProductHistory.swabProductSwabedAt = swabProductSwabedAt;
        swabProductHistory.swabProductDate = swabProductDate;

        if (connectProductDto) {
            swabProductHistory.product = this.productService.init(connectProductDto);
        }

        if (connectFacilityItemDto) {
            swabProductHistory.facilityItem = this.facilityItemService.init(connectFacilityItemDto);
        }

        if (swabProductLot) {
            swabProductHistory.swabProductLot = swabProductLot;
        }

        if (shift) {
            swabProductHistory.shift = shift;
        }

        await this.swabProductHistoryRepository.save(swabProductHistory);
    }
}