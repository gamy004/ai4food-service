import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Facility, FacilityType } from '~/facility/entities/facility.entity';
import { Zone } from '~/facility/entities/zone.entity';
import { Room } from '~/facility/entities/room.entity';

type saveFacilityItem = {
    facilityItemName: string;
    zone: null | Zone;
    room: null | Room;
};

export default class FacilitySeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const zoneRepository = dataSource.getRepository(Zone);
        const roomRepository = dataSource.getRepository(Room);
        const facilityRepository = dataSource.getRepository(Facility);

        // // // ---------------------------------------------------
        const zones = [
            {
                zoneName: "สุก",
                rooms: [
                    { roomName: "Inspection&chilling area" },
                    { roomName: "Rice mixing & vacuum" },
                    { roomName: "Equipment wash" },
                    { roomName: "Processing 1" },
                    { roomName: "Processing 2" },
                    { roomName: "Processing 3" },
                ]
            },
            {
                zoneName: "ดิบ 1",
                rooms: [
                    { roomName: "Eggs preparation" },
                    { roomName: "Meat preparation" },
                    { roomName: "Vegetable preparation" },
                    { roomName: "Equipment wash" },
                    { roomName: "Rice storage" },
                ]
            },
            {
                zoneName: "ดิบ 3",
                rooms: [
                    { roomName: "Cooking 1" },
                    { roomName: "Cooking 2 (Fryer)" },
                    { roomName: "Rice cooker" },
                    { roomName: "Equipment wash" },
                ]
            }
        ];

        await zoneRepository.save(zones);

        const facilities = [
            {
                facilityName: "ขึ้นรูป",
                facilityType: FacilityType.MACHINE,
                facilityItems: [
                    {
                        facilityItemName: "ขึ้นรูป1",
                        zone: "สุก",
                        room: "Processing 1"
                    },
                    {
                        facilityItemName: "ไลน์1 ขึ้นรูป1",
                        zone: "สุก",
                        room: "Processing 1"
                    },
                    {
                        facilityItemName: "ไลน์2 ขึ้นรูป1",
                        zone: "สุก",
                        room: "Processing 1"
                    },
                    {
                        facilityItemName: "ไลน์11 ขึ้นรูป1",
                        zone: "สุก",
                        room: "Processing 1"
                    },
                    {
                        facilityItemName: "ขึ้นรูป2",
                        zone: "สุก",
                        room: "Processing 2"
                    },
                    {
                        facilityItemName: "ไลน์3 ขึ้นรูป2",
                        zone: "สุก",
                        room: "Processing 2"
                    },
                    {
                        facilityItemName: "ไลน์4 ขึ้นรูป2",
                        zone: "สุก",
                        room: "Processing 2"
                    },
                    {
                        facilityItemName: "ไลน์5 ขึ้นรูป2",
                        zone: "สุก",
                        room: "Processing 2"
                    },
                    {
                        facilityItemName: "ขึ้นรูป3",
                        zone: "สุก",
                        room: "Processing 3"
                    },
                    {
                        facilityItemName: "ไลน์6 ขึ้นรูป3",
                        zone: "สุก",
                        room: "Processing 3"
                    },
                    {
                        facilityItemName: "ไลน์7 ขึ้นรูป3",
                        zone: "สุก",
                        room: "Processing 3"
                    },
                    {
                        facilityItemName: "ไลน์8 ขึ้นรูป3",
                        zone: "สุก",
                        room: "Processing 3"
                    },
                    {
                        facilityItemName: "ไลน์9 ขึ้นรูป3",
                        zone: "สุก",
                        room: "Processing 3"
                    },
                    {
                        facilityItemName: "ไลน์10 ขึ้นรูป3",
                        zone: "สุก",
                        room: "Processing 3"
                    },
                ]
            },
            {
                facilityName: "ตู้ Steam",
                facilityType: FacilityType.MACHINE,
                facilityItems: [
                    {
                        facilityItemName: "ตู้ Steam โซนสุก No.1",
                        zone: "สุก",
                        room: null
                    },
                    {
                        facilityItemName: "ตู้ Steam โซนสุก No.2",
                        zone: "สุก",
                        room: null
                    },
                    {
                        facilityItemName: "ตู้ Steam โซนสุก No.3",
                        zone: "สุก",
                        room: null
                    },
                    {
                        facilityItemName: "ตู้ Steam โซนสุก No.4",
                        zone: "สุก",
                        room: null
                    },
                ]
            },
            {
                facilityName: "ตู้ Vac.",
                facilityType: FacilityType.MACHINE,
                facilityItems: [
                    {
                        facilityItemName: "ตู้ Vac. โซนสุก No.1",
                        zone: "สุก",
                        room: "Rice mixing & vacuum",
                    },
                    {
                        facilityItemName: "ตู้ Vac. โซนสุก No.2",
                        zone: "สุก",
                        room: "Rice mixing & vacuum",
                    },
                    {
                        facilityItemName: "ตู้ Vac. โซนสุก No.3",
                        zone: "สุก",
                        room: "Rice mixing & vacuum",
                    },
                    {
                        facilityItemName: "ตู้ Vac. โซนสุก No.4",
                        zone: "สุก",
                        room: "Rice mixing & vacuum",
                    },
                    {
                        facilityItemName: "ตู้ Vac. โซนสุก No.5",
                        zone: "สุก",
                        room: "Rice mixing & vacuum",
                    },
                    {
                        facilityItemName: "ตู้ Vac. โซนสุก No.11",
                        zone: "สุก",
                        room: "Rice mixing & vacuum",
                    },
                    {
                        facilityItemName: "ตู้ Vac. โซนสุก No.12",
                        zone: "สุก",
                        room: "Rice mixing & vacuum",
                    },
                    {
                        facilityItemName: "ตู้ Vac. โซนสุก No.13",
                        zone: "สุก",
                        room: "Rice mixing & vacuum",
                    },
                    {
                        facilityItemName: "ตู้ Vac. โซนสุก No.14",
                        zone: "สุก",
                        room: "Rice mixing & vacuum",
                    },
                ]
            },
            {
                facilityName: "กล่องเครื่องมือวิศวะ",
                facilityType: FacilityType.TOOL,
                facilityItems: [
                    {
                        facilityItemName: "กล่องเครื่องมือวิศวะ โซนสุก",
                        zone: "สุก",
                        room: null
                    }
                ]
            },
            {
                facilityName: "รถเข็นกะบะ",
                facilityType: FacilityType.TOOL,
                facilityItems: [
                    {
                        facilityItemName: "รถเข็นกะบะ โซนสุก",
                        zone: "สุก",
                        room: null
                    }
                ]
            },
            {
                facilityName: "เครื่องซุยข้าว Aiho",
                facilityType: FacilityType.MACHINE,
                facilityItems: [
                    {
                        facilityItemName: "เครื่องซุยข้าว Aiho No.1",
                        zone: "สุก",
                        room: "Rice mixing & vacuum",
                    },
                    {
                        facilityItemName: "เครื่องซุยข้าว Aiho No.2",
                        zone: "สุก",
                        room: "Rice mixing & vacuum",
                    },
                    {
                        facilityItemName: "เครื่องซุยข้าว Aiho No.3",
                        zone: "สุก",
                        room: "Rice mixing & vacuum",
                    },
                ]
            },
            { facilityName: "Blast chill", facilityType: FacilityType.MACHINE },
            { facilityName: "IQF", facilityType: FacilityType.MACHINE },
            { facilityName: "Spiral lift", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องซุยข้าว Santake", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องล้างภาชนะ", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องตอกไข่,ตีไข่", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องบดเนื้อ", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องบดผัก", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องผสมแกนนอน", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องล้างผัก", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องสลัดน้ำ", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องสับผัก", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องหมัก", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องหั่นเต๋าผัก", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องหั่นเนื้อ", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องหั่นชิ้น", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องหั่นผัก", facilityType: FacilityType.MACHINE },
            { facilityName: "ไซโลส่งข้าวสาร", facilityType: FacilityType.MACHINE },
            { facilityName: "Air force oven", facilityType: FacilityType.MACHINE },
            { facilityName: "Blending cooker", facilityType: FacilityType.MACHINE },
            { facilityName: "Combi oven", facilityType: FacilityType.MACHINE },
            { facilityName: "IH cooker", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องทำไข่หวาน", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องลวกผัก", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องล้างกระบะข้าว", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องหุงข้าว Aiho", facilityType: FacilityType.MACHINE },
            { facilityName: "เครื่องหุงข้าว Santake", facilityType: FacilityType.MACHINE },
        ];

        for (let index = 0; index < facilities.length; index++) {
            const facility = facilities[index];

            const { facilityItems = [], ...facilityProps } = facility;

            const savedFacilityItems = await Promise.all(facilityItems.map(
                async (facilityItem) => {
                    let { zone = null, room = null, facilityItemName } = facilityItem;

                    const facilityItemProp: saveFacilityItem = {
                        facilityItemName,
                        zone: null,
                        room: null
                    };

                    if (zone !== null) {
                        const relatedZone = await zoneRepository.findOneBy({ zoneName: zone });

                        if (relatedZone) {
                            facilityItemProp.zone = relatedZone;

                            if (room !== null) {
                                const relatedRoom = await roomRepository.findOneBy({
                                    roomName: room,
                                    zone: {
                                        id: relatedZone.id
                                    }
                                });

                                if (relatedRoom) {
                                    facilityItemProp.room = relatedRoom;
                                }
                            }
                        }
                    }


                    return facilityItemProp;
                }
            ))
            await facilityRepository.save({
                ...facilityProps,
                facilityItems: savedFacilityItems
            });
        }
    }
}