import { Router } from 'express';
import multer = require('multer');
import { testTesseract, testGemini, testBoth, testCompare } from '../controllers/ocrTestController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: OCR Testing
 *   description: Test OCR engines individually and combined
 */

// Test Tesseract only
router.post('/tesseract', upload.single('document'), testTesseract);

// Test Gemini only
router.post('/gemini', upload.single('document'), testGemini);

// Test both with fallback logic
router.post('/both', upload.single('document'), testBoth);

// Compare both engines side-by-side
router.post('/compare', upload.single('document'), testCompare);

export default router;
