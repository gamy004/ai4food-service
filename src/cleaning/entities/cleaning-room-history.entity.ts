import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';
import { Room } from '~/facility/entities/room.entity';
import { ImportTransaction } from '~/import-transaction/entities/import-transaction.entity';

@Entity()
export class CleaningRoomHistory extends BaseSoftDeletableEntity {
  @Column({ type: 'date' })
  cleaningRoomDate!: Date;

  @Column({ type: 'time' })
  cleaningRoomStartedAt!: string;

  @Column({ type: 'timestamp' })
  cleaningRoomStartedAtTimestamp!: Date;

  @Column({ type: 'time' })
  cleaningRoomEndedAt!: string;

  @Column({ type: 'timestamp' })
  cleaningRoomEndedAtTimestamp!: Date;

  @Column({ type: 'varchar', length: 36 })
  roomId: string;

  @ManyToOne(() => Room, (entity) => entity.cleaningRoomHistories, {
    onDelete: 'SET NULL',
  })
  room: Room;

  @Column({ type: 'varchar', length: 36, nullable: true })
  importTransactionId?: string;

  @ManyToOne(
    () => ImportTransaction,
    (entity) => entity.cleaningRoomHistories,
    {
      onDelete: 'SET NULL',
    },
  )
  importTransaction?: ImportTransaction;
}
