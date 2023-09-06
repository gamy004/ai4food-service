import {
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { CommonRepositoryInterface } from '../interface/common.repository.interface';

export abstract class EntityExistsRule<E>
  implements ValidatorConstraintInterface
{
  constructor(protected readonly repository: CommonRepositoryInterface<E>) {}

  async validate(value: string) {
    let countEntity = 0;

    try {
      countEntity = await this.repository.countBy({ id: value } as any);
    } catch (e) {
      console.log(e);

      return false;
    }

    return countEntity === 1;
  }

  public defaultMessage() {
    return `id doesn't exists`;
  }
}
