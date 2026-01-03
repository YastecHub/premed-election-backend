export { ValidationError } from './base';
export { validateUser } from './userValidator';
export { validateCandidate } from './candidateValidator';
export { validateAdmin } from './adminValidator';
export { validateAccessCode } from './accessCodeValidator';
export { validateSystemConfig } from './systemConfigValidator';
export { validateElection } from './electionValidator';
export { validateCategory } from './categoryValidator';
export { 
  validateAdminLogin,
  validateUserAction,
  validateElectionToggle,
  validateVote,
  validateAccessCodeLogin,
  validateVerification,
  validateObjectId
} from './routeValidators';

import { validateUser } from './userValidator';
import { validateCandidate } from './candidateValidator';
import { validateAdmin } from './adminValidator';
import { validateAccessCode } from './accessCodeValidator';
import { validateSystemConfig } from './systemConfigValidator';
import { validateElection } from './electionValidator';
import { validateCategory } from './categoryValidator';
import { 
  validateAdminLogin,
  validateUserAction,
  validateElectionToggle,
  validateVote,
  validateAccessCodeLogin,
  validateVerification,
  validateObjectId
} from './routeValidators';

// Centralized validation function
export const validate = {
  user: validateUser,
  candidate: validateCandidate,
  admin: validateAdmin,
  accessCode: validateAccessCode,
  systemConfig: validateSystemConfig,
  election: validateElection,
  category: validateCategory,
  adminLogin: validateAdminLogin,
  userAction: validateUserAction,
  electionToggle: validateElectionToggle,
  vote: validateVote,
  accessCodeLogin: validateAccessCodeLogin,
  verification: validateVerification,
  objectId: validateObjectId
};