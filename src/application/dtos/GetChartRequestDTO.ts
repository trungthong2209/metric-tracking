import { IsNumber, IsEnum, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { MetricTypeEnum } from '@/domain/enums/MetricType';
import { UnitCode } from '@/domain/enums/UnitCode';

export class GetChartRequestDTO {
  @IsEnum(MetricTypeEnum)
  type!: string;

  @Type(() => Number) 
  @IsNumber()
  @Min(1)
  @IsOptional()
  period: number = 30; //Days

  @IsOptional()
  @IsEnum(UnitCode)
  unit!: string;
}
