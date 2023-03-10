import { Injectable } from '@nestjs/common';
import { IsNull, In } from 'typeorm';
import { CleaningValidation } from '~/cleaning/entities/cleaning-validation.entity';
import { CleaningValidationService } from '~/cleaning/services/cleaning-validation.service';
import { FacilityService } from '~/facility/services/facility.service';
import { SwabArea } from '../entities/swab-area.entity';
import { SwabCleaningValidation } from '../entities/swab-cleaning-validation.entity';
import { SwabAreaService } from './swab-area.service';
import { SwabCleaningValidationService } from './swab-cleaning-validation.service';
import { SwabPeriodService } from './swab-period.service';

@Injectable()
export class SwabCleaningValidationSeedService {
  constructor(
    private readonly swabCleaningValidationService: SwabCleaningValidationService,
    private readonly cleaningValidationService: CleaningValidationService,
    private readonly swabPeriodService: SwabPeriodService,
    private readonly facilityService: FacilityService,
    private readonly swabAreaService: SwabAreaService,
  ) {}

  async seed(): Promise<void> {
    let cleaningValidationSeed = [
      {
        cleaningValidationName: 'Vip Klear',
        active: true,
        swabCleaningValidations: [
          {
            swabPeriodName: 'หลังล้างระหว่างงาน',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  {
                    mainSwabAreaName:
                      'ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด',
                  },
                  {
                    mainSwabAreaName:
                      'คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว',
                  },
                  {
                    mainSwabAreaName:
                      'Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด',
                  },
                  {
                    mainSwabAreaName:
                      'ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว',
                  },
                  {
                    mainSwabAreaName:
                      'Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง',
                  },
                  { mainSwabAreaName: 'สายพานลำเลียงถาด' },
                  {
                    mainSwabAreaName:
                      'เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน',
                  },
                  { mainSwabAreaName: 'ช่องใต้เฟรมสายพาน' },
                  { mainSwabAreaName: 'ขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ใต้ฐานขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ช่องข้างขาตั้งชุด Control' },
                  { mainSwabAreaName: 'ด้านบนตู้ Control Infeed' },
                  { mainSwabAreaName: 'สายไฟ' },
                  { mainSwabAreaName: 'พื้นใต้เครื่อง Portion' },
                  { mainSwabAreaName: 'สายลมเครื่อง Portion' },
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter',
                    subSwabAreaNames: [
                      'ชุดเติมข้าว',
                      'สายพานลำเลียง',
                      'แกนซุย',
                    ],
                  },
                  {
                    mainSwabAreaName:
                      'แกน roller, สายพาน PVC., ปีกสายพานสแตนเลส',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        cleaningValidationName: 'ล้างน้ำ',
        swabCleaningValidations: [
          {
            swabPeriodName: 'หลังล้างระหว่างงาน',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  { mainSwabAreaName: 'ถาดรองเศษใต้ Portion' },
                  { mainSwabAreaName: 'แป้นกดสบู่ และ อ่างล้างมือ' },
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter',
                    subSwabAreaNames: ['ชุด Hopper', 'Shutter'],
                  },
                ],
              },
              {
                facilityName: 'ตู้ Steam',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
            ],
          },
          {
            swabPeriodName: 'หลังล้างท้ายกะ',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์',
                  },
                  {
                    mainSwabAreaName:
                      'ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด',
                  },
                  { mainSwabAreaName: 'ถาดรองเศษใต้ Portion' },
                  {
                    mainSwabAreaName:
                      'คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว',
                  },
                  {
                    mainSwabAreaName:
                      'โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์',
                  },
                  {
                    mainSwabAreaName:
                      'Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด',
                  },
                  {
                    mainSwabAreaName:
                      'ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว',
                  },
                  {
                    mainSwabAreaName:
                      'Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง',
                  },
                  { mainSwabAreaName: 'สายพานลำเลียงถาด' },
                  {
                    mainSwabAreaName:
                      'เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน',
                  },
                  { mainSwabAreaName: 'ช่องใต้เฟรมสายพาน' },
                  { mainSwabAreaName: 'ขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ใต้ฐานขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ช่องข้างขาตั้งชุด Control' },
                  { mainSwabAreaName: 'ด้านบนตู้ Control Infeed' },
                  { mainSwabAreaName: 'สายไฟ' },
                  { mainSwabAreaName: 'พื้นใต้เครื่อง Portion' },
                  { mainSwabAreaName: 'พื้นห้อง' },
                  { mainSwabAreaName: 'ผนังห้อง' },
                  { mainSwabAreaName: 'รางระบายน้ำห้อง' },
                  { mainSwabAreaName: 'แป้นกดสบู่ และ อ่างล้างมือ' },
                  { mainSwabAreaName: 'สายลมเครื่อง Portion' },
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter',
                    subSwabAreaNames: [
                      'ชุดเติมข้าว',
                      'สายพานลำเลียง',
                      'แกนซุย',
                      'ชุด Hopper',
                      'Shutter',
                    ],
                  },
                  {
                    mainSwabAreaName:
                      'แกน roller, สายพาน PVC., ปีกสายพานสแตนเลส',
                  },
                ],
              },
              {
                facilityName: 'ตู้ Vac.',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
              {
                facilityName: 'ตู้ Steam',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
              {
                facilityName: 'รถเข็นกะบะ',
                swabAreas: [{ mainSwabAreaName: 'ล้อรถเข็นกะบะ' }],
              },
              {
                facilityName: 'กล่องเครื่องมือวิศวะ',
                swabAreas: [{ mainSwabAreaName: 'กล่องเครื่องมือวิศวะ' }],
              },
            ],
          },
          {
            swabPeriodName: 'หลัง Super Big Cleaning',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์',
                  },
                  {
                    mainSwabAreaName:
                      'ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด',
                  },
                  { mainSwabAreaName: 'ถาดรองเศษใต้ Portion' },
                  {
                    mainSwabAreaName:
                      'คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว',
                  },
                  {
                    mainSwabAreaName:
                      'โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์',
                  },
                  { mainSwabAreaName: 'Cover มอเตอร์ แกนกลางเครื่อง' },
                  {
                    mainSwabAreaName:
                      'Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด',
                  },
                  {
                    mainSwabAreaName:
                      'ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว',
                  },
                  {
                    mainSwabAreaName:
                      'Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง',
                  },
                  { mainSwabAreaName: 'สายพานลำเลียงถาด' },
                  {
                    mainSwabAreaName:
                      'เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน',
                  },
                  { mainSwabAreaName: 'ช่องใต้เฟรมสายพาน' },
                  { mainSwabAreaName: 'ขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ใต้ฐานขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ช่องข้างขาตั้งชุด Control' },
                  { mainSwabAreaName: 'ด้านบนตู้ Control Infeed' },
                  { mainSwabAreaName: 'สายไฟ' },
                  { mainSwabAreaName: 'พื้นใต้เครื่อง Portion' },
                  { mainSwabAreaName: 'พื้นห้อง' },
                  { mainSwabAreaName: 'ผนังห้อง' },
                  { mainSwabAreaName: 'รางระบายน้ำห้อง' },
                  { mainSwabAreaName: 'แป้นกดสบู่ และ อ่างล้างมือ' },
                  { mainSwabAreaName: 'สายลมเครื่อง Portion' },
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter',
                    subSwabAreaNames: [
                      'ชุดเติมข้าว',
                      'สายพานลำเลียง',
                      'แกนซุย',
                      'ชุด Hopper',
                      'Shutter',
                    ],
                  },
                  {
                    mainSwabAreaName:
                      'แกน roller, สายพาน PVC., ปีกสายพานสแตนเลส',
                  },
                ],
              },
              {
                facilityName: 'ตู้ Vac.',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
              {
                facilityName: 'ตู้ Steam',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
              {
                facilityName: 'กล่องเครื่องมือวิศวะ',
                swabAreas: [{ mainSwabAreaName: 'กล่องเครื่องมือวิศวะ' }],
              },
            ],
          },
        ],
      },
      {
        cleaningValidationName: 'โฟม',
        swabCleaningValidations: [
          {
            swabPeriodName: 'หลังล้างระหว่างงาน',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  { mainSwabAreaName: 'ถาดรองเศษใต้ Portion' },
                  { mainSwabAreaName: 'แป้นกดสบู่ และ อ่างล้างมือ' },
                  { mainSwabAreaName: 'มือพนักงานช่างประกอบเครื่องหลังล้าง' },
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter',
                    subSwabAreaNames: ['ชุด Hopper', 'Shutter'],
                  },
                ],
              },
              {
                facilityName: 'ตู้ Steam',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
            ],
          },
          {
            swabPeriodName: 'หลังล้างท้ายกะ',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์',
                  },
                  {
                    mainSwabAreaName:
                      'ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด',
                  },
                  { mainSwabAreaName: 'ถาดรองเศษใต้ Portion' },
                  {
                    mainSwabAreaName:
                      'คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว',
                  },
                  {
                    mainSwabAreaName:
                      'โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์',
                  },
                  {
                    mainSwabAreaName:
                      'Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด',
                  },
                  {
                    mainSwabAreaName:
                      'ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว',
                  },
                  {
                    mainSwabAreaName:
                      'Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง',
                  },
                  { mainSwabAreaName: 'สายพานลำเลียงถาด' },
                  {
                    mainSwabAreaName:
                      'เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน',
                  },
                  { mainSwabAreaName: 'ช่องใต้เฟรมสายพาน' },
                  { mainSwabAreaName: 'ขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ใต้ฐานขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ช่องข้างขาตั้งชุด Control' },
                  { mainSwabAreaName: 'ด้านบนตู้ Control Infeed' },
                  { mainSwabAreaName: 'สายไฟ' },
                  { mainSwabAreaName: 'พื้นใต้เครื่อง Portion' },
                  { mainSwabAreaName: 'พื้นห้อง' },
                  { mainSwabAreaName: 'ผนังห้อง' },
                  { mainSwabAreaName: 'รางระบายน้ำห้อง' },
                  { mainSwabAreaName: 'แป้นกดสบู่ และ อ่างล้างมือ' },
                  { mainSwabAreaName: 'สายลมเครื่อง Portion' },
                  { mainSwabAreaName: 'เครื่องชั่ง Topping' },
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter',
                    subSwabAreaNames: [
                      'ชุดเติมข้าว',
                      'สายพานลำเลียง',
                      'แกนซุย',
                      'ชุด Hopper',
                      'Shutter',
                    ],
                  },
                  {
                    mainSwabAreaName:
                      'แกน roller, สายพาน PVC., ปีกสายพานสแตนเลส',
                  },
                ],
              },
              {
                facilityName: 'ตู้ Vac.',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
              {
                facilityName: 'ตู้ Steam',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
              {
                facilityName: 'รถเข็นกะบะ',
                swabAreas: [{ mainSwabAreaName: 'ล้อรถเข็นกะบะ' }],
              },
              {
                facilityName: 'กล่องเครื่องมือวิศวะ',
                swabAreas: [{ mainSwabAreaName: 'กล่องเครื่องมือวิศวะ' }],
              },
            ],
          },
          {
            swabPeriodName: 'หลัง Super Big Cleaning',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์',
                  },
                  {
                    mainSwabAreaName:
                      'ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด',
                  },
                  { mainSwabAreaName: 'ถาดรองเศษใต้ Portion' },
                  {
                    mainSwabAreaName:
                      'คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว',
                  },
                  {
                    mainSwabAreaName:
                      'โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์',
                  },
                  { mainSwabAreaName: 'Cover มอเตอร์ แกนกลางเครื่อง' },
                  {
                    mainSwabAreaName:
                      'Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด',
                  },
                  {
                    mainSwabAreaName:
                      'ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว',
                  },
                  {
                    mainSwabAreaName:
                      'Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง',
                  },
                  { mainSwabAreaName: 'สายพานลำเลียงถาด' },
                  {
                    mainSwabAreaName:
                      'เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน',
                  },
                  { mainSwabAreaName: 'ช่องใต้เฟรมสายพาน' },
                  { mainSwabAreaName: 'ขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ใต้ฐานขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ช่องข้างขาตั้งชุด Control' },
                  { mainSwabAreaName: 'ด้านบนตู้ Control Infeed' },
                  { mainSwabAreaName: 'สายไฟ' },
                  { mainSwabAreaName: 'พื้นใต้เครื่อง Portion' },
                  { mainSwabAreaName: 'พื้นห้อง' },
                  { mainSwabAreaName: 'ผนังห้อง' },
                  { mainSwabAreaName: 'รางระบายน้ำห้อง' },
                  { mainSwabAreaName: 'แป้นกดสบู่ และ อ่างล้างมือ' },
                  { mainSwabAreaName: 'สายลมเครื่อง Portion' },
                  { mainSwabAreaName: 'เครื่องชั่ง Topping' },
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter',
                    subSwabAreaNames: [
                      'ชุดเติมข้าว',
                      'สายพานลำเลียง',
                      'แกนซุย',
                      'ชุด Hopper',
                      'Shutter',
                    ],
                  },
                  {
                    mainSwabAreaName:
                      'แกน roller, สายพาน PVC., ปีกสายพานสแตนเลส',
                  },
                ],
              },
              {
                facilityName: 'ตู้ Vac.',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
              {
                facilityName: 'ตู้ Steam',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
              {
                facilityName: 'กล่องเครื่องมือวิศวะ',
                swabAreas: [{ mainSwabAreaName: 'กล่องเครื่องมือวิศวะ' }],
              },
              {
                facilityName: 'รถเข็นกะบะ',
                swabAreas: [{ mainSwabAreaName: 'ล้อรถเข็นกะบะ' }],
              },
            ],
          },
        ],
      },
      {
        cleaningValidationName: 'ฆ่าเชื้อ',
        swabCleaningValidations: [
          {
            swabPeriodName: 'หลังล้างระหว่างงาน',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  { mainSwabAreaName: 'รางระบายน้ำห้อง' },
                  { mainSwabAreaName: 'แป้นกดสบู่ และ อ่างล้างมือ' },
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter',
                    subSwabAreaNames: ['ชุด Hopper', 'Shutter'],
                  },
                ],
              },
              {
                facilityName: 'ตู้ Vac.',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
              {
                facilityName: 'ตู้ Steam',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
            ],
          },
          {
            swabPeriodName: 'หลังล้างท้ายกะ',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์',
                  },
                  {
                    mainSwabAreaName:
                      'ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด',
                  },
                  { mainSwabAreaName: 'ถาดรองเศษใต้ Portion' },
                  {
                    mainSwabAreaName:
                      'คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว',
                  },
                  {
                    mainSwabAreaName:
                      'โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์',
                  },
                  {
                    mainSwabAreaName:
                      'Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด',
                  },
                  {
                    mainSwabAreaName:
                      'ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว',
                  },
                  {
                    mainSwabAreaName:
                      'Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง',
                  },
                  { mainSwabAreaName: 'สายพานลำเลียงถาด' },
                  {
                    mainSwabAreaName:
                      'เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน',
                  },
                  { mainSwabAreaName: 'ช่องใต้เฟรมสายพาน' },
                  { mainSwabAreaName: 'ขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ใต้ฐานขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ช่องข้างขาตั้งชุด Control' },
                  { mainSwabAreaName: 'ด้านบนตู้ Control Infeed' },
                  { mainSwabAreaName: 'สายไฟ' },
                  { mainSwabAreaName: 'พื้นใต้เครื่อง Portion' },
                  { mainSwabAreaName: 'พื้นห้อง' },
                  { mainSwabAreaName: 'ผนังห้อง' },
                  { mainSwabAreaName: 'รางระบายน้ำห้อง' },
                  { mainSwabAreaName: 'แป้นกดสบู่ และ อ่างล้างมือ' },
                  { mainSwabAreaName: 'สายลมเครื่อง Portion' },
                  { mainSwabAreaName: 'เครื่องชั่ง Topping' },
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter',
                    subSwabAreaNames: [
                      'ชุดเติมข้าว',
                      'สายพานลำเลียง',
                      'แกนซุย',
                      'ชุด Hopper',
                      'Shutter',
                    ],
                  },
                  {
                    mainSwabAreaName:
                      'แกน roller, สายพาน PVC., ปีกสายพานสแตนเลส',
                  },
                ],
              },
              {
                facilityName: 'ตู้ Vac.',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
              {
                facilityName: 'ตู้ Steam',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
              {
                facilityName: 'รถเข็นกะบะ',
                swabAreas: [{ mainSwabAreaName: 'ล้อรถเข็นกะบะ' }],
              },
              {
                facilityName: 'กล่องเครื่องมือวิศวะ',
                swabAreas: [{ mainSwabAreaName: 'กล่องเครื่องมือวิศวะ' }],
              },
            ],
          },
          {
            swabPeriodName: 'หลัง Super Big Cleaning',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว ส่วน Sup Weight และ แขนชัตเตอร์',
                  },
                  {
                    mainSwabAreaName:
                      'ชุดกดหน้าข้าว และ ชิ้นส่วนที่ถอดออกได้ ไปล้างทำความสะอาด',
                  },
                  { mainSwabAreaName: 'ถาดรองเศษใต้ Portion' },
                  {
                    mainSwabAreaName:
                      'คานตู้ Control หน้าเครื่อง Portion, Cover ด้านบนเครื่อง และ ช่องด้านบนเครื่องใกล้ชุด Hopper ข้าว',
                  },
                  {
                    mainSwabAreaName:
                      'โครงชุดเติมข้าว ส่วน Sup Weight, แถบด้านในโครงชุดเติมข้าว ส่วน Sup Weight และ โครงชุดแขนชัตเตอร์',
                  },
                  { mainSwabAreaName: 'Cover มอเตอร์ แกนกลางเครื่อง' },
                  {
                    mainSwabAreaName:
                      'Cover หน้าเครื่องจุดวางถาด และ ชุดกันรอบสายพานลำเลียงถาด',
                  },
                  {
                    mainSwabAreaName:
                      'ช่องยกคานลิฟท์ด้านหลัง, ใต้ฐานลิฟท์ยกข้าว และ แขนชุดลิฟท์ยกข้าว',
                  },
                  {
                    mainSwabAreaName:
                      'Cover ใส, Cover สแตนเลส และ Slope ท้ายเครื่อง',
                  },
                  { mainSwabAreaName: 'สายพานลำเลียงถาด' },
                  {
                    mainSwabAreaName:
                      'เลื่อนสายพาน และ รอยต่อโครงสร้างด้านใต้สายพาน',
                  },
                  { mainSwabAreaName: 'ช่องใต้เฟรมสายพาน' },
                  { mainSwabAreaName: 'ขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ใต้ฐานขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ช่องข้างขาตั้งชุด Control' },
                  { mainSwabAreaName: 'ด้านบนตู้ Control Infeed' },
                  { mainSwabAreaName: 'สายไฟ' },
                  { mainSwabAreaName: 'พื้นใต้เครื่อง Portion' },
                  { mainSwabAreaName: 'พื้นห้อง' },
                  { mainSwabAreaName: 'ผนังห้อง' },
                  { mainSwabAreaName: 'รางระบายน้ำห้อง' },
                  { mainSwabAreaName: 'แป้นกดสบู่ และ อ่างล้างมือ' },
                  { mainSwabAreaName: 'สายลมเครื่อง Portion' },
                  { mainSwabAreaName: 'เครื่องชั่ง Topping' },
                  {
                    mainSwabAreaName:
                      'ชุดเติมข้าว, สายพานลำเลียง, แกนซุย, ชุด Hopper และ Shutter',
                    subSwabAreaNames: [
                      'ชุดเติมข้าว',
                      'สายพานลำเลียง',
                      'แกนซุย',
                      'ชุด Hopper',
                      'Shutter',
                    ],
                  },
                  {
                    mainSwabAreaName:
                      'แกน roller, สายพาน PVC., ปีกสายพานสแตนเลส',
                  },
                ],
              },
              {
                facilityName: 'ตู้ Vac.',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
              {
                facilityName: 'ตู้ Steam',
                swabAreas: [{ mainSwabAreaName: 'พื้นและ Slope' }],
              },
              {
                facilityName: 'กล่องเครื่องมือวิศวะ',
                swabAreas: [{ mainSwabAreaName: 'กล่องเครื่องมือวิศวะ' }],
              },
              {
                facilityName: 'รถเข็นกะบะ',
                swabAreas: [{ mainSwabAreaName: 'ล้อรถเข็นกะบะ' }],
              },
            ],
          },
        ],
      },
      {
        cleaningValidationName: 'Steam',
        swabCleaningValidations: [
          {
            swabPeriodName: 'หลังล้างระหว่างงาน',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  {
                    mainSwabAreaName: 'ถาดรองเศษใต้ Portion',
                  },
                ],
              },
            ],
          },
          {
            swabPeriodName: 'หลังล้างท้ายกะ',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  {
                    mainSwabAreaName: 'ถาดรองเศษใต้ Portion',
                  },
                  { mainSwabAreaName: 'เครื่องชั่ง Topping' },
                ],
              },
            ],
          },
          {
            swabPeriodName: 'หลัง Super Big Cleaning',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  {
                    mainSwabAreaName: 'ถาดรองเศษใต้ Portion',
                  },
                  { mainSwabAreaName: 'เครื่องชั่ง Topping' },
                ],
              },
            ],
          },
        ],
      },
      {
        cleaningValidationName: 'แอลกอฮอล์',
        swabCleaningValidations: [
          {
            swabPeriodName: 'หลังล้างระหว่างงาน',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  {
                    mainSwabAreaName: 'มือพนักงานช่างประกอบเครื่องหลังล้าง',
                  },
                  { mainSwabAreaName: 'เครื่องชั่ง Topping' },
                ],
              },
              {
                facilityName: 'กล่องเครื่องมือวิศวะ',
                swabAreas: [{ mainSwabAreaName: 'กล่องเครื่องมือวิศวะ' }],
              },
            ],
          },
          {
            swabPeriodName: 'หลังล้างท้ายกะ',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [{ mainSwabAreaName: 'เครื่องชั่ง Topping' }],
              },
            ],
          },
          {
            swabPeriodName: 'หลัง Super Big Cleaning',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [{ mainSwabAreaName: 'เครื่องชั่ง Topping' }],
              },
            ],
          },
        ],
      },
      {
        cleaningValidationName: 'น้ำร้อน',
        swabCleaningValidations: [
          {
            swabPeriodName: 'หลังล้างระหว่างงาน',
            facilities: [
              {
                facilityName: 'ขึ้นรูป',
                swabAreas: [
                  { mainSwabAreaName: 'ขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ใต้ฐานขาตั้งเครื่อง' },
                  { mainSwabAreaName: 'ช่องข้างขาตั้งชุด Control' },
                ],
              },
            ],
          },
        ],
      },
      {
        cleaningValidationName: 'ถอดล้อ',
        swabCleaningValidations: [
          {
            swabPeriodName: 'หลัง Super Big Cleaning',
            facilities: [
              {
                facilityName: 'รถเข็นกะบะ',
                swabAreas: [{ mainSwabAreaName: 'ล้อรถเข็นกะบะ' }],
              },
            ],
          },
        ],
      },
    ];

    const cleaningValidations: CleaningValidation[] = [];

    for (let index = 0; index < cleaningValidationSeed.length; index++) {
      const {
        cleaningValidationName,
        swabCleaningValidations: swabCleaningValidationData = [],
      } = cleaningValidationSeed[index];

      let cleaningValidation = await this.cleaningValidationService.findOneBy({
        cleaningValidationName,
      });

      if (!cleaningValidation) {
        cleaningValidation = await this.cleaningValidationService.save(
          this.cleaningValidationService.make({
            cleaningValidationName,
          }),
        );
      }

      const swabCleaningValidations: SwabCleaningValidation[] = [];

      if (swabCleaningValidationData.length) {
        for (
          let swabCleaningValidationIndex = 0;
          swabCleaningValidationIndex < swabCleaningValidationData.length;
          swabCleaningValidationIndex++
        ) {
          const { swabPeriodName, facilities = [] } =
            swabCleaningValidationData[swabCleaningValidationIndex];

          const swabPeriod = await this.swabPeriodService.findOneByOrFail({
            swabPeriodName,
          });

          for (
            let facilityIndex = 0;
            facilityIndex < facilities.length;
            facilityIndex++
          ) {
            const { facilityName, swabAreas = [] } = facilities[facilityIndex];

            const facility = await this.facilityService.findOneByOrFail({
              facilityName,
            });

            for (
              let mainSwabAreaIndex = 0;
              mainSwabAreaIndex < swabAreas.length;
              mainSwabAreaIndex++
            ) {
              const { mainSwabAreaName, subSwabAreaNames = [] } =
                swabAreas[mainSwabAreaIndex];

              let allAreas: SwabArea[] = [];

              const mainSwabArea = await this.swabAreaService.findOneBy({
                mainSwabAreaId: IsNull(),
                facilityId: facility.id,
                swabAreaName: mainSwabAreaName,
              });

              if (mainSwabArea) {
                allAreas.push(mainSwabArea);

                const subSwabAreas = await this.swabAreaService.findBy({
                  mainSwabAreaId: mainSwabArea.id,
                  facilityId: facility.id,
                  swabAreaName: In(subSwabAreaNames),
                });

                if (subSwabAreas.length) {
                  allAreas = [...allAreas, ...subSwabAreas];
                }
              }

              if (allAreas.length) {
                for (
                  let swabAreaIndex = 0;
                  swabAreaIndex < allAreas.length;
                  swabAreaIndex++
                ) {
                  const swabArea = allAreas[swabAreaIndex];

                  let swabCleaningValidation =
                    await this.swabCleaningValidationService.findOneBy({
                      swabPeriodId: swabPeriod.id,
                      swabAreaId: swabArea.id,
                      cleaningValidationId: cleaningValidation.id,
                    });

                  if (!swabCleaningValidation) {
                    swabCleaningValidation =
                      this.swabCleaningValidationService.make({
                        swabPeriodId: swabPeriod.id,
                        swabAreaId: swabArea.id,
                      });
                  }

                  swabCleaningValidations.push(swabCleaningValidation);
                }
              }
            }
          }
        }
      }

      if (swabCleaningValidations.length) {
        cleaningValidation.swabCleaningValidations = swabCleaningValidations;
      }

      cleaningValidations.push(cleaningValidation);
    }

    await this.cleaningValidationService.saveMany(cleaningValidations);
  }
}
