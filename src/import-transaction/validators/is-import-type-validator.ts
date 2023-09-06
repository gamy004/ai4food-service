import { InjectRepository } from '@nestjs/typeorm';
import {
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidatorConstraint,
} from 'class-validator';
import { CommonRepositoryInterface } from '~/common/interface/common.repository.interface';
import { ConnectImportTransactionDto } from '../dto/connect-import-transaction.dto';
import { ImportTransaction } from '../entities/import-transaction.entity';

@ValidatorConstraint({ name: 'IsImportType', async: true })
export class IsImportTypeRule implements ValidatorConstraintInterface {
  protected message: string = '';

  constructor(
    @InjectRepository(ImportTransaction)
    protected readonly repository: CommonRepositoryInterface<ImportTransaction>,
  ) {}

  async validate(
    connectImportTransactionDto: ConnectImportTransactionDto,
    args: ValidationArguments,
  ) {
    const importType = args.constraints[0];
    const { id } = connectImportTransactionDto;

    let result = true;

    try {
      const entity = await this.repository.findOneBy({ id });

      if (!entity) {
        this.message = `${args.property} doesn't exists`;

        result = false;
      }

      if (entity && entity.importType !== importType) {
        this.message = `${args.property} doesn't match with '${importType}'`;

        result = false;
      }
    } catch (e) {
      console.log(e);

      return false;
    }

    return result;
  }

  defaultMessage() {
    return this.message;
  }
}
