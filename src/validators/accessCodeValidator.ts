import { validateRequired, validateString, validateBoolean, ValidationError } from './base';

export function validateAccessCode(data: any) {
  validateString(data.code, 'code', 3, 20);
  
  const codeRegex = /^[A-Za-z0-9\-]+$/;
  if (!codeRegex.test(data.code)) {
    throw new ValidationError('code', 'Access code can only contain letters, numbers, and hyphens');
  }

  if (data.isUsed !== undefined) {
    validateBoolean(data.isUsed, 'isUsed');
  }
};