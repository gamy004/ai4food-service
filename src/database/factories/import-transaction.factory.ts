import { v4 } from "uuid";
import { setSeederFactory } from 'typeorm-extension';
import { ImportTransaction } from '~/import-transaction/entities/import-transaction.entity';

export default setSeederFactory(ImportTransaction, (faker) => {
    const importTransaction = new ImportTransaction();

    importTransaction.id = v4();
    // importTransaction.transactionNumber = faker.unique(faker.finance.routingNumber);

    return importTransaction;
})