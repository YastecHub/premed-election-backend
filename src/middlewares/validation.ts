import { Request, Response, NextFunction } from 'express';
import { ValidationError, validate, validateObjectId } from '../validators';

type ValidatorType = keyof typeof validate;

export function validateRequest(validatorType: ValidatorType, dataSource: 'body' | 'params' | 'query' = 'body') {
  return function(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req[dataSource];
      validate[validatorType](data);
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          message: 'Validation failed',
          field: error.field,
          error: error.message
        });
      }
      next(error);
    }
  };
}

export function validateParam(paramName: string) {
  return function(req: Request, res: Response, next: NextFunction) {
    try {
      validateObjectId(req.params[paramName], paramName);
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          message: 'Validation failed',
          field: error.field,
          error: error.message
        });
      }
      next(error);
    }
  };
}