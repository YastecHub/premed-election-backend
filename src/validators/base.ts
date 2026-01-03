export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateRequired = (value: any, field: string): void => {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(field, `${field} is required`);
  }
};

export const validateString = (value: any, field: string, minLength = 1, maxLength = 500): void => {
  validateRequired(value, field);
  if (typeof value !== 'string') {
    throw new ValidationError(field, `${field} must be a string`);
  }
  if (value.length < minLength) {
    throw new ValidationError(field, `${field} must be at least ${minLength} characters`);
  }
  if (value.length > maxLength) {
    throw new ValidationError(field, `${field} must not exceed ${maxLength} characters`);
  }
};

export const validateEmail = (email: any, field = 'email'): void => {
  validateString(email, field);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError(field, `${field} must be a valid email address`);
  }
};

export const validateEnum = (value: any, field: string, allowedValues: string[]): void => {
  validateRequired(value, field);
  if (!allowedValues.includes(value)) {
    throw new ValidationError(field, `${field} must be one of: ${allowedValues.join(', ')}`);
  }
};

export const validateNumber = (value: any, field: string, min = 0, max = Number.MAX_SAFE_INTEGER): void => {
  if (value !== undefined && value !== null) {
    const num = Number(value);
    if (isNaN(num)) {
      throw new ValidationError(field, `${field} must be a valid number`);
    }
    if (num < min) {
      throw new ValidationError(field, `${field} must be at least ${min}`);
    }
    if (num > max) {
      throw new ValidationError(field, `${field} must not exceed ${max}`);
    }
  }
};

export const validateBoolean = (value: any, field: string): void => {
  if (value !== undefined && value !== null && typeof value !== 'boolean') {
    throw new ValidationError(field, `${field} must be a boolean`);
  }
};