import { ValidatorConstraintInterface, ValidationArguments, ValidatorConstraint } from "class-validator";

@ValidatorConstraint({ name: "DateLessThan", async: false })
export class DateLessThanRule implements ValidatorConstraintInterface {
  validate(propValue: Date, args: ValidationArguments) {
    return propValue < args.object[args.constraints[0]];
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be less than ${args.constraints[0]}`;
  }
}