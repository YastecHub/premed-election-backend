import { validateRequired, validateString, validateEnum, ValidationError } from './base';

export function validateAdminLogin(data: any) {
  validateString(data.username, 'username', 3, 50);
  validateString(data.password, 'password', 1, 100);
}

export function validateUserAction(data: any) {
  validateString(data.userId, 'userId', 1, 50);
}

export function validateElectionToggle(data: any) {
  validateEnum(data.action, 'action', ['start', 'pause', 'resume', 'stop']);
  
  if (data.action === 'start') {
    validateRequired(data.durationMinutes, 'durationMinutes');
    const duration = Number(data.durationMinutes);
    if (isNaN(duration) || duration <= 0 || duration > 10080) {
      throw new ValidationError('durationMinutes', 'Duration must be between 1 and 10080 minutes');
    }
  }
}

export function validateVote(data: any) {
  validateString(data.userId, 'userId', 1, 50);
  validateString(data.candidateId, 'candidateId', 1, 50);
}

export function validateAccessCodeLogin(data: any) {
  validateString(data.code, 'code', 3, 20);
  validateString(data.fullName, 'fullName', 2, 100);
}

export function validateVerification(data: any) {
  validateString(data.userId, 'userId', 1, 50);
}

export function validateObjectId(id: any, field = 'id') {
  validateString(id, field, 24, 24);
  
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    throw new ValidationError(field, `${field} must be a valid ObjectId`);
  }
}