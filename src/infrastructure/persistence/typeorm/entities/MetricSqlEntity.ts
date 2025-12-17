import { Entity, Column, Index } from 'typeorm';
import { BaseSqlEntity } from './base/BaseSqlEntity';

@Entity('metrics')
@Index(['userId', 'type', 'timestamp']) 
export class MetricSqlEntity extends BaseSqlEntity {
  
  @Column()
  userId!: string;

  @Column()
  type!: string;

  @Column('float')
  baseValue!: number;

  @Column('float')
  originalValue!: number;

  @Column()
  originalUnit!: string;

  @Column({ type: 'timestamptz' })
  timestamp!: Date;
}