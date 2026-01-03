import mongoose from 'mongoose';
import { validateCategory } from '../validators';

export const findAllCategories = async () => {
  const Category = mongoose.models.Category;
  return Category.find().sort({ name: 1 });
};

export const findCategoryById = async (id: string) => {
  const Category = mongoose.models.Category;
  const category = await Category.findById(id);
  if (!category) {
    const err: any = new Error('Category not found');
    err.status = 404;
    throw err;
  }
  return category;
};

export const createCategory = async (payload: any) => {
  validateCategory(payload);
  
  const Category = mongoose.models.Category;
  const existing = await Category.findOne({ name: payload.name });
  if (existing) {
    const err: any = new Error('Category name already exists');
    err.status = 400;
    throw err;
  }
  
  const category = new Category(payload);
  await category.save();
  return category;
};

export const updateCategory = async (id: string, payload: any) => {
  validateCategory(payload);
  
  const Category = mongoose.models.Category;
  const existing = await Category.findOne({ name: payload.name, _id: { $ne: id } });
  if (existing) {
    const err: any = new Error('Category name already exists');
    err.status = 400;
    throw err;
  }
  
  const category = await Category.findByIdAndUpdate(id, payload, { new: true });
  if (!category) {
    const err: any = new Error('Category not found');
    err.status = 404;
    throw err;
  }
  return category;
};

export const deleteCategoryById = async (id: string) => {
  const Category = mongoose.models.Category;
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    const err: any = new Error('Category not found');
    err.status = 404;
    throw err;
  }
  return { message: 'Category deleted successfully' };
};