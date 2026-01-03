import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/categoryService';
import { success } from '../utils/response';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryService.findAllCategories();
    return success(res, categories);
  } catch (err) {
    return next(err);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.findCategoryById(req.params.id);
    return success(res, category);
  } catch (err) {
    return next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return success(res, category, 201);
  } catch (err) {
    return next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return success(res, category);
  } catch (err) {
    return next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.deleteCategoryById(req.params.id);
    return success(res, result);
  } catch (err) {
    return next(err);
  }
};