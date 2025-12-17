import { Repository, DataSource, LessThan, FindOptionsWhere } from 'typeorm';
import { IMetricRepository } from "@/domain/repositories/IMetricRepository";
import { Metric } from "@/domain/entities/Metric";
import { MetricSqlEntity } from "../entities/MetricSqlEntity";
import { DailyMetricSqlEntity } from "../entities/DailyMetricSqlEntity";
import { Unit } from "@/domain/value-objects/Unit";
import { MetricType } from '@/domain/value-objects/MetricType';

export class TypeOrmMetricRepository implements IMetricRepository {
  private metricrepo: Repository<MetricSqlEntity>;
  private dailyRepo: Repository<DailyMetricSqlEntity>;

  constructor(dataSource: DataSource) {
    this.metricrepo = dataSource.getRepository(MetricSqlEntity);
    this.dailyRepo = dataSource.getRepository(DailyMetricSqlEntity);
  }

  private toDomain(sqlEntity: MetricSqlEntity): Metric {
    return Metric.restore({
      id: sqlEntity.id,
      userId: sqlEntity.userId,
      type: sqlEntity.type,
      baseValue: sqlEntity.baseValue,
      originalValue: sqlEntity.originalValue,
      originalUnit: Unit.from(sqlEntity.originalUnit),
      timestamp: sqlEntity.timestamp
    });
  }

  async save(domainMetric: Metric): Promise<Metric> {
    const rawData = {
      userId: domainMetric.userId,
      type: domainMetric.type,
      baseValue: domainMetric.baseValue,
      originalValue: domainMetric.originalValue,
      originalUnit: domainMetric.originalUnit.code,
      timestamp: domainMetric.timestamp
    };
    return this.metricrepo.manager.transaction(async (manager) => {
    const insertResult = await manager
        .createQueryBuilder()
        .insert()
        .into(MetricSqlEntity)
        .values(rawData)
        .returning('*')
        .execute();

      const row = insertResult.raw[0];
      const dateString = domainMetric.timestamp.toISOString().split('T')[0];
    
      await manager.query(`
        INSERT INTO daily_metrics ("userId", "type", "date", "lastBaseValue", "lastUnit", "lastTimestamp")
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT ("userId", "type", "date")
        DO UPDATE SET
          "lastBaseValue" = EXCLUDED."lastBaseValue",
          "lastUnit"      = EXCLUDED."lastUnit",
          "lastTimestamp" = EXCLUDED."lastTimestamp"
          WHERE daily_metrics."lastTimestamp" < EXCLUDED."lastTimestamp"
      `, [
        domainMetric.userId,               
        domainMetric.type,                 
        dateString,                        
        domainMetric.baseValue,            
        domainMetric.originalUnit.code,    
        domainMetric.timestamp
      ]);

      return new Metric({
        id: row.id,
        userId: row.userId,
        type: row.type,
        baseValue: row.baseValue,
        originalValue: row.originalValue,
        originalUnit: Unit.from(row.originalUnit),
        timestamp: new Date(row.timestamp)
      });
    });
  }

  async findLatestPerDay(userId: string, type: string, since: Date): Promise<Metric[]> {
    const rows = await this.dailyRepo
      .createQueryBuilder('d')
      .select(['d.lastBaseValue', 'd.lastUnit', 'd.lastTimestamp', 'd.id', 'd.userId', 'd.type'])
      .where('d.userId = :userId', { userId })
      .andWhere('d.type = :type', { type })
      .andWhere('d.date >= :since', { since: since.toISOString().split('T')[0] })
      .orderBy('d.date', 'ASC')
      .getMany();

    return rows.map(r => new Metric({ 
      id: r.id,
      userId: r.userId,
      type: r.type as MetricType,
      baseValue: r.lastBaseValue,
      originalValue: 0,
      originalUnit: Unit.from(r.lastUnit),
      timestamp: r.lastTimestamp
    }));
  }

  async findAllByType(userId: string, type: string, limit: number, page: number): Promise<[Metric[], number]> {
    const whereCondition: FindOptionsWhere<MetricSqlEntity> = {
      userId,
      type
    };
    const offset = (page - 1) * limit;
    const [data, count] =  await this.metricrepo.findAndCount({
      where: whereCondition,
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
    const domainEntities = data.map(e => this.toDomain(e));
    return [domainEntities, count]
  }
}