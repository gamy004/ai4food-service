import { ValidationArguments, ValidatorConstraintInterface } from 'class-validator';
import { Connection, EntitySchema, FindOptionsWhere, ObjectType } from 'typeorm';
import { CommonRepositoryInterface } from '../interface/common.repository.interface';

interface UniqueValidationArguments<E> extends ValidationArguments {
    constraints: [
        ObjectType<E> | EntitySchema<E> | string,
        ((validationArguments: ValidationArguments) => FindOptionsWhere<any>) | keyof E,
    ];
}

export abstract class UniqueValidator<E> implements ValidatorConstraintInterface {
    protected constructor(
        protected readonly repository: CommonRepositoryInterface<E>
    ) { }

    public async validate<E>(value: string, args: UniqueValidationArguments<E>) {
        const [_, findCondition = args.property] = args.constraints;
        return (
            (await this.repository.count({
                where:
                    typeof findCondition === 'function'
                        ? findCondition(args)
                        : {
                            [findCondition || args.property]: value,
                        },
            })) <= 0
        );
    }

    public defaultMessage(args: ValidationArguments) {
        const [EntityClass] = args.constraints;
        const entity = EntityClass.name || 'Entity';
        return `${entity} with the same '${args.property}' already exist`;
    }
}