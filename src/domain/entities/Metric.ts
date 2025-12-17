import { Unit } from "@/domain/value-objects/Unit";
import { UnitCodeDefault } from "../enums/UnitCode";
import { UnitConversionService } from "@/domain/services/UnitConversionService";
 
export interface MetricProps {
  id?: string | null;
  userId: string;
  type: string;
  baseValue: number;
  originalValue: number;
  originalUnit: Unit;
  timestamp: Date;
}

export class Metric {
  public readonly id: string | null;
  public readonly userId: string;
  public readonly type: string;
  public readonly baseValue: number;
  public readonly originalValue: number;
  public readonly originalUnit: Unit;
  public readonly timestamp: Date;

  constructor(props: MetricProps) {
    this.id = props.id || null;
    this.userId = props.userId;
    this.type = props.type;
    this.baseValue = props.baseValue;
    this.originalValue = props.originalValue;
    this.originalUnit = props.originalUnit;
    this.timestamp = props.timestamp;
  }

  static create(props: { 
    userId: string; 
    value: number; 
    unit: string; 
    date: Date;
  }): Metric {
    const unitConverted = Unit.from(props.unit);
    const baseValue = UnitConversionService.toBase(props.value, unitConverted);
    return new Metric({
      userId: props.userId,
      type: unitConverted.getType(),
      baseValue: baseValue,
      originalValue: props.value,
      originalUnit: unitConverted,
      timestamp: props.date
    });
  }

  static restore(props: {
    id: string;
    userId: string;
    type: string;
    baseValue: number;
    originalValue: number;
    originalUnit: Unit;
    timestamp: Date;
  }): Metric {
    return new Metric({
      id: props.id,
      userId: props.userId,
      type: props.type,
      baseValue: props.baseValue,
      originalValue: props.originalValue,
      originalUnit: props.originalUnit,
      timestamp: props.timestamp
    });
  }

  public getValueIn(targetUnitStr: string): number {
    if (!targetUnitStr) {
      return this.baseValue;
    }
    const targetUnit = Unit.from(targetUnitStr);
    if (targetUnit.getType() !== this.type) {
      throw new Error(`Cannot convert ${this.type} to ${targetUnitStr}`);
    }
    const defaultValues: string[] = Object.values(UnitCodeDefault);
    if (defaultValues.includes(targetUnitStr.toLowerCase())) {
      return this.baseValue;
    }
    return UnitConversionService.fromBase(this.baseValue, targetUnit);  
  }
}
