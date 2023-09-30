import {
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidatorConstraint,
} from 'class-validator';

@ValidatorConstraint({ name: 'YearOnly', async: false })
export class YearOnlyRule implements ValidatorConstraintInterface {
  validate(value: string) {
    const regex = /([12]\d|3[01])/;

    return typeof value === 'string' && regex.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be between 0001 to 2999`;
  }
}
