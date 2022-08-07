import { Repository } from "typeorm";

// Adapter Layer!!
export interface CommonRepositoryInterface<T> extends Repository<T> {
    save(t: T): Promise<any>;

    save(t: T[], options?: object): Promise<any[]>;
}