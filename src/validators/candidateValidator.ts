import { validateRequired, validateString, validateNumber, validateBoolean, ValidationError } from './base';

const POSITIONS = ['President', 'Vice President', 'Secretary', 'Governor', 'Treasurer'];

export function validateCandidate(data: any) {
  validateString(data.name, 'name', 2, 100);
  
  const nameRegex = /^[A-Za-z\s"'\-\.]+$/;
  if (!nameRegex.test(data.name)) {
    throw new ValidationError('name', 'Name contains invalid characters');
  }

  validateString(data.position, 'position', 2, 50);
  validateString(data.department, 'department', 2, 100);
  validateString(data.photoUrl, 'photoUrl', 5, 500);
  
  try {
    new URL(data.photoUrl);
  } catch {
    throw new ValidationError('photoUrl', 'Photo URL must be a valid URL');
  }

  validateString(data.manifesto, 'manifesto', 10, 1000);

  if (data.voteCount !== undefined) {
    validateNumber(data.voteCount, 'voteCount', 0);
  }

  if (data.isActive !== undefined) {
    validateBoolean(data.isActive, 'isActive');
  }

  if (data.color !== undefined) {
    validateString(data.color, 'color', 3, 50);
    
    const colorRegex = /^(bg-\w+-\d+|#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})$/;
    if (!colorRegex.test(data.color)) {
      throw new ValidationError('color', 'Color must be a valid CSS class or hex color');
    }
  }
};