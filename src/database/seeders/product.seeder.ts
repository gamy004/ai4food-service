import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Product } from '~/product/entities/product.entity';

export default class ProductSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    const productRepository = dataSource.getRepository(Product);

    let products = [
        {
            productCode: "CP.39426",
            productName: "ข้าวหอมมะลิ"
        },
        {
            productCode: "CP.39463",
            productName: "ข้าวไรส์"
        },
        {
            productCode: "CP.39464",
            productName: "ข้าวกล้อง"
        },
        {
            productCode: "CP.39470",
            productName: "กะเพราไก่"
        },
        {
            productCode: "CP.39475",
            productName: "ข้าวผัดปู"
        },
        {
            productCode: "CP.39476",
            productName: "ข้าวไข่เจียวกุ้ง"
        },
        {
            productCode: "CP.39623",
            productName: "กะเพราหมู"
        },
        {
            productCode: "CP.39799",
            productName: "ข้าวไก่คั่ว"
        },
        {
            productCode: "CP.39819",
            productName: "ไก่กระเทียม"
        },
        {
            productCode: "CP.39843",
            productName: "ข้าวไก่ทอด"
        },
        {
            productCode: "CP.39890",
            productName: "ข้าวพะแนง"
        },
        {
            productCode: "CP.39892",
            productName: "ปลาผัดพริก"
        },
        {
            productCode: "CP.39919",
            productName: "ข้าวผัดหมู"
        },
        {
            productCode: "CP.40025",
            productName: "กะเพราPB"
        },
        {
            productCode: "CP.40044",
            productName: "กะเพราเนื้อ"
        },
        {
            productCode: "CP.40046",
            productName: "พะแนงเนื้อ"
        },
        {
            productCode: "CP.40084",
            productName: "หมูสับเทียม"
        },
        {
            productCode: "CP.40111",
            productName: "ต้มยำไก่"
        },
        {
            productCode: "CP.40116",
            productName: "ไข่คั่ว"
        },
        {
            productCode: "CP.40141",
            productName: "ข้าวสวยปทุม"
        },
    ];

    await productRepository.save(products);
  }
}