import { Entity, Column, OneToMany } from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { SwabProductHistory } from './swab-product-history.entity';

@Entity()
export class SwabSampleType extends BaseSoftDeletableEntity {
  @Column({ unique: true })
  swabSampleTypeName!: string;

  //   @OneToMany(() => SwabAreaHistory, (entity) => entity.swabSampleType)
  //   swabAreaHistories: SwabAreaHistory[];

  @OneToMany(() => SwabProductHistory, (entity) => entity.swabSampleType)
  swabProductHistories: SwabProductHistory[];
}
