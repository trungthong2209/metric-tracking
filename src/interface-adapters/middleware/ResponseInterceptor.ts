import { Request, Response, NextFunction } from 'express';

export const responseInterceptor = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  res.json = function (body: any) {
    if (res.statusCode >= 400) {
      return originalJson.call(this, body);
    }
    if (Array.isArray(body?.data) && body.data?.length === 2 && typeof body?.data?.[1] === 'number' && Array.isArray(body?.data?.[0])) {
      
      const [data, total] = body.data;
      
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const totalPages = Math.ceil(total / limit);

      const paginatedResponse = {
        status: 'success',
        data: data,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        timestamp: new Date().toISOString()
      };

      return originalJson.call(this, paginatedResponse);
    }

    const standardResponse = {
      status: 'success',
      data: body,
      timestamp: new Date().toISOString()
    };

    return originalJson.call(this, standardResponse);
  };

  next();
};