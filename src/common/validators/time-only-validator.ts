import { isValid } from "date-fns";
import { ValidatorConstraintInterface, ValidationArguments, ValidatorConstraint } from "class-validator";

@ValidatorConstraint({ name: "TimeOnly", async: false })
export class TimeOnlyRule implements ValidatorConstraintInterface {
    validate(value: string) {
        const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

        return typeof value === 'string' && regex.test(value);
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} must be a time in format 'HH:mm'`;
    }
}