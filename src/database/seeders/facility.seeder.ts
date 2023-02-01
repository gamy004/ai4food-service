// import { keyBy } from 'lodash';
import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Facility, FacilityType } from '~/facility/entities/facility.entity';
import { Zone } from '~/facility/entities/zone.entity';
import { Room } from '~/facility/entities/room.entity';
import { FacilityItem } from '~/facility/entities/facility-item.entity';
import { RiskZone } from '~/facility/entities/risk-zone.entity';

type saveFacilityItem = {
  facilityItemName: string;
  zone: null | Zone;
  room: null | Room;
  riskZone: null | RiskZone;
};

export default class FacilitySeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const zoneRepository = dataSource.getRepository(Zone);
    const roomRepository = dataSource.getRepository(Room);
    const facilityRepository = dataSource.getRepository(Facility);
    const facilityItemRepository = dataSource.getRepository(FacilityItem);
    const riskZoneRepository = dataSource.getRepository(RiskZone);

    // // // ---------------------------------------------------
    const zonesTemplate = [
      {
        zoneName: 'สุก',
        rooms: [
          { roomName: 'Inspection&chilling area', riskZoneName: 'Medium Risk' },
          { roomName: 'Rice mixing & vacuum', riskZoneName: 'High Risk' },
          { roomName: 'Equipment wash', riskZoneName: 'High Risk' },
          { roomName: 'Processing 1', riskZoneName: 'High Risk' },
          { roomName: 'Processing 2', riskZoneName: 'High Risk' },
          { roomName: 'Processing 3', riskZoneName: 'High Risk' },
        ],
      },
      {
        zoneName: 'ดิบ 1',
        rooms: [
          { roomName: 'Eggs preparation', riskZoneName: 'Low Risk Floor 1' },
          { roomName: 'Meat preparation', riskZoneName: 'Low Risk Floor 1' },
          {
            roomName: 'Vegetable preparation',
            riskZoneName: 'Low Risk Floor 1',
          },
          { roomName: 'Equipment wash', riskZoneName: 'Low Risk Floor 1' },
          { roomName: 'Rice storage', riskZoneName: 'Low Risk Floor 1' },
        ],
      },
      {
        zoneName: 'ดิบ 3',
        rooms: [
          { roomName: 'Cooking 1', riskZoneName: 'Low Risk Floor 3' },
          { roomName: 'Cooking 2 (Fryer)', riskZoneName: 'Low Risk Floor 3' },
          { roomName: 'Rice cooker', riskZoneName: 'Low Risk Floor 3' },
          { roomName: 'Equipment wash', riskZoneName: 'Low Risk Floor 3' },
        ],
      },
    ];

    const riskZones = await riskZoneRepository.findBy([
      { riskZoneName: 'Low Risk Floor 1' },
      { riskZoneName: 'Low Risk Floor 3' },
      { riskZoneName: 'Medium Risk' },
      { riskZoneName: 'High Risk' },
    ]);

    const riskZoneMapping = riskZones.reduce((mapping, riskZone) => {
      mapping[riskZone.riskZoneName] = riskZone;

      return mapping;
    }, {});

    const savedRooms = [];

    for (let zoneIndex = 0; zoneIndex < zonesTemplate.length; zoneIndex++) {
      const { zoneName, rooms = [] } = zonesTemplate[zoneIndex];

      let targetZone = await zoneRepository.findOneBy({ zoneName });

      if (!targetZone) {
        targetZone = await zoneRepository.save({
          zoneName,
        });
      }

      for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
        const { roomName, riskZoneName } = rooms[roomIndex];
        const riskZone = riskZoneMapping[riskZoneName];

        const savedRoomEntity = roomRepository.create({
          roomName,
          zone: targetZone,
          riskZone,
        });

        const targetRoom = await roomRepository.findOneBy({
          roomName,
          zoneId: targetZone.id,
          riskZoneId: riskZone.id,
        });

        if (targetRoom) {
          savedRoomEntity.id = targetRoom.id;
        }

        savedRooms.push(savedRoomEntity);
      }
    }

    await roomRepository.save(savedRooms);

    // const mappedZoneRoom = keyBy(zones, (zone) => {
    //     const { zoneName, room } = zone;
    //     const { roomName } = room;

    //     return `${zoneName}_${roomName}`;
    // });

    const facilities = [
      {
        facilityName: 'ขึ้นรูป',
        facilityType: FacilityType.MACHINE,
        facilityItems: [
          {
            facilityItemName: 'ขึ้นรูป1',
            zone: 'สุก',
            room: 'Processing 1',
          },
          {
            facilityItemName: 'ไลน์1 ขึ้นรูป1',
            zone: 'สุก',
            room: 'Processing 1',
          },
          {
            facilityItemName: 'ไลน์2 ขึ้นรูป1',
            zone: 'สุก',
            room: 'Processing 1',
          },
          {
            facilityItemName: 'ไลน์11 ขึ้นรูป1',
            zone: 'สุก',
            room: 'Processing 1',
          },
          {
            facilityItemName: 'ขึ้นรูป2',
            zone: 'สุก',
            room: 'Processing 2',
          },
          {
            facilityItemName: 'ไลน์3 ขึ้นรูป2',
            zone: 'สุก',
            room: 'Processing 2',
          },
          {
            facilityItemName: 'ไลน์4 ขึ้นรูป2',
            zone: 'สุก',
            room: 'Processing 2',
          },
          {
            facilityItemName: 'ไลน์5 ขึ้นรูป2',
            zone: 'สุก',
            room: 'Processing 2',
          },
          {
            facilityItemName: 'ขึ้นรูป3',
            zone: 'สุก',
            room: 'Processing 3',
          },
          {
            facilityItemName: 'ไลน์6 ขึ้นรูป3',
            zone: 'สุก',
            room: 'Processing 3',
          },
          {
            facilityItemName: 'ไลน์7 ขึ้นรูป3',
            zone: 'สุก',
            room: 'Processing 3',
          },
          {
            facilityItemName: 'ไลน์8 ขึ้นรูป3',
            zone: 'สุก',
            room: 'Processing 3',
          },
          {
            facilityItemName: 'ไลน์9 ขึ้นรูป3',
            zone: 'สุก',
            room: 'Processing 3',
          },
          {
            facilityItemName: 'ไลน์10 ขึ้นรูป3',
            zone: 'สุก',
            room: 'Processing 3',
          },
        ],
      },
      {
        facilityName: 'ตู้ Steam',
        facilityType: FacilityType.MACHINE,
        facilityItems: [
          {
            facilityItemName: 'ตู้ Steam โซนสุก No.1',
            zone: 'สุก',
            room: null,
          },
          {
            facilityItemName: 'ตู้ Steam โซนสุก No.2',
            zone: 'สุก',
            room: null,
          },
          {
            facilityItemName: 'ตู้ Steam โซนสุก No.3',
            zone: 'สุก',
            room: null,
          },
          {
            facilityItemName: 'ตู้ Steam โซนสุก No.4',
            zone: 'สุก',
            room: null,
          },
        ],
      },
      {
        facilityName: 'ตู้ Vac.',
        facilityType: FacilityType.MACHINE,
        facilityItems: [
          {
            facilityItemName: 'ตู้ Vac. โซนสุก No.1',
            zone: 'สุก',
            room: 'Rice mixing & vacuum',
          },
          {
            facilityItemName: 'ตู้ Vac. โซนสุก No.2',
            zone: 'สุก',
            room: 'Rice mixing & vacuum',
          },
          {
            facilityItemName: 'ตู้ Vac. โซนสุก No.3',
            zone: 'สุก',
            room: 'Rice mixing & vacuum',
          },
          {
            facilityItemName: 'ตู้ Vac. โซนสุก No.4',
            zone: 'สุก',
            room: 'Rice mixing & vacuum',
          },
          {
            facilityItemName: 'ตู้ Vac. โซนสุก No.5',
            zone: 'สุก',
            room: 'Rice mixing & vacuum',
          },
          {
            facilityItemName: 'ตู้ Vac. โซนสุก No.11',
            zone: 'สุก',
            room: 'Rice mixing & vacuum',
          },
          {
            facilityItemName: 'ตู้ Vac. โซนสุก No.12',
            zone: 'สุก',
            room: 'Rice mixing & vacuum',
          },
          {
            facilityItemName: 'ตู้ Vac. โซนสุก No.13',
            zone: 'สุก',
            room: 'Rice mixing & vacuum',
          },
          {
            facilityItemName: 'ตู้ Vac. โซนสุก No.14',
            zone: 'สุก',
            room: 'Rice mixing & vacuum',
          },
        ],
      },
      {
        facilityName: 'กล่องเครื่องมือวิศวะ',
        facilityType: FacilityType.TOOL,
        facilityItems: [
          {
            facilityItemName: 'กล่องเครื่องมือวิศวะ โซนสุก',
            zone: 'สุก',
            room: null,
          },
        ],
      },
      {
        facilityName: 'รถเข็นกะบะ',
        facilityType: FacilityType.TOOL,
        facilityItems: [
          {
            facilityItemName: 'รถเข็นกะบะ โซนสุก',
            zone: 'สุก',
            room: null,
          },
        ],
      },
      {
        facilityName: 'เครื่องซุยข้าว Aiho',
        facilityType: FacilityType.MACHINE,
        facilityItems: [
          {
            facilityItemName: 'เครื่องซุยข้าว Aiho No.1',
            zone: 'สุก',
            room: 'Rice mixing & vacuum',
          },
          {
            facilityItemName: 'เครื่องซุยข้าว Aiho No.2',
            zone: 'สุก',
            room: 'Rice mixing & vacuum',
          },
          {
            facilityItemName: 'เครื่องซุยข้าว Aiho No.3',
            zone: 'สุก',
            room: 'Rice mixing & vacuum',
          },
        ],
      },
      { facilityName: 'Blast chill', facilityType: FacilityType.MACHINE },
      { facilityName: 'IQF', facilityType: FacilityType.MACHINE },
      { facilityName: 'Spiral lift', facilityType: FacilityType.MACHINE },
      {
        facilityName: 'เครื่องซุยข้าว Santake',
        facilityType: FacilityType.MACHINE,
      },
      { facilityName: 'เครื่องล้างภาชนะ', facilityType: FacilityType.MACHINE },
      {
        facilityName: 'เครื่องตอกไข่,ตีไข่',
        facilityType: FacilityType.MACHINE,
      },
      { facilityName: 'เครื่องบดเนื้อ', facilityType: FacilityType.MACHINE },
      { facilityName: 'เครื่องบดผัก', facilityType: FacilityType.MACHINE },
      { facilityName: 'เครื่องผสมแกนนอน', facilityType: FacilityType.MACHINE },
      { facilityName: 'เครื่องล้างผัก', facilityType: FacilityType.MACHINE },
      { facilityName: 'เครื่องสลัดน้ำ', facilityType: FacilityType.MACHINE },
      { facilityName: 'เครื่องสับผัก', facilityType: FacilityType.MACHINE },
      { facilityName: 'เครื่องหมัก', facilityType: FacilityType.MACHINE },
      {
        facilityName: 'เครื่องหั่นเต๋าผัก',
        facilityType: FacilityType.MACHINE,
      },
      { facilityName: 'เครื่องหั่นเนื้อ', facilityType: FacilityType.MACHINE },
      { facilityName: 'เครื่องหั่นชิ้น', facilityType: FacilityType.MACHINE },
      { facilityName: 'เครื่องหั่นผัก', facilityType: FacilityType.MACHINE },
      { facilityName: 'ไซโลส่งข้าวสาร', facilityType: FacilityType.MACHINE },
      { facilityName: 'Air force oven', facilityType: FacilityType.MACHINE },
      { facilityName: 'Blending cooker', facilityType: FacilityType.MACHINE },
      { facilityName: 'Combi oven', facilityType: FacilityType.MACHINE },
      { facilityName: 'IH cooker', facilityType: FacilityType.MACHINE },
      { facilityName: 'เครื่องทำไข่หวาน', facilityType: FacilityType.MACHINE },
      { facilityName: 'เครื่องลวกผัก', facilityType: FacilityType.MACHINE },
      {
        facilityName: 'เครื่องล้างกระบะข้าว',
        facilityType: FacilityType.MACHINE,
      },
      {
        facilityName: 'เครื่องหุงข้าว Aiho',
        facilityType: FacilityType.MACHINE,
      },
      {
        facilityName: 'เครื่องหุงข้าว Santake',
        facilityType: FacilityType.MACHINE,
      },
    ];

    for (let index = 0; index < facilities.length; index++) {
      const facility = facilities[index];

      const { facilityItems = [], facilityName, facilityType } = facility;

      const savedFacility = facilityRepository.create({
        facilityName,
        facilityType,
        facilityItems: [],
      });

      const targetFacility = await facilityRepository.findOneBy({
        facilityName,
      });

      if (targetFacility) {
        savedFacility.id = targetFacility.id;
      }

      savedFacility.facilityItems = await Promise.all(
        facilityItems.map(async (facilityItem) => {
          let { zone = null, room = null, facilityItemName } = facilityItem;

          const savedFacilityItem = facilityItemRepository.create({
            facilityItemName,
            zone: null,
            room: null,
            riskZone: null,
          });

          const relatedFacilityItem = await facilityItemRepository.findOneBy({
            facilityItemName,
          });

          if (relatedFacilityItem) {
            savedFacilityItem.id = relatedFacilityItem.id;
          }

          if (zone !== null) {
            const relatedZone = await zoneRepository.findOneBy({
              zoneName: zone,
            });

            if (relatedZone) {
              savedFacilityItem.zone = relatedZone;

              if (room !== null) {
                const relatedRoom = await roomRepository.findOneBy({
                  roomName: room,
                  zone: {
                    id: relatedZone.id,
                  },
                });

                if (relatedRoom) {
                  savedFacilityItem.room = relatedRoom;

                  if (relatedRoom.riskZoneId) {
                    savedFacilityItem.riskZone = riskZoneRepository.create({
                      id: relatedRoom.riskZoneId,
                    });
                  }
                }
              }
            }
          }

          return savedFacilityItem;
        }),
      );

      await facilityRepository.save(savedFacility);
    }
  }
}
