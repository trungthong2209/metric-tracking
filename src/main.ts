import "reflect-metadata";
import express from 'express';
import { DataSource } from 'typeorm';
import { env } from '@/config/env';
import { MetricSqlEntity } from "@/infrastructure/persistence/typeorm/entities/MetricSqlEntity";
import { DailyMetricSqlEntity } from "@/infrastructure/persistence/typeorm/entities/DailyMetricSqlEntity";
import { TypeOrmMetricRepository } from "@/infrastructure/persistence/typeorm/repositories/TypeOrmMetricRepository";
import { CreateMetricUseCase } from "@/application/use-cases/CreateMetricUseCase";
import { GetChartDataUseCase } from "@/application/use-cases/GetChartDataUseCase";
import { GetMetricListUseCase } from "@/application/use-cases/GetMetricUseCase";
import { responseInterceptor } from '@/interface-adapters/middleware/ResponseInterceptor';
import { createMetricRouter } from "@/interface-adapters/routes/MetricRoute";
import { MetricController } from "@/interface-adapters/controllers/MetricController";
import { authenticate } from "@/interface-adapters/middleware/AuthMiddleware";
import { getRedisClient } from "@/infrastructure/cache/redis/RedisClient";
import { RedisCacheService } from "@/infrastructure/cache/redis/RedisCacheService";

const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.database,
  useUTC: true,
  synchronize: env.app.nodeEnv === 'development',
  logging: true,
  entities: [MetricSqlEntity, DailyMetricSqlEntity],
});

const app = express();
app.use(authenticate)
app.use(express.json());
app.use(responseInterceptor);

AppDataSource.initialize().then(() => {
  console.log("Database connected.");
  const redisClient = getRedisClient();
  console.log("Redis connected")
  const cacheService = new RedisCacheService(redisClient);
  const metricRepo = new TypeOrmMetricRepository(AppDataSource);
  const createMetricUseCase = new CreateMetricUseCase(metricRepo, cacheService);
  const getChartDataUseCase = new GetChartDataUseCase(metricRepo, cacheService);
  const getListDataUseCase = new GetMetricListUseCase(metricRepo, cacheService);
  const metricController = new MetricController(createMetricUseCase, getChartDataUseCase, getListDataUseCase);

  app.use('/metrics', createMetricRouter(metricController));

  app.listen(env.app.port, () => console.log(`Server started on port ${env.app.port}`));
}).catch(error => console.log(error));