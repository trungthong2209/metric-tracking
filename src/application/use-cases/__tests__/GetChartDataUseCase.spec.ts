import 'reflect-metadata';
import { GetChartDataUseCase } from '../GetChartDataUseCase';
import { IMetricRepository } from '@/domain/repositories/IMetricRepository';
import { ICacheService } from '@/application/interfaces/ICacheService';
import { Metric } from '@/domain/entities/Metric';
import { MetricTypeEnum } from '@/domain/enums/MetricType';
import { UnitCode } from '@/domain/enums/UnitCode';

const mockRepo: jest.Mocked<IMetricRepository> = {
    findAllByType: jest.fn(),
    save: jest.fn(),
    findLatestPerDay: jest.fn(),
  };
  
  const mockCache: jest.Mocked<ICacheService> = {
    wrap: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    invalidateUser: jest.fn(),
    releaseLock: jest.fn(),
    acquireLock: jest.fn(),
  };

const createMockMetric = (id: string, value: number, unitCode: string, date: Date) => {
  return {
    id,
    timestamp: date,
    originalUnit: { code: unitCode },
    getValueIn: jest.fn().mockReturnValue(value),
  } as unknown as Metric;
};

describe('GetChartDataUseCase', () => {
  let useCase: GetChartDataUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); 
    useCase = new GetChartDataUseCase(mockRepo, mockCache);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('execute()', () => {

    it('should fetch data, calculate date range, and return formatted response on Cache Miss', async () => {
      const fixedDate = new Date('2025-12-17T10:00:00Z');
      jest.setSystemTime(fixedDate);

      const period = 7;
      const expectedSince = new Date(fixedDate);
      expectedSince.setDate(expectedSince.getDate() - period);

      const metric = createMockMetric('1', 50, UnitCode.METER, fixedDate);
      
      mockRepo.findLatestPerDay.mockResolvedValue([metric]);
      mockCache.wrap.mockImplementation(async (u, k, fn) => fn());

      const result = await useCase.execute('user-1', {
        type: MetricTypeEnum.DISTANCE,
        period: period,
        unit: 'feet' 
      });

      expect(mockRepo.findLatestPerDay).toHaveBeenCalledWith(
        'user-1', 
        MetricTypeEnum.DISTANCE, 
        expectedSince
      );
      
      expect(metric.getValueIn).toHaveBeenCalledWith('feet');
      expect(result).toEqual([{
        date: fixedDate.toISOString(),
        value: 50,
        unit: 'feet'
      }]);
    });

    it('should use original unit code if specific unit is not requested', async () => {
      const fixedDate = new Date();
      const metric = createMockMetric('1', 100, UnitCode.METER, fixedDate);

      mockRepo.findLatestPerDay.mockResolvedValue([metric]);
      mockCache.wrap.mockImplementation(async (u, k, fn) => fn());

      const result = await useCase.execute('user-1', {
        type: MetricTypeEnum.DISTANCE,
        period: 30,
        unit: undefined as any,
      });

      expect(metric.getValueIn).toHaveBeenCalledWith(UnitCode.METER);
      expect(result[0].unit).toBe(UnitCode.METER);
    });

    it('should return cached data without calling repo on Cache Hit', async () => {
      const cachedData = [{ date: '2025-01-01', value: 10, unit: 'km' }];
      mockCache.wrap.mockResolvedValue(cachedData);

      const result = await useCase.execute('user-1', {
        type: MetricTypeEnum.DISTANCE,
        period: 7,
        unit: 'km'
      });

      expect(result).toBe(cachedData);
      expect(mockRepo.findLatestPerDay).not.toHaveBeenCalled();
    });

    it('should generate correct cache key', async () => {
      mockRepo.findLatestPerDay.mockResolvedValue([]);
      mockCache.wrap.mockImplementation(async (u, k, fn) => fn());

      await useCase.execute('user-1', {
        type: MetricTypeEnum.TEMPERATURE,
        period: 14,
        unit: 'celsius'
      });

      const expectedKey = `GET_CHART:${MetricTypeEnum.TEMPERATURE}_14_celsius`;
      expect(mockCache.wrap).toHaveBeenCalledWith(
        'user-1',
        expectedKey,
        expect.any(Function),
        1
      );
    });
  });
});