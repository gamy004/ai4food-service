// Adapter Layer!!
export interface CrudServiceInterface<T> {
    make(t: T | any): T | any;

    create(t: T | any): Promise<T | any>;

    update(t: T | any, data: object): Promise<T | any>;

    find(options?: any): Promise<T[] | any[]>;

    findBy(options?: T | T[] | any | any[]): Promise<T[] | any[]>;

    findOne(options?: T | any): Promise<T | any>;

    findOneBy(options?: T | T[] | any | any[]): Promise<T | any>;

    findOneOrFail(options?: T | any): Promise<T | any>;

    findOneByOrFail(options?: T | T[] | any | any[]): Promise<T | any>;

    remove(options?: T | any): Promise<T | any>;
}