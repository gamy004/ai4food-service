import { isValid } from "date-fns";
import { ValidatorConstraintInterface, ValidationArguments, ValidatorConstraint } from "class-validator";

@ValidatorConstraint({ name: "DateOnly", async: false })
export class DateOnlyRule implements ValidatorConstraintInterface {
    validate(value: string) {
        const regex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;

        return typeof value === 'string' && regex.test(value) && isValid(new Date(value));
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} must be a date in format 'yyyy-MM-dd'`;
    }
}