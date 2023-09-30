import {
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidatorConstraint,
} from 'class-validator';

@ValidatorConstraint({ name: 'MonthOnly', async: false })
export class MonthOnlyRule implements ValidatorConstraintInterface {
  validate(value: string) {
    const regex = /([1-9]|1[0-2])/;

    return typeof value === 'string' && regex.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must between 01 - 12`;
  }
}
