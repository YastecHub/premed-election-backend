export type VerificationStatus = 'unverified' | 'verified' | 'pending_manual_review' | 'rejected';

export interface User {
  _id: string;
  matricNumber: string;
  fullName: string;
  email: string;
  department: string;
  verificationStatus: VerificationStatus;
  hasVoted: boolean;
  ocrConfidenceScore: number;
  uploadedDocumentUrl?: string;
  rejectionReason?: string;
  createdAt: Date;
}

export interface Candidate {
  _id: string;
  name: string;
  position: string;
  photoUrl: string;
  manifesto: string;
  voteCount: number;
  isActive: boolean;
  color: string;
}

export interface Admin {
  _id: string;
  username: string;
  role: 'super_admin' | 'moderator';
}

export interface VerificationResult {
  success: boolean;
  confidence: number;
  extractedData?: {
    matricMatch: boolean;
    nameMatch: boolean;
    deptMatch: boolean;
  };
  reason?: string;
}

export interface DepartmentMapping {
  [key: string]: string[];
}
