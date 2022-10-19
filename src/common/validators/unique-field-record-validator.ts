import { get, groupBy } from "lodash";
import { ValidatorConstraintInterface, ValidationArguments, ValidatorConstraint } from "class-validator";

@ValidatorConstraint({ name: "UniqueFieldRecord", async: false })
export class UniqueFieldRecordRule implements ValidatorConstraintInterface {
    validate(records: any[], args: ValidationArguments) {
        let result = true;

        if (records.length) {
            const fields = args.constraints;

            const groupedRecords = groupBy(records, (record) => {
                return fields.reduce(
                    (acc, field) => {
                        return `${acc}_${get(record, field)}`;
                    }, ""
                );
            });

            for (const key in groupedRecords) {
                if (Object.prototype.hasOwnProperty.call(groupedRecords, key)) {
                    const groupedRecord = groupedRecords[key];

                    if (groupedRecord.length > 1) {
                        result = false;

                        break;
                    }
                }
            }
        }

        return result;
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} has duplicated value by fields '${args.constraints.join(",")}'`;
    }
}