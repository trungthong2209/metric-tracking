import { Unit } from '../Unit';
import { UnitCode } from '../../enums/UnitCode';

describe('Unit Value Object', () => {

  describe('from()', () => {
    
    it('should create a valid Unit instance from a string', () => {
      const unit = Unit.from('meter');
      expect(unit).toBeInstanceOf(Unit);
      expect(unit.code).toBe(UnitCode.METER);
    });

    it('should handle case-insensitivity', () => {
      const unit = Unit.from('METER');
      expect(unit.code).toBe(UnitCode.METER);
    });

    it('should return the exact same instance for the same code', () => {
      const unit1 = Unit.from('meter');
      const unit2 = Unit.from('meter');
      expect(unit1).toBe(unit2);
    });

    it('should throw an error for invalid unit strings', () => {
      expect(() => {
        Unit.from('invalid_unit_code');
      }).toThrow('Invalid unit: invalid_unit_code');
    });
  });

  describe('Getters', () => {
    
    it('should return the correct Metric Type', () => {
      const meter = Unit.from('meter');
      const celsius = Unit.from('c');

      expect(meter.getType()).toBe('distance');
      expect(celsius.getType()).toBe('temperature');
    });

    it('should return the correct Conversion Factor', () => {
      const meter = Unit.from('meter');
      const feet = Unit.from('feet');
      const fahrenheit = Unit.from('f');

      expect(meter.getFactor()).toBe(1);
      expect(feet.getFactor()).toBe(0.3048);
      expect(fahrenheit.getFactor()).toBe(1);
    });
  });
});