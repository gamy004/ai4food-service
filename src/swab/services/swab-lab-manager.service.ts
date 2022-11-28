import { Injectable } from '@nestjs/common';
import { SwabTestService } from './swab-test.service';
import { User } from '~/auth/entities/user.entity';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';
// import { BacteriaSpecie } from '~/lab/entities/bacteria-specie.entity';
import { Bacteria } from '~/lab/entities/bacteria.entity';
import { BacteriaSpecieService } from '~/lab/services/bacteria-specie.service';
import { BacteriaService } from '~/lab/services/bacteria.service';
import { BodyUpdateSwabTestDto } from '../dto/command-update-swab-test.dto';
import { CommandUpdateSwabTestBacteriaSpecieDto } from '../dto/command-update-swab-test-bacteria-specie.dto';
import { SwabTest } from '../entities/swab-test.entity';
import { DeepPartial } from 'typeorm';

@Injectable()
export class SwabLabManagerService {
  constructor(
    private readonly transaction: TransactionDatasource,
    private readonly bacteriaService: BacteriaService,
    private readonly bacteriaSpecieService: BacteriaSpecieService,
    private readonly swabTestService: SwabTestService,
  ) {}

  async commandUpdateBacteria(
    id: number,
    bodycommandUpdateSwabTestDto: BodyUpdateSwabTestDto,
    recordedUser: User,
  ): Promise<void> {
    const {
      swabTestRecordedAt,
      swabTestNote,
      bacteriaSpecies = [],
    } = bodycommandUpdateSwabTestDto;

    await this.transaction.execute(async (queryRunnerManger) => {
      const existsBacteriaMapping = {};
      // const existsBacteriaSpecieMapping = {};
      const newBacteriaMapping = {};
      // const newBacteriaSpecieMapping = {};
      const swabTestBacteria = {};
      // const swabTestBacteriaSpecie = {};

      for (let index = 0; index < bacteriaSpecies.length; index++) {
        const {
          bacteriaId,
          bacteriaName,
          // bacteriaSpecieId,
          // bacteriaSpecieName,
        } = bacteriaSpecies[index];

        // if new bacteria is inserted
        if (!bacteriaId && bacteriaName) {
          // find existing bacteria name
          if (!existsBacteriaMapping[bacteriaName]) {
            const bacteria = await this.bacteriaService.findOne({
              where: { bacteriaName },
              transaction: true,
            });

            if (bacteria) {
              existsBacteriaMapping[bacteriaName] = bacteria.id;
            }
          }

          // if bacteria exists
          if (existsBacteriaMapping[bacteriaName]) {
            bacteriaSpecies[index].bacteriaId =
              existsBacteriaMapping[bacteriaName];
          } else {
            // if new bacteria have not already inserted
            if (!newBacteriaMapping[bacteriaName]) {
              const newBacteria: Bacteria = await queryRunnerManger.save(
                this.bacteriaService.make({ bacteriaName }),
              );

              newBacteriaMapping[bacteriaName] = newBacteria.id;
            }

            // if new bacteria mapping id exists, fill it to the input data
            if (newBacteriaMapping[bacteriaName]) {
              bacteriaSpecies[index].bacteriaId =
                newBacteriaMapping[bacteriaName];
            }
          }
        }

        // if new bacteria specie is inserted with bacteria id
        // if (
        //   bacteriaSpecies[index].bacteriaId &&
        //   !bacteriaSpecieId &&
        //   bacteriaSpecieName
        // ) {
        //   // find existing bacteria specie name
        //   if (!existsBacteriaSpecieMapping[bacteriaSpecieName]) {
        //     const bacteriaSpecie = await this.bacteriaSpecieService.findOne({
        //       where: { bacteriaSpecieName },
        //       transaction: true,
        //     });

        //     if (bacteriaSpecie) {
        //       existsBacteriaSpecieMapping[bacteriaSpecieName] =
        //         bacteriaSpecie.id;
        //     }
        //   }

        //   // if bacteria specie exists
        //   if (existsBacteriaSpecieMapping[bacteriaSpecieName]) {
        //     bacteriaSpecies[index].bacteriaSpecieId =
        //       existsBacteriaSpecieMapping[bacteriaSpecieName];
        //   } else {
        //     // if new bacteria specie have not already inserted
        //     if (!newBacteriaSpecieMapping[bacteriaSpecieName]) {
        //       const newBacteriaSpecie: BacteriaSpecie =
        //         await queryRunnerManger.save(
        //           this.bacteriaSpecieService.make({
        //             bacteriaId: bacteriaSpecies[index].bacteriaId,
        //             bacteriaSpecieName,
        //           }),
        //         );

        //       newBacteriaSpecieMapping[bacteriaSpecieName] =
        //         newBacteriaSpecie.id;
        //     }

        //     // if new bacteria mapping id exists, fill it to the input data
        //     if (newBacteriaSpecieMapping[bacteriaSpecieName]) {
        //       bacteriaSpecies[index].bacteriaSpecieId =
        //         newBacteriaSpecieMapping[bacteriaSpecieName];
        //     }
        //   }
        // }

        if (bacteriaSpecies[index].bacteriaId) {
          swabTestBacteria[bacteriaSpecies[index].bacteriaId] = true;
        }

        // if (bacteriaSpecies[index].bacteriaSpecieId) {
        //   swabTestBacteriaSpecie[bacteriaSpecies[index].bacteriaSpecieId] =
        //     true;
        // }
      }

      // Update swab test relation
      const swabTest = await this.swabTestService.findOne({
        where: { id },
        transaction: true,
      });

      swabTest.swabTestRecordedAt = swabTestRecordedAt;
      console.log(swabTestRecordedAt);

      swabTest.bacteriaRecordedAt = swabTestRecordedAt;

      swabTest.bacteriaRecordedUser = recordedUser;

      swabTest.recordedUser = recordedUser;

      if (swabTestNote) {
        swabTest.swabTestNote = swabTestNote;
      }

      swabTest.bacteria = Object.keys(swabTestBacteria).map((id) =>
        this.bacteriaService.make({ id }),
      );

      // swabTest.bacteriaSpecies = Object.keys(swabTestBacteriaSpecie).map((id) =>
      //   this.bacteriaSpecieService.make({ id }),
      // );

      await queryRunnerManger.save(swabTest);
    });
  }

  async commandUpdateBacteriaSpecie(
    id: number,
    bodycommandUpdateSwabTestDto: CommandUpdateSwabTestBacteriaSpecieDto,
    bacteriaSpecieRecordedUser: User,
  ): Promise<DeepPartial<SwabTest> & SwabTest> {
    const { bacteriaSpecieRecordedAt, bacteriaSpecies = [] } =
      bodycommandUpdateSwabTestDto;

    const swabTest = await this.swabTestService.findOneBy({ id });

    swabTest.bacteriaSpecieRecordedAt = bacteriaSpecieRecordedAt;

    swabTest.bacteriaSpecieRecordedUser = bacteriaSpecieRecordedUser;

    swabTest.bacteriaSpecies = bacteriaSpecies.map((id) =>
      this.bacteriaSpecieService.make({ id }),
    );

    return await this.swabTestService.save(swabTest);
  }
}
