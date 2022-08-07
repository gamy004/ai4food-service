import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from "typeorm";
import { CrudService } from '~/common/services/abstract.crud.service';
import { SwabTest } from '../entities/swab-test.entity';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { BodyUpdateSwabTestDto, UpsertBacteriaWithBacteriaSpecieDto } from '../dto/command-update-swab-test.dto';
import { UpsertSwabEnvironmentDto } from '../dto/upsert-swab-environment.dto';
import { TransactionDatasource } from '~/common/datasource/transaction.datasource';
import { BacteriaService } from '~/lab/services/bacteria.service';
import { Bacteria } from '~/lab/entities/bacteria.entity';
import { BacteriaSpecie } from '~/lab/entities/bacteria-specie.entity';
import { BacteriaSpecieService } from '~/lab/services/bacteria-specie.service';
import { User } from '~/auth/entities/user.entity';

@Injectable()
export class SwabTestService extends CrudService<SwabTest> {
  constructor(
    private readonly transaction: TransactionDatasource,
    private readonly bacteriaService: BacteriaService,
    private readonly bacteriaSpecieService: BacteriaSpecieService,
    @InjectRepository(SwabTest)
    repository: CommonRepositoryInterface<SwabTest>
  ) {
    super(repository);
  }

  async commandUpdateBacteriaSpecie(
    id: number,
    bodycommandUpdateSwabTestDto: BodyUpdateSwabTestDto,
    recordedUser: User
  ): Promise<void> {
    const {
      swabTestRecordedAt,
      bacteriaSpecies = []
    } = bodycommandUpdateSwabTestDto;

    await this.transaction.execute(
      async (queryRunnerManger) => {
        const existsBacteriaMapping = {};
        const existsBacteriaSpecieMapping = {};
        const newBacteriaMapping = {};
        const newBacteriaSpecieMapping = {};
        const swabTestBacteria = {};
        const swabTestBacteriaSpecie = {};

        for (let index = 0; index < bacteriaSpecies.length; index++) {
          const {
            bacteriaId,
            bacteriaName,
            bacteriaSpecieId,
            bacteriaSpecieName
          } = bacteriaSpecies[index];

          // if new bacteria is inserted
          if (!bacteriaId && bacteriaName) {

            // find existing bacteria name
            if (!existsBacteriaMapping[bacteriaName]) {
              const bacteria = await this.bacteriaService.findOne({ bacteriaName });

              if (bacteria) {
                existsBacteriaMapping[bacteriaName] = bacteria.id;
              }
            }

            // if bacteria exists
            if (existsBacteriaMapping[bacteriaName]) {
              bacteriaSpecies[index].bacteriaId = existsBacteriaMapping[bacteriaName];
            } else {
              // if new bacteria have not already inserted
              if (!newBacteriaMapping[bacteriaName]) {
                const newBacteria: Bacteria = await queryRunnerManger.save(
                  this.bacteriaService.init({ bacteriaName })
                );

                newBacteriaMapping[bacteriaName] = newBacteria.id;
              }

              // if new bacteria mapping id exists, fill it to the input data
              if (newBacteriaMapping[bacteriaName]) {
                bacteriaSpecies[index].bacteriaId = newBacteriaMapping[bacteriaName];
              }
            }
          }

          // if new bacteria specie is inserted with bacteria id
          if (bacteriaSpecies[index].bacteriaId && !bacteriaSpecieId && bacteriaSpecieName) {
            // find existing bacteria specie name
            if (!existsBacteriaSpecieMapping[bacteriaSpecieName]) {
              const bacteriaSpecie = await this.bacteriaSpecieService.findOne({ bacteriaSpecieName });

              if (bacteriaSpecie) {
                existsBacteriaSpecieMapping[bacteriaSpecieName] = bacteriaSpecie.id;
              }
            }

            // if bacteria specie exists
            if (existsBacteriaSpecieMapping[bacteriaSpecieName]) {
              bacteriaSpecies[index].bacteriaSpecieId = existsBacteriaSpecieMapping[bacteriaSpecieName];
            } else {
              // if new bacteria specie have not already inserted
              if (!newBacteriaSpecieMapping[bacteriaSpecieName]) {
                const newBacteriaSpecie: BacteriaSpecie = await queryRunnerManger.save(
                  this.bacteriaSpecieService.init({
                    bacteriaId: bacteriaSpecies[index].bacteriaId,
                    bacteriaSpecieName
                  })
                );

                newBacteriaSpecieMapping[bacteriaSpecieName] = newBacteriaSpecie.id;
              }

              // if new bacteria mapping id exists, fill it to the input data
              if (newBacteriaSpecieMapping[bacteriaSpecieName]) {
                bacteriaSpecies[index].bacteriaSpecieId = newBacteriaSpecieMapping[bacteriaSpecieName];
              }
            }
          }

          if (bacteriaSpecies[index].bacteriaId) {
            swabTestBacteria[bacteriaSpecies[index].bacteriaId] = true;
          }

          if (bacteriaSpecies[index].bacteriaSpecieId) {
            swabTestBacteriaSpecie[bacteriaSpecies[index].bacteriaSpecieId] = true;
          }
        }

        // Update swab test relation
        const swabTest = await this.repository.findOneBy({ id });

        swabTest.swabTestRecordedAt = swabTestRecordedAt;

        swabTest.recordedUser = recordedUser;

        swabTest.bacteria = Object.keys(swabTestBacteria).map(id => this.bacteriaService.init({ id }));

        swabTest.bacteriaSpecies = Object.keys(swabTestBacteriaSpecie).map(id => this.bacteriaSpecieService.init({ id }));

        await queryRunnerManger.save(swabTest);
      }
    )
  }
}