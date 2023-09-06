import { Column, Entity, OneToMany } from 'typeorm';
import { BaseSoftDeletableEntity } from '~/common/entities/base-softdeletable.entity';

@Entity()
export class SwabEnvironment extends BaseSoftDeletableEntity {
  @Column({ unique: true })
  swabEnvironmentName!: string;
}
