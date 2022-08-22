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
import { BodyCommandCreateSwabProductByIdDto } from "../dto/command-create-swab-product-history.dto";
import { RunningNumberService } from "~/common/services/running-number.service";
import { format } from 'date-fns-tz';
import { SwabTest } from "../entities/swab-test.entity";
import { SwabProductHistoryService } from "./swab-product-history.service";

@Injectable()
export class SwabProductManagerService {
    constructor(
        private readonly dateTransformer: DateTransformer,
        protected readonly facilityItemService: FacilityItemService,
        protected readonly productService: ProductService,
        protected readonly swabPeriodService: SwabPeriodService,
        protected readonly swabProductHistoryService: SwabProductHistoryService,
        private readonly runningNumberService: RunningNumberService

    ) { }

    async commandCreateSwabProductHistory(body: BodyCommandCreateSwabProductByIdDto, recordedUser: User): Promise<SwabProductHistory> {
        const swabProductHistoryData = SwabProductHistory.create(body)
        const SWAB_TEST_CODE_PREFIX = "AI";

        if (recordedUser) {
            swabProductHistoryData.recordedUser = recordedUser;
        }

        const swabTestCodeDate = format(new Date, "yyyyMMdd")
        const runningNumberSwabCode = await this.runningNumberService.generate({ key: swabTestCodeDate })

        if (runningNumberSwabCode) {
            const swabTestData = SwabTest.create({
                swabTestCode: `${SWAB_TEST_CODE_PREFIX} ${runningNumberSwabCode}/${swabTestCodeDate}`
            });

            swabProductHistoryData.swabTest = swabTestData;
        }

        return await this.swabProductHistoryService.create(swabProductHistoryData)
    }

    async commandUpdateSwabProductHistoryById(
        id: string,
        body: BodyCommandUpdateSwabProductByIdDto,
        recordedUser: User
    ): Promise<void> {
        const {
            swabProductSwabedAt,
            swabProductDate,
            swabProductNote,
            shift,
            product: connectProductDto,
            swabPeriod: connectSwabPeriodDto,
            productDate,
            productLot,
            facilityItem: connectFacilityItemDto
        } = body;

        const swabProductHistory = await this.swabProductHistoryService.findOneBy({ id });

        if (recordedUser) {
            swabProductHistory.recordedUser = recordedUser;
        }

        if (swabProductDate) {
            swabProductHistory.swabProductDate = this.dateTransformer.toObject(swabProductDate);
        }

        if (swabProductSwabedAt) {
            swabProductHistory.swabProductSwabedAt = swabProductSwabedAt;
        }

        if (swabProductNote) {
            swabProductHistory.swabProductNote = swabProductNote;
        }

        if (connectProductDto) {
            swabProductHistory.product = this.productService.make(connectProductDto);
        }

        if (connectSwabPeriodDto) {
            swabProductHistory.swabPeriod = this.swabPeriodService.make(connectSwabPeriodDto);
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

        await this.swabProductHistoryService.save(swabProductHistory);
    }

    async commandDeleteSwabProductHistoryById(
        id: string,
    ): Promise<void> {
        const swabProductHistory = await this.swabProductHistoryService.findOne(
            {
                where: { id },
                relations: {
                    swabTest: true
                }
            }
        );

        await this.swabProductHistoryService.removeOne(swabProductHistory);
    }
}