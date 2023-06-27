import { Entity, Column, OneToMany } from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { SwabTest } from './swab-test.entity';

@Entity()
export class SwabSampleType extends BaseSoftDeletableEntity {
  @Column({ unique: true })
  swabSampleTypeName!: string;

  //   @OneToMany(() => SwabAreaHistory, (entity) => entity.swabSampleType)
  //   swabAreaHistories: SwabAreaHistory[];

  @OneToMany(() => SwabTest, (entity) => entity.swabSampleType)
  swabTests: SwabTest[];
}
