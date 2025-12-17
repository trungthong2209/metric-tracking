import { Metric } from "@/domain/entities/Metric";

export interface IMetricRepository {
  save(metric: Metric): Promise<Metric>;
  findAllByType(
    userId: string, 
    type: string, 
    limit: number, 
    page: number,
  ): Promise<[Metric[], number]>;
  findLatestPerDay(userId: string, type: string, since: Date): Promise<Metric[]>;
}
