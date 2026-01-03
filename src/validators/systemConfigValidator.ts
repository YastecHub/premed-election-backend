import { validateBoolean, validateNumber, ValidationError } from './base';

export function validateSystemConfig(data: any) {
  if (data.isElectionActive !== undefined) {
    validateBoolean(data.isElectionActive, 'isElectionActive');
  }

  if (data.startTime !== undefined && data.startTime !== null) {
    const startTime = new Date(data.startTime);
    if (isNaN(startTime.getTime())) {
      throw new ValidationError('startTime', 'Start time must be a valid date');
    }
  }

  if (data.endTime !== undefined && data.endTime !== null) {
    const endTime = new Date(data.endTime);
    if (isNaN(endTime.getTime())) {
      throw new ValidationError('endTime', 'End time must be a valid date');
    }
    
    if (data.startTime && data.endTime) {
      const startTime = new Date(data.startTime);
      if (endTime <= startTime) {
        throw new ValidationError('endTime', 'End time must be after start time');
      }
    }
  }

  if (data.adminSetDurationMinutes !== undefined) {
    validateNumber(data.adminSetDurationMinutes, 'adminSetDurationMinutes', 0, 10080);
  }
};