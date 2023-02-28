import { Injectable } from '@nestjs/common';

@Injectable()
export class CollectionTransformer {
  public toMap<T>(collection: T[], mapKey: string): Map<string, T> {
    const map = new Map();

    collection.forEach((item) => map.set(item[mapKey], item));

    return map;
  }
}
