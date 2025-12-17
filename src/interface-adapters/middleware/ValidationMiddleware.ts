import { Request, Response, NextFunction, RequestHandler } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export const validateDto = (
  dtoClass: any, 
  source: 'body' | 'query' = 'body'
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const rawData = source === 'query' ? req.query : req.body;
    const dataToValidate = rawData || {};
    const dtoInstance = plainToInstance(dtoClass, dataToValidate, { 
      enableImplicitConversion: true 
    });
    const errors = await validate(dtoInstance, { 
      whitelist: true,
      forbidNonWhitelisted: true 
    });

    if (errors.length > 0) {
      const errorMessages = formatErrors(errors);
      res.status(400).json({ 
        error: "Validation Failed", 
        details: errorMessages 
      });
      return;
    }

    if (source === 'body') {
      req.validatedBody = dtoInstance;
    } else {
      req.validatedQuery = dtoInstance;
    }

    next();
  };
};

function formatErrors(errors: ValidationError[]): string[] {
  return errors.map(err => {
    if (err.children && err.children.length > 0) {
      return formatErrors(err.children);
    }
    return Object.values(err.constraints || {});
  }).flat();
}