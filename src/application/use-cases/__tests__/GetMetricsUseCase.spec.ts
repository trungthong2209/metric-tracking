import 'reflect-metadata';
import { GetMetricListUseCase } from '../GetMetricUseCase';
import { IMetricRepository } from '@/domain/repositories/IMetricRepository';
import { ICacheService } from '@/application/interfaces/ICacheService';
import { Metric } from '@/domain/entities/Metric';
import { GetMetricsInput } from '@/application/dtos/GetMetricsInputDTO';
import { MetricTypeEnum } from '@/domain/enums/MetricType';

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

const createMockMetric = (id: string, baseValue: number, timestamp: Date) => {
  return {
    id,
    type: MetricTypeEnum.DISTANCE,
    timestamp,
    getValueIn: jest.fn().mockReturnValue(baseValue),
  } as unknown as Metric;
};

describe('GetMetricListUseCase', () => {
  let useCase: GetMetricListUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetMetricListUseCase(mockRepo, mockCache);
  });

  describe('execute()', () => {
    
    it('should fetch from repo, convert units, and return data on Cache Miss', async () => {
      const query: GetMetricsInput = { 
        type: MetricTypeEnum.DISTANCE, 
        page: 1, 
        limit: 10, 
        unit: 'meter' 
      };
      
      const mockDate = new Date();
      const metricEntity = createMockMetric('1', 100, mockDate);
      
      mockRepo.findAllByType.mockResolvedValue([[metricEntity], 1]);
      mockCache.wrap.mockImplementation(async (userId, key, fn) => {
        return await fn(); 
      });

      const [result, total] = await useCase.execute('user-1', query);

      expect(mockCache.wrap).toHaveBeenCalled();
      expect(mockRepo.findAllByType).toHaveBeenCalledWith('user-1', 'distance', 10, 1);
      expect(metricEntity.getValueIn).toHaveBeenCalledWith('meter');
      expect(total).toBe(1);
      expect(result[0]).toEqual({
        id: '1',
        type: 'distance',
        value: 100,
        unit: 'meter',
        date: mockDate
      });
    });

    it('should return cached data without calling repo on Cache Hit', async () => {
      const cachedResponse = [[{ id: 'cached', value: 99 }], 1];
      
      mockCache.wrap.mockResolvedValue(cachedResponse);

      const result = await useCase.execute('user-1', { 
        type: MetricTypeEnum.DISTANCE, page: 1, limit: 10, unit: 'km' 
      });

      expect(result).toBe(cachedResponse);
      expect(mockRepo.findAllByType).not.toHaveBeenCalled();
    });

    it('should handle empty repository results gracefully', async () => {
      mockRepo.findAllByType.mockResolvedValue([[], 0]);
      mockCache.wrap.mockImplementation(async (u, k, fn) => fn());

      const [result, total] = await useCase.execute('user-1', { 
        type: MetricTypeEnum.DISTANCE, page: 1, limit: 10, unit: 'meter' 
      });

      expect(result).toEqual([]);
      expect(total).toBe(0);
    });

    it('should generate the correct cache key', async () => {
      mockCache.wrap.mockImplementation(async (u, k, fn) => fn());
      mockRepo.findAllByType.mockResolvedValue([[], 0]);

      const query: GetMetricsInput = { 
        type: MetricTypeEnum.TEMPERATURE, 
        page: 2, 
        limit: 20, 
        unit: 'celsius' 
      };

      await useCase.execute('user-1', query);

      const expectedKey = `GET_METRIC:${MetricTypeEnum.TEMPERATURE}_2_20_celsius`;
      expect(mockCache.wrap).toHaveBeenCalledWith(
        'user-1', 
        expectedKey, 
        expect.any(Function), 
        1
      );
    });
  });
});