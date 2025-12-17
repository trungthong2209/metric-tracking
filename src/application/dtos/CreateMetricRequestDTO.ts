import { UnitCode } from '@/domain/enums/UnitCode';
import { IsNumber, IsDateString, IsEnum, Min } from 'class-validator';
 
export class CreateMetricRequestDTO {
  @IsNumber()
  @Min(0)
  value!: number;

  @IsEnum(UnitCode)
  unit!: string;

  @IsDateString() 
  date!: string;
}