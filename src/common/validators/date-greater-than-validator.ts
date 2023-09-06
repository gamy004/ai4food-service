import {
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidatorConstraint,
} from 'class-validator';

@ValidatorConstraint({ name: 'DateGreaterThan', async: false })
export class DateGreaterThanRule implements ValidatorConstraintInterface {
  validate(propValue: Date, args: ValidationArguments) {
    return propValue > args.object[args.constraints[0]];
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be greater than ${args.constraints[0]}`;
  }
}
