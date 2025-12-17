import { Unit } from "@/domain/value-objects/Unit";
import { UnitCode } from "@/domain/enums/UnitCode";

export class UnitConversionService {
  static toBase(value: number, unit: Unit): number {
    if (unit.code === UnitCode.F) return (value - 32) * 5/9;
    if (unit.code === UnitCode.K) return value - 273.15;
    return value * unit.getFactor();
  }

  static fromBase(baseValue: number, targetUnit: Unit): number {
    if (targetUnit.code === UnitCode.F) return (baseValue * 9/5) + 32;
    if (targetUnit.code === UnitCode.K) return baseValue + 273.15;

    return baseValue / targetUnit.getFactor();
  }
}