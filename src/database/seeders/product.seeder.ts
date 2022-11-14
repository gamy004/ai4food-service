import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Product } from '~/product/entities/product.entity';

export default class ProductSeeder implements Seeder {
    public async run(
        dataSource: DataSource
    ): Promise<any> {
        const productRepository = dataSource.getRepository(Product);

        let products = [
            // {
            //     productCode: "90138376",
            //     alternateProductCode: "CP.39426",
            //     productName: "ข้าวหอมมะลิ"
            // },
            // {
            //     productCode: "90138378",
            //     alternateProductCode: "CP.39463",
            //     productName: "ข้าวไรส์"
            // },
            // {
            //     productCode: "90138377",
            //     alternateProductCode: "CP.39464",
            //     productName: "ข้าวกล้อง"
            // },
            {
                productCode: "90138410",
                alternateProductCode: "CP.39470",
                productName: "กะเพราไก่"
            },
            // {
            //     productCode: "90138326",
            //     alternateProductCode: "CP.39475",
            //     productName: "ข้าวผัดปู"
            // },
            {
                productCode: "90138343",
                alternateProductCode: "CP.39476",
                productName: "ข้าวไข่เจียวกุ้ง"
            },
            {
                productCode: "90138466",
                alternateProductCode: "CP.39623",
                productName: "กะเพราหมู"
            },
            // {
            //     productCode: "90138508",
            //     alternateProductCode: "CP.39799",
            //     productName: "ข้าวไก่คั่ว"
            // },
            // {
            //     productCode: "90138515",
            //     alternateProductCode: "CP.39819",
            //     productName: "ไก่กระเทียม"
            // },
            // {
            //     productCode: "90138529",
            //     alternateProductCode: "CP.39843",
            //     productName: "ข้าวไก่ทอด"
            // },
            {
                productCode: "90138435",
                alternateProductCode: "CP.39890",
                productName: "ข้าวพะแนง"
            },
            {
                productCode: "90138379",
                alternateProductCode: "CP.39892",
                productName: "ปลาผัดพริก"
            },
            // {
            //     productCode: "90138556",
            //     alternateProductCode: "CP.39919",
            //     productName: "ข้าวผัดหมู"
            // },
            // {
            //     productCode: "90138583",
            //     alternateProductCode: "CP.40025",
            //     productName: "กะเพราPB"
            // },
            // {
            //     productCode: "90138588",
            //     alternateProductCode: "CP.40044",
            //     productName: "กะเพราเนื้อ"
            // },
            // {
            //     productCode: "90138590",
            //     alternateProductCode: "CP.40046",
            //     productName: "พะแนงเนื้อ"
            // },
            // {
            //     productCode: "90138603",
            //     alternateProductCode: "CP.40084",
            //     productName: "หมูสับเทียม"
            // },
            // {
            //     productCode: "90138608",
            //     alternateProductCode: "CP.40111",
            //     productName: "ต้มยำไก่"
            // },
            // {
            //     productCode: "90138612",
            //     alternateProductCode: "CP.40116",
            //     productName: "ไข่คั่ว"
            // },
            // {
            //     productCode: "90138623",
            //     alternateProductCode: "CP.40141",
            //     productName: "ข้าวสวยปทุม"
            // },
        ];

        await productRepository.upsert(products, ['productCode', 'alternateProductCode']);
    }
}