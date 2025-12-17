import { Request, Response } from 'express';
import { CreateMetricUseCase } from "@/application/use-cases/CreateMetricUseCase";
import { GetChartDataUseCase } from "@/application/use-cases/GetChartDataUseCase";
import { GetMetricListUseCase } from "@/application/use-cases/GetMetricUseCase";
import { CreateMetricRequestDTO } from '../../application/dtos/CreateMetricRequestDTO';
import { GetChartRequestDTO } from '../../application/dtos/GetChartRequestDTO';
import { GetMetricsInput } from '@/application/dtos/GetMetricsInputDTO';
import { BaseController } from './base/BaseController';

export class MetricController extends BaseController {
  constructor(
    private createUseCase: CreateMetricUseCase,
    private chartUseCase: GetChartDataUseCase,
    private getMetricListUseCase: GetMetricListUseCase,
  ) {
    super();
  }

  async create(req: Request, res: Response) {
    try {
      const validatedBody = this.getValidatedBody<CreateMetricRequestDTO>(req);
      const result = await this.createUseCase.execute(req.user.id, validatedBody);
      this.created(res, result)
    } catch (error: any) {
      this.badRequest(res, error.message);
    }
  }

  async getChart(req: Request, res: Response) {
    try {      
      const validatedQuery = this.getValidatedQuery<GetChartRequestDTO>(req);
      const result = await this.chartUseCase.execute(
        req.user.id,
        validatedQuery
      );
      this.ok(res, result)
    } catch (error: any) {
      this.badRequest(res, error.message);
    }
  }

  async getList(req: Request, res: Response) {
    try {
      const validatedQuery = this.getValidatedQuery<GetMetricsInput>(req);
      const result = await this.getMetricListUseCase.execute(req.user.id, validatedQuery);
      this.ok(res, result)
    } catch (error: any) {
      this.badRequest(res, error.message);
    }
  }
}