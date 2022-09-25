import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { User } from '~/auth/entities/user.entity';
import { BaseSoftDeletableIncrementEntity } from '~/common/entities/base-softdeletable-increment.entity';
import { BacteriaSpecie } from '~/lab/entities/bacteria-specie.entity';
import { Bacteria } from '~/lab/entities/bacteria.entity';

export const SWAB_TEST_CODE_PREFIX = 'AI';
@Entity()
export class SwabTest extends BaseSoftDeletableIncrementEntity {
  @Column({ unique: true })
  swabTestCode: string;

  @Column({ type: 'timestamp', nullable: true })
  swabTestRecordedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  bacteriaRecordedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  bacteriaSpecieRecordedAt: Date;

  @Column({ type: 'text', nullable: true })
  swabTestNote?: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  recordedUserId?: string;

  @ManyToOne(() => User, (entity) => entity.recordedSwabTests, {
    onDelete: 'SET NULL',
  })
  recordedUser: User;

  @Column({ type: 'varchar', length: 36, nullable: true })
  bacteriaRecordedUserId?: string;

  @ManyToOne(() => User, (entity) => entity.recordedSwabTests, {
    onDelete: 'SET NULL',
  })
  bacteriaRecordedUser: User;

  @Column({ type: 'varchar', length: 36, nullable: true })
  bacteriaSpecieRecordedUserId?: string;

  @ManyToOne(() => User, (entity) => entity.recordedSwabTests, {
    onDelete: 'SET NULL',
  })
  bacteriaSpecieRecordedUser: User;

  @ManyToMany(() => Bacteria, { cascade: ['insert', 'update'] })
  @JoinTable()
  bacteria!: Bacteria[];

  @ManyToMany(() => BacteriaSpecie, { cascade: ['insert', 'update'] })
  @JoinTable()
  bacteriaSpecies!: BacteriaSpecie[];
  // @AfterInsert()
  // generateSwabTestNo() {
  //     SwabTest.update(this.id, {
  //         swabTestCode: `${SWAB_TEST_CODE_PREFIX} ${this.id}`
  //     });
  // }
}
