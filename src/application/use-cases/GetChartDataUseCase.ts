import { IMetricRepository } from "@/domain/repositories/IMetricRepository";
import { ICacheService } from "@/application/interfaces/ICacheService";
import { GetChartRequestDTO } from "@/application/dtos/GetChartRequestDTO";

interface ChartResponse {
  date: string;
  value: number;
  unit: string;
}

export class GetChartDataUseCase {
  constructor(
    private metricRepo: IMetricRepository,
    private cache: ICacheService
  ) {}

  async execute(userId: string, query: GetChartRequestDTO): Promise<ChartResponse[]> {
    const {type, period, unit} = query;
    const cacheField = `GET_CHART:${type}_${period}_${unit}`;
    return this.cache.wrap<ChartResponse[]>(
      userId, 
      cacheField, 
      async () => {
        const since = new Date();
        since.setDate(since.getDate() - period);
        const rawMetrics = await this.metricRepo.findLatestPerDay(userId, type, since);
        const formattedData: ChartResponse[]  = rawMetrics.map(m => ({
          date: m.timestamp.toISOString(),
          value: m.getValueIn(unit ?? m.originalUnit.code),
          unit: unit ?? m.originalUnit.code
        }));
        return formattedData;
      },
      1
    );
  }
}