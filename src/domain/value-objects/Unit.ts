import { MetricType } from "@/domain/value-objects/MetricType";
import { UnitCode } from "@/domain/enums/UnitCode";

export class Unit {
  private static readonly pool = new Map<UnitCode, Unit>();

  private static readonly definitions: Record<UnitCode, { type: MetricType; factor: number }> = {
    [UnitCode.METER]:      { type: 'distance', factor: 1 },
    [UnitCode.CENTIMETER]: { type: 'distance', factor: 0.01 },
    [UnitCode.INCH]:       { type: 'distance', factor: 0.0254 },
    [UnitCode.FEET]:       { type: 'distance', factor: 0.3048 },
    [UnitCode.YARD]:       { type: 'distance', factor: 0.9144 },
    [UnitCode.C]:          { type: 'temperature', factor: 1 },
    [UnitCode.F]:          { type: 'temperature', factor: 1.}, //test
    [UnitCode.K]:          { type: 'temperature', factor: 1 }, //Test
  };

  public readonly code: UnitCode;

  private constructor(code: UnitCode) {
    this.code = code;
  }

  static from(codeStr: string): Unit {
    const normalized = codeStr.toLowerCase();

    if (!Object.values(UnitCode).includes(normalized as UnitCode)) {
      throw new Error(`Invalid unit: ${codeStr}`);
    }
    const validCode = normalized as UnitCode;

    if (Unit.pool.has(validCode)) {
      return Unit.pool.get(validCode)!;
    }

    const newInstance = new Unit(validCode);
    Unit.pool.set(validCode, newInstance);
    return newInstance;
  }

  getType(): MetricType {
    return Unit.definitions[this.code].type;
  }

  getFactor(): number {
    return Unit.definitions[this.code].factor;
  }
}