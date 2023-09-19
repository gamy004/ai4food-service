import {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  DataSource,
  EntitySchema,
  FindOptionsWhere,
  ObjectType,
} from 'typeorm';
import { InvalidRelationFieldException } from '../exceptions/invalid-relation-field.exception';

interface RelationFieldValidationArgumentConstrant<E> {
  entity: ObjectType<E> | EntitySchema<E> | string;
  condition:
    | ((validationArguments: ValidationArguments) => FindOptionsWhere<any>)
    | keyof E;
}

interface RelationFieldValidationArguments<E, T> extends ValidationArguments {
  constraints: [
    RelationFieldValidationArgumentConstrant<E>,
    RelationFieldValidationArgumentConstrant<T>,
    string[],
  ];
}

export abstract class RelationFieldValidator
  implements ValidatorConstraintInterface
{
  protected constructor(protected readonly dataSource: DataSource) {}

  public async validate<E, T>(
    value: string,
    args: RelationFieldValidationArguments<E, T>,
  ) {
    const [firstEntityArgument, secondEntityArgument, checkFields] =
      args.constraints;

    const { entity: FirstEntityClass, condition: firstEntityCondition } =
      firstEntityArgument;
    const { entity: SecondEntityClass, condition: secondEntityCondition } =
      secondEntityArgument;

    const firstRepository = this.dataSource.getRepository(FirstEntityClass);

    const secondRepository = this.dataSource.getRepository(SecondEntityClass);

    const firstEntity = await firstRepository.findOneByOrFail(
      typeof firstEntityCondition === 'function'
        ? firstEntityCondition(args)
        : {
            [firstEntityCondition || args.property]: value,
          },
    );

    const secondEntity = await secondRepository.findOneByOrFail(
      typeof secondEntityCondition === 'function'
        ? secondEntityCondition(args)
        : {
            [secondEntityCondition || args.property]: value,
          },
    );

    const isSomeFieldNotEquals = checkFields.some(
      (checkField) => firstEntity[checkField] !== secondEntity[checkField],
    );

    console.log(firstEntity, secondEntity, checkFields, isSomeFieldNotEquals);

    if (isSomeFieldNotEquals) {
      throw new InvalidRelationFieldException(this.defaultMessage(args));
    }

    return !isSomeFieldNotEquals;
  }

  public defaultMessage(args: ValidationArguments) {
    const [firstEntityArgument, secondEntityArgument, checkFields] =
      args.constraints;

    const { entity: FirstEntityClass } = firstEntityArgument;
    const { entity: SecondEntityClass } = secondEntityArgument;

    return `${
      FirstEntityClass.name
    } does not have matched fields ${checkFields.join(',')} with ${
      SecondEntityClass.name
    }`;
  }
}
