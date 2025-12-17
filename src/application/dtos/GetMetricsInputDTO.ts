import { IsEnum, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { MetricTypeEnum } from '@/domain/enums/MetricType';
import { UnitCode } from '@/domain/enums/UnitCode';

export class GetMetricsInput {
  @IsEnum(MetricTypeEnum)
  type!: string;

  @IsOptional()
  @IsEnum(UnitCode)
  unit!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit!: number;
}
