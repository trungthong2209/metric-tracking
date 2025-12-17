import { UnitConversionService } from '../UnitConversionService';
import { UnitCode } from '@/domain/enums/UnitCode';
import { Unit } from '@/domain/value-objects/Unit';

const createMockUnit = (code: UnitCode, factor: number = 1) => {
  return {
    code: code,
    getFactor: () => factor
  } as unknown as Unit;
};

describe('UnitConversionService', () => {

  describe('toBase()', () => {
    
    it('should convert standard factor units correctly (Centimeter -> Meter)', () => {
      const mockCm = createMockUnit(UnitCode.CENTIMETER, 0.01);
      
      const result = UnitConversionService.toBase(100, mockCm);
      expect(result).toBe(1);
    });

    it('should convert Fahrenheit to Celsius correctly', () => {
      const mockF = createMockUnit(UnitCode.F);
      expect(UnitConversionService.toBase(32, mockF)).toBe(0);
      expect(UnitConversionService.toBase(212, mockF)).toBe(100);
    });

    it('should convert Kelvin to Celsius correctly', () => {
      const mockK = createMockUnit(UnitCode.K);
      expect(UnitConversionService.toBase(273.15, mockK)).toBe(0);
      expect(UnitConversionService.toBase(0, mockK)).toBe(-273.15);
    });
  });

  describe('fromBase()', () => {
    
    it('should convert standard factor units correctly (Meter -> Centimeter)', () => {
      const mockCm = createMockUnit(UnitCode.CENTIMETER, 0.01);
      
      const result = UnitConversionService.fromBase(1, mockCm);
      expect(result).toBe(100);
    });

    it('should convert Celsius to Fahrenheit correctly', () => {
      const mockF = createMockUnit(UnitCode.F);
      expect(UnitConversionService.fromBase(0, mockF)).toBe(32);
      expect(UnitConversionService.fromBase(100, mockF)).toBe(212);
    });

    it('should convert Celsius to Kelvin correctly', () => {
      const mockK = createMockUnit(UnitCode.K);
      expect(UnitConversionService.fromBase(0, mockK)).toBe(273.15);
      expect(UnitConversionService.fromBase(-273.15, mockK)).toBeCloseTo(0);
    });
  });
});