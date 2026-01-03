import { Request, Response, NextFunction } from 'express';
import * as registrationController from '../controllers/registrationController';

interface ControllerDeps {
  ocrSemaphore?: any;
  io?: any;
}

export function createRegistrationWithVerificationHandler(deps: ControllerDeps) {
  return function(req: Request, res: Response, next: NextFunction) {
    return registrationController.registerWithVerification(req, res, next, deps);
  };
}

export function createLoginWithCodeHandler(deps: ControllerDeps) {
  return function(req: Request, res: Response, next: NextFunction) {
    return registrationController.loginWithCode(req, res, next, deps);
  };
}

export function createVerifyHandler(deps: ControllerDeps) {
  return function(req: Request, res: Response, next: NextFunction) {
    return registrationController.verify(req, res, next, deps);
  };
}