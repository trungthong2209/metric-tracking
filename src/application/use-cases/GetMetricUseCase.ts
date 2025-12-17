import { IMetricRepository } from "@/domain/repositories/IMetricRepository";
import { ICacheService } from "@/application/interfaces/ICacheService";
import { GetMetricsInput } from "@/application/dtos/GetMetricsInputDTO";
import { UnitCodeDefault } from "@/domain/enums/UnitCode";

interface MetricListResponse {
  id: string | null;
  type: string;
  value: number;
  unit: string;
  date: Date;
}

export class GetMetricListUseCase {
  constructor(
    private metricRepo: IMetricRepository,
    private cache: ICacheService
  ) {}

  async execute(userId: string, query: GetMetricsInput): Promise<[MetricListResponse[], number]> {
    const {type, page, limit, unit} = query;
    const cacheField = `GET_METRIC:${type}_${page}_${limit}_${unit}`;
    return this.cache.wrap<[MetricListResponse[], number]>(
      userId, 
      cacheField, 
      async () => {
        const [metrics, total] = await this.metricRepo.findAllByType(userId, type, limit, page);
        const data = metrics.map(m => ({
          id: m.id, 
          type: m.type,
          value: m.getValueIn(unit),
          unit: unit,
          date: m.timestamp
        }));
        return [data, total]
      },
      1 //60 //1 Minute
    );
  }
}