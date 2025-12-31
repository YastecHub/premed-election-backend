import { Router } from 'express';
import * as registrationController from '../controllers/registrationController';

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
  router.post('/register', deps.registerLimiter || ((req,res,next)=>next()), registrationController.registerSimple);

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
  router.post('/register-with-verification', deps.registerLimiter || ((req,res,next)=>next()), upload.single('document'), (req,res,next) => registrationController.registerWithVerification(req,res,next, { ocrSemaphore: deps.ocrSemaphore, io: deps.io }));

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
  router.post('/login-with-code', deps.registerLimiter || ((req,res,next)=>next()), (req,res,next) => registrationController.loginWithCode(req,res,next, { io: deps.io }));

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
  router.post('/verify', deps.verifyLimiter || ((req,res,next)=>next()), upload.single('document'), (req,res,next) => registrationController.verify(req,res,next, { ocrSemaphore: deps.ocrSemaphore, io: deps.io }));

  return router;
}
