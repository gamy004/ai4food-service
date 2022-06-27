import { setSeederFactory } from 'typeorm-extension';
import { Product } from '~/product/entities/product.entity';

export default setSeederFactory(Product, (faker) => {
    const product = new Product();

    product.productCode = faker.unique(faker.commerce.product);
    product.productName = faker.commerce.productName();

    return product;
})