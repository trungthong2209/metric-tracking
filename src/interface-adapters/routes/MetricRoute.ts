import { Router, Request } from 'express';
import { MetricController } from '@/interface-adapters/controllers/MetricController';
import { validateDto } from '@/interface-adapters/middleware/ValidationMiddleware';
import { CreateMetricRequestDTO } from '@/application/dtos/CreateMetricRequestDTO';
import { GetChartRequestDTO } from '@/application/dtos/GetChartRequestDTO';
import { GetMetricsInput } from '@/application/dtos/GetMetricsInputDTO';

export const createMetricRouter = (controller: MetricController): Router => {
  const router = Router();

  router.post('/', 
    validateDto(CreateMetricRequestDTO),
    (req, res) => controller.create(req, res)
  );

  router.get('/list', 
    validateDto(GetMetricsInput, 'query'), 
    (req, res) => {
       controller.getList(req, res);
    }
  );

  router.get('/chart', 
    validateDto(GetChartRequestDTO, 'query'), 
    (req, res) => {
       controller.getChart(req, res);
    }
  );

  return router;
};