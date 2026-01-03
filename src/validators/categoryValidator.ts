import { validateString, ValidationError } from './base';

export function validateCategory(data: any) {
  validateString(data.name, 'name', 2, 100);
  
  const nameRegex = /^[A-Za-z\s\-]+$/;
  if (!nameRegex.test(data.name)) {
    throw new ValidationError('name', 'Category name can only contain letters, spaces, and hyphens');
  }
}