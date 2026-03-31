import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController';

interface Deps {
  upload?: any;
}

export function createUploadRoutes(deps: Deps = {}) {
  const router = Router();
  const upload = deps.upload;

  /**
   * @openapi
   * /api/upload/image:
   *   post:
   *     summary: Upload an image to Cloudinary
   *     tags:
   *       - Upload
   *     consumes:
   *       - multipart/form-data
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               image:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Upload successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 url:
   *                   type: string
   *                 publicId:
   *                   type: string
   */
  router.post('/upload/image', upload.single('image'), uploadImage);

  return router;
}
