import {
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidatorConstraint,
} from 'class-validator';

@ValidatorConstraint({ name: 'DayOnly', async: false })
export class DayOnlyRule implements ValidatorConstraintInterface {
  validate(value: string) {
    const regex = /[12]\d{3}/;

    return typeof value === 'string' && regex.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must between 1 - 31`;
  }
}
