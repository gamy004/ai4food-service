import { v4 } from "uuid";
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, InjectRepository } from '@nestjs/typeorm';
import { ImportTransaction, ImportType } from '~/import-transaction/entities/import-transaction.entity';
import { DataCollectorImporter } from './data-collector.importer';
import { CommonRepositoryInterface } from "~/common/interface/common.repository.interface";

export class MockEntity {
  mockProperty!: string;
}

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<{}>;
};

class MockEntityImporter extends DataCollectorImporter<MockEntity> {
  importType: ImportType = ImportType.CLEANING_PLAN;

  constructor(
    @InjectRepository(MockEntity)
    mockRepository: CommonRepositoryInterface<MockEntity>
  ) {
    super(mockRepository);
  }
}

const repositoryMockFactory: () => MockType<CommonRepositoryInterface<any>> = jest.fn(() => ({
  create: jest.fn(entity => entity),
  save: jest.fn(entity => Promise.resolve(entity)),
}));

describe('DataCollectorImporter', () => {
  let importer: MockEntityImporter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockEntityImporter,

        { provide: getRepositoryToken(MockEntity), useFactory: repositoryMockFactory },
      ],
    }).compile();

    importer = module.get<MockEntityImporter>(MockEntityImporter);
  });

  it('should be defined', () => {
    expect(importer).toBeDefined();
  });

  it('should not import data when the given import type is not match with the `importType` property', async () => {
    const incorectImportTransaction = new ImportTransaction();

    incorectImportTransaction.id = v4();

    incorectImportTransaction.importType = ImportType.PRODUCT_SCHEDULE;

    const mockEntity = new MockEntity();

    mockEntity.mockProperty = "This is mock property";

    await expect(
      async () => {
        await importer.import(incorectImportTransaction, [mockEntity]);
      }
    ).rejects.toThrowError(new Error(`Importer accept only import transaction type ${ImportType.CLEANING_PLAN}`));
  })
});
