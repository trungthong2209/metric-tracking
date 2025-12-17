import { Request, Response, NextFunction } from 'express';

export interface ValidatedRequest<TQuery = any, TBody = any, TParams = any> extends Request {
  validatedQuery?: TQuery;
  validatedBody?: TBody;
  validatedParams?: TParams;
  user: {
    id: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export abstract class BaseController {
  protected asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  protected ok<T>(res: Response, data: T, message?: string): Response {
    return res.status(200).json({
      success: true,
      data,
      message,
    } as ApiResponse<T>);
  }

  protected badRequest<T>(res: Response, message: string): Response {
    return res.status(400).json({
        error: message,
    } as ApiResponse<T>);
  }

  protected created<T>(res: Response, data: T, message?: string): Response {
    return res.status(201).json({
      success: true,
      data,
      message,
    } as ApiResponse<T>);
  }

  protected getValidatedQuery<T>(req: Request): T {
    return (req as any).validatedQuery as T;
  }

  protected getValidatedBody<T>(req: Request): T {
    return req.body as T;
  }

  protected getValidatedParams<T>(req: Request): T {
    return (req as any).validatedParams as T;
  }
}