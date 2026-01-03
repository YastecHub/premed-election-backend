import { validateRequired, validateString, validateEmail, validateEnum, validateNumber, validateBoolean, ValidationError } from './base';

const VERIFICATION_STATUSES = ['unverified', 'verified', 'pending_manual_review', 'rejected'];

const DEPARTMENTS = [
  'Medicine & Surgery (MBBS)',
  'Pharmacy',
  'Pharmacology', 
  'Nursing Science',
  'Medical Laboratory Science',
  'Radiography',
  'Physiology',
  'Anatomy',
  'Physiotherapy',
  'Dentistry'
];

export function validateUser(data: any) {
  validateString(data.matricNumber, 'matricNumber', 3, 20);
  
  const matricRegex = /^[A-Za-z0-9\/\-]+$/;
  if (!matricRegex.test(data.matricNumber)) {
    throw new ValidationError('matricNumber', 'Matric number contains invalid characters');
  }

  validateString(data.fullName, 'fullName', 2, 100);
  
  const nameRegex = /^[A-Za-z\s'\-]+$/;
  if (!nameRegex.test(data.fullName)) {
    throw new ValidationError('fullName', 'Full name contains invalid characters');
  }

  validateEmail(data.email);
  validateString(data.department, 'department', 2, 100);

  if (data.verificationStatus !== undefined) {
    validateEnum(data.verificationStatus, 'verificationStatus', VERIFICATION_STATUSES);
  }

  if (data.hasVoted !== undefined) {
    validateBoolean(data.hasVoted, 'hasVoted');
  }

  if (data.ocrConfidenceScore !== undefined) {
    validateNumber(data.ocrConfidenceScore, 'ocrConfidenceScore', 0, 1);
  }

  if (data.rejectionReason !== undefined && data.rejectionReason !== null) {
    validateString(data.rejectionReason, 'rejectionReason', 1, 500);
  }

  if (data.uploadedDocumentPath !== undefined && data.uploadedDocumentPath !== null) {
    validateString(data.uploadedDocumentPath, 'uploadedDocumentPath', 1, 500);
  }
};