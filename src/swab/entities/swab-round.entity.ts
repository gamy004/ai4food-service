import { Column, Entity, OneToMany } from 'typeorm';
import { CleaningHistory } from '~/cleaning/entities/cleaning-history.entity';
import { BaseSoftDeletableIncrementEntity } from '~/common/entities/base-softdeletable-increment.entity';
import { SwabAreaHistory } from './swab-area-history.entity';
import { SwabProductHistory } from './swab-product-history.entity';
import { SwabTest } from './swab-test.entity';

@Entity()
export class SwabRound extends BaseSoftDeletableIncrementEntity {
  @Column({ type: 'varchar', length: 255 })
  swabRoundNumber: string;

  @OneToMany(() => SwabAreaHistory, (entity) => entity.swabRound)
  swabAreaHistories: SwabAreaHistory[];

  @OneToMany(() => SwabProductHistory, (entity) => entity.swabRound)
  swabProductHistories: SwabProductHistory[];

  @OneToMany(() => SwabTest, (entity) => entity.swabRound)
  swabTests: SwabTest[];

  @OneToMany(() => CleaningHistory, (entity) => entity.swabRound)
  cleaningHistories: CleaningHistory[];
}
