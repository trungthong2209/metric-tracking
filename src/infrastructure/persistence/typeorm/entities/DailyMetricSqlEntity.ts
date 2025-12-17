import { Entity, Column, Index, Unique } from 'typeorm';
import { BaseSqlEntity } from './base/BaseSqlEntity';

@Entity('daily_metrics')
@Unique(['userId', 'type', 'date'])
@Index(['userId', 'type', 'date'])
export class DailyMetricSqlEntity extends BaseSqlEntity {
  @Column()
  userId!: string;

  @Column()
  type!: string; 

  @Column({ type: 'date' })
  date!: string;

  @Column('float')
  lastBaseValue!: number;

  @Column()
  lastUnit!: string;

  @Column({ type: 'timestamptz' })
  lastTimestamp!: Date;
}