import { format, parse } from "date-fns";
import { ValidatorConstraintInterface, ValidationArguments, ValidatorConstraint } from "class-validator";
import { TimeOnlyRule } from "./time-only-validator";

@ValidatorConstraint({ name: "TimeGreaterThan", async: false })
export class TimeGreaterThanRule implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const timeOnlyValidator = new TimeOnlyRule();

    const comparedValue = args.object[args.constraints[0]];

    if (
      timeOnlyValidator.validate(value) &&
      timeOnlyValidator.validate(comparedValue)
    ) {
      const mockDateString = format(new Date(), "yyyy-MM-dd");

      const testedValue = parse(
        `${mockDateString} ${value}`,
        "yyyy-MM-dd HH:mm:ss",
        new Date()
      );

      const testedCompareValue = parse(
        `${mockDateString} ${comparedValue}`,
        "yyyy-MM-dd HH:mm:ss",
        new Date()
      );

      return testedValue > testedCompareValue;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be greater than ${args.constraints[0]}`;
  }
}