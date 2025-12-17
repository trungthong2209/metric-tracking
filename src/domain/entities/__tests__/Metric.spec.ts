import { Metric } from '../Metric';
import { Unit } from '../../value-objects/Unit';
import { MetricTypeEnum } from '../../enums/MetricType';

describe('Metric Entity', () => {
  describe('create()', () => {
    it('should create a valid Distance metric and auto-calculate baseValue (Centimeter -> Meter)', () => {
      const metric = Metric.create({
        userId: 'user-1',
        value: 19990,
        unit: 'centimeter',
        date: new Date(),
      });

      expect(metric.type).toBe(MetricTypeEnum.DISTANCE);
      expect(metric.originalValue).toBe(19990);
      expect(metric.originalUnit.code).toBe('centimeter');
      expect(metric.baseValue).toBe(199.9); 
    });

    it('should create a valid Temperature metric (F -> C)', () => {
      const metric = Metric.create({
        userId: 'user-1',
        value: 32,
        unit: 'f',
        date: new Date()
      });

      expect(metric.type).toBe(MetricTypeEnum.TEMPERATURE);
      expect(metric.baseValue).toBe(0);
    });

    it('should throw an error if unit string is invalid', () => {
      expect(() => {
        Metric.create({
          userId: 'user-1',
          value: 100,
          unit: 'invalid_unit_code',
          date: new Date()
        });
      }).toThrow('Invalid unit: invalid_unit_code');
    });

    it('should allow zero as a valid value', () => {
      const metric = Metric.create({
        userId: 'user-1',
        value: 0,
        unit: 'meter',
        date: new Date()
      });
      expect(metric.baseValue).toBe(0);
    });
  });

  describe('restore()', () => {
    
    it('should reconstitute an entity ensuring ID and Date are preserved', () => {
      const fixedDate = new Date('2023-01-01');
      const fixedId = 'existing-uuid-123';
      
      const metric = Metric.restore({
        id: fixedId,
        userId: 'user-1',
        type: MetricTypeEnum.DISTANCE,
        baseValue: 507.97459999999995,
        originalValue: 19999.0,
        originalUnit: Unit.from('inch'),
        timestamp: fixedDate
      });

      expect(metric.id).toBe(fixedId);
      expect(metric.timestamp).toBe(fixedDate);
      expect(metric.baseValue).toBe(507.97459999999995);
    });

    it('should bypass validation logic (legacy data)', () => {
      const metric = Metric.restore({
        id: '123',
        userId: 'user-1',
        type: MetricTypeEnum.DISTANCE,
        baseValue: -100,
        originalValue: -1,
        originalUnit: Unit.from('meter'),
        timestamp: new Date()
      });

      expect(metric.baseValue).toBe(-100);
    });
  });

  describe('getValueIn()', () => {
    it('should convert Base Value (Meters) to Target Unit (Feet)', () => {
      const metric = Metric.restore({
        id: '1', userId: 'u1', type: MetricTypeEnum.DISTANCE,
        baseValue: 10,
        originalValue: 10, originalUnit: Unit.from('meter'),
        timestamp: new Date()
      });

      const valueInFeet = metric.getValueIn('feet');
      expect(valueInFeet).toBeCloseTo(32.8084, 3);
    });

    it('should handle identity conversion (Meter -> Meter)', () => {
      const metric = Metric.restore({
        id: '1', userId: 'u1', type: MetricTypeEnum.DISTANCE,
        baseValue: 50,
        originalValue: 50, originalUnit: Unit.from('meter'),
        timestamp: new Date()
      });

      expect(metric.getValueIn('meter')).toBe(50);
    });

    it('should throw error when converting mismatched types (Distance -> Temperature)', () => {
      const metric = Metric.restore({
        id: '1', userId: 'u1', type: MetricTypeEnum.DISTANCE,
        baseValue: 100,
        originalValue: 100, originalUnit: Unit.from('meter'),
        timestamp: new Date()
      });

      expect(() => {
        metric.getValueIn('c');
      }).toThrow();
    });

    it('should throw error if target unit is invalid string', () => {
      const metric = Metric.create({
        userId: 'u1', value: 10, unit: 'meter', date: new Date()
      });

      expect(() => {
        metric.getValueIn('random_string');
      }).toThrow('Invalid unit');
    });
  });
});