import { validateRequired, validateString, validateEnum, ValidationError } from './base';

const ADMIN_ROLES = ['super_admin', 'moderator'];

export function validateAdmin(data: any) {
  validateString(data.username, 'username', 3, 50);
  
  const usernameRegex = /^[A-Za-z0-9_]+$/;
  if (!usernameRegex.test(data.username)) {
    throw new ValidationError('username', 'Username can only contain letters, numbers, and underscores');
  }

  validateString(data.password, 'password', 6, 100);

  if (data.password.length < 6) {
    throw new ValidationError('password', 'Password must be at least 6 characters long');
  }
  
  const hasLetter = /[A-Za-z]/.test(data.password);
  const hasNumber = /\d/.test(data.password);
  
  if (!hasLetter || !hasNumber) {
    throw new ValidationError('password', 'Password must contain at least one letter and one number');
  }

  if (data.role !== undefined) {
    validateEnum(data.role, 'role', ADMIN_ROLES);
  }
};