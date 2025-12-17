import 'reflect-metadata';
import { CreateMetricUseCase } from '../CreateMetricUseCase';
import { IMetricRepository } from '@/domain/repositories/IMetricRepository';
import { ICacheService } from '@/application/interfaces/ICacheService';
import { CreateMetricRequestDTO } from '@/application/dtos/CreateMetricRequestDTO';
import { Metric } from '@/domain/entities/Metric';

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


describe('CreateMetricUseCase', () => {
  let useCase: CreateMetricUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateMetricUseCase(mockRepo, mockCache);
  });

  describe('execute()', () => {
    
    it('should create metric, save to repo, invalidate cache, and return true', async () => {
      const input: CreateMetricRequestDTO = {
        value: 10,
        unit: 'meter',
        date: '2025-12-17T10:00:00Z'
      };
      
      const createSpy = jest.spyOn(Metric, 'create');
      mockRepo.save.mockResolvedValue({} as any);
      mockCache.invalidateUser.mockResolvedValue();

      const result = await useCase.execute('user-1', input);

      expect(createSpy).toHaveBeenCalledWith({
        userId: 'user-1',
        value: 10,
        unit: 'meter',
        date: new Date('2025-12-17T10:00:00.000Z')
      });
      
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(mockCache.invalidateUser).toHaveBeenCalledWith('user-1');
      expect(result).toBe(true);
    });

    it('should throw wrapped error if repository fails', async () => {
      mockRepo.save.mockRejectedValue(new Error('DB Connection Failed'));

      const input: CreateMetricRequestDTO = {
        value: 10,
        unit: 'meter',
        date: new Date().toISOString()
      };

      await expect(useCase.execute('user-1', input))
        .rejects
        .toThrow('Failed to create metric: Error: DB Connection Failed');
      
      expect(mockCache.invalidateUser).toHaveBeenCalled(); // Promise.all runs concurrently
    });

    it('should throw wrapped error if metric creation fails', async () => {
      // Force Metric.create to throw by passing invalid unit
      const input: CreateMetricRequestDTO = {
        value: 10,
        unit: 'INVALID_UNIT',
        date: new Date().toISOString()
      };

      await expect(useCase.execute('user-1', input))
        .rejects
        .toThrow('Failed to create metric: Error: Invalid unit: INVALID_UNIT');

      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });
});