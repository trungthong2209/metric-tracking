import { IMetricRepository } from "@/domain/repositories/IMetricRepository";
import { UnitConversionService } from "@/domain/services/UnitConversionService";
import { Metric } from "@/domain/entities/Metric";
import { Unit } from "@/domain/value-objects/Unit";
import { ICacheService } from "../interfaces/ICacheService";
import { CreateMetricRequestDTO } from "@/application/dtos/CreateMetricRequestDTO";

export class CreateMetricUseCase {
  constructor(
    private readonly metricRepo: IMetricRepository,
    private cache: ICacheService
  ) {}

  async execute(userId: string, body: CreateMetricRequestDTO) {
    try {
      const { unit, value, date } = body;
      const metric = Metric.create({
        userId,
        value,
        unit,
        date: new Date(date),
      });
      await Promise.all([
         this.metricRepo.save(metric),
         this.cache.invalidateUser(userId),
      ])
      return true;
    } catch (error) {
      throw new Error(`Failed to create metric: ${error}`);
    }
  }
}
