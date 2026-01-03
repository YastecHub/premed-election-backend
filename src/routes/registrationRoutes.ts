import { Router } from 'express';
import * as registrationController from '../controllers/registrationController';
import { validateRequest } from '../middlewares/validation';
import { createLimiterMiddleware } from '../middlewares/limiter';
import { 
  createRegistrationWithVerificationHandler,
  createLoginWithCodeHandler,
  createVerifyHandler
} from '../controllers/registrationControllerFactory';

interface Deps {
  registerLimiter?: any;
  verifyLimiter?: any;
  upload?: any;
  ocrSemaphore?: any;
  io?: any;
}

export function createRegistrationRoutes(deps: Deps = {}) {
  const router = Router();
  const upload = deps.upload;

  /**
   * @openapi
   * /api/register:
   *   post:
   *     summary: Register a new student (simple)
   *     tags:
   *       - Registration
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               matricNumber:
   *                 type: string
   *               fullName:
   *                 type: string
   *               department:
   *                 type: string
   *               email:
   *                 type: string
   *     responses:
   *       200:
   *         description: Registered user
   */
  router.post('/register', createLimiterMiddleware(deps.registerLimiter), validateRequest('user'), registrationController.registerSimple);

  /**
   * @openapi
   * /api/register-with-verification:
   *   post:
   *     summary: Register with document verification (multipart)
   *     tags:
   *       - Registration
   *     consumes:
   *       - multipart/form-data
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               matricNumber:
   *                 type: string
   *               fullName:
   *                 type: string
   *               department:
   *                 type: string
   *               email:
   *                 type: string
   *               document:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Registered user with verification status
   */
  router.post('/register-with-verification', 
    createLimiterMiddleware(deps.registerLimiter), 
    upload.single('document'), 
    validateRequest('user'), 
    createRegistrationWithVerificationHandler({ ocrSemaphore: deps.ocrSemaphore, io: deps.io })
  );

  /**
   * @openapi
   * /api/login-with-code:
   *   post:
   *     summary: Login using an access code
   *     tags:
   *       - Registration
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               code:
   *                 type: string
   *               fullName:
   *                 type: string
   *     responses:
   *       200:
   *         description: Logged-in user
   */
  router.post('/login-with-code', 
    createLimiterMiddleware(deps.registerLimiter), 
    validateRequest('accessCodeLogin'), 
    createLoginWithCodeHandler({ io: deps.io })
  );

  /**
   * @openapi
   * /api/verify:
   *   post:
   *     summary: Submit a verification document for an existing user
   *     tags:
   *       - Registration
   *     consumes:
   *       - multipart/form-data
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               document:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Verification result
   */
  router.post('/verify', 
    createLimiterMiddleware(deps.verifyLimiter), 
    upload.single('document'), 
    validateRequest('verification'), 
    createVerifyHandler({ ocrSemaphore: deps.ocrSemaphore, io: deps.io })
  );

  return router;
}
