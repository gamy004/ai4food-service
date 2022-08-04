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

  async commandUpdateBacteriaSpecie(id: number, bodycommandUpdateSwabTestDto: BodyUpdateSwabTestDto): Promise<void> {
    const {
      bacteriaSpecies = []
    } = bodycommandUpdateSwabTestDto;

    await this.transaction.execute(
      async (queryRunnerManger) => {
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
            // TODO: find bacteria name before insert new bacteria !!!

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

          // if new bacteria specie is inserted with bacteria id
          if (bacteriaSpecies[index].bacteriaId && !bacteriaSpecieId && bacteriaSpecieName) {
            // TODO: find bacteria specie name before insert new bacteria specie !!!

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

          if (bacteriaSpecies[index].bacteriaId) {
            swabTestBacteria[bacteriaSpecies[index].bacteriaId] = true;
          }

          if (bacteriaSpecies[index].bacteriaSpecieId) {
            swabTestBacteriaSpecie[bacteriaSpecies[index].bacteriaSpecieId] = true;
          }
        }

        // Update swab test relation
        const swabTest = await this.repository.findOneBy({ id });

        swabTest.bacteria = Object.keys(swabTestBacteria).map(id => this.bacteriaService.init({ id }));
        swabTest.bacteriaSpecies = Object.keys(swabTestBacteriaSpecie).map(id => this.bacteriaSpecieService.init({ id }));

        await queryRunnerManger.save(swabTest);
      }
    )
  }
}
