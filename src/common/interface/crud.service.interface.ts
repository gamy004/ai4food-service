// Adapter Layer!!
export interface CrudServiceInterface<T> {
    init(t: T | any): T | any;

    create(t: T | any): Promise<T | any>;

    update(t: T | any, data: object): Promise<T | any>;

    findAll(options?: any): Promise<T[] | any[]>;

    find(options?: T | T[] | any | any[]): Promise<T[] | any[]>;

    findOne(options?: T | any): Promise<T | any>;

    findOneOrFail(options?: T | any): Promise<T | any>;

    remove(options?: T | any): Promise<T | any>;
}