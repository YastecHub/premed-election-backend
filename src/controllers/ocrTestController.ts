import { Request, Response } from 'express';
import { processTesseract, processGemini, processDocument } from '../utils/ocr';
import { logger } from '../utils/logger';

/**
 * @swagger
 * /api/test/ocr/tesseract:
 *   post:
 *     summary: Test Tesseract OCR only
 *     tags: [OCR Testing]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *               - matricNumber
 *               - fullName
 *               - department
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               matricNumber:
 *                 type: string
 *               fullName:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tesseract OCR result
 */
export const testTesseract = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded' });
    }

    const { matricNumber, fullName, department } = req.body;

    if (!matricNumber || !fullName || !department) {
      return res.status(400).json({ 
        error: 'Missing required fields: matricNumber, fullName, department' 
      });
    }

    logger.info('Testing Tesseract OCR only...');
    const startTime = Date.now();

    const result = await processTesseract(req.file.buffer, {
      matricNumber,
      fullName,
      department
    });

    const duration = Date.now() - startTime;

    res.json({
      engine: 'Tesseract',
      duration: `${duration}ms`,
      result
    });

  } catch (error: any) {
    logger.error('Tesseract test failed:', error);
    res.status(500).json({
      engine: 'Tesseract',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/test/ocr/gemini:
 *   post:
 *     summary: Test Gemini AI OCR only
 *     tags: [OCR Testing]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *               - matricNumber
 *               - fullName
 *               - department
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               matricNumber:
 *                 type: string
 *               fullName:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gemini OCR result
 */
export const testGemini = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded' });
    }

    const { matricNumber, fullName, department } = req.body;

    if (!matricNumber || !fullName || !department) {
      return res.status(400).json({ 
        error: 'Missing required fields: matricNumber, fullName, department' 
      });
    }

    logger.info('Testing Gemini AI OCR only...');
    const startTime = Date.now();

    const result = await processGemini(req.file.buffer, {
      matricNumber,
      fullName,
      department
    });

    const duration = Date.now() - startTime;

    res.json({
      engine: 'Gemini AI',
      duration: `${duration}ms`,
      result
    });

  } catch (error: any) {
    logger.error('Gemini test failed:', error);
    res.status(500).json({
      engine: 'Gemini AI',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/test/ocr/both:
 *   post:
 *     summary: Test both OCR engines (normal flow with fallback)
 *     tags: [OCR Testing]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *               - matricNumber
 *               - fullName
 *               - department
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               matricNumber:
 *                 type: string
 *               fullName:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Combined OCR result with fallback logic
 */
export const testBoth = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded' });
    }

    const { matricNumber, fullName, department } = req.body;

    if (!matricNumber || !fullName || !department) {
      return res.status(400).json({ 
        error: 'Missing required fields: matricNumber, fullName, department' 
      });
    }

    logger.info('Testing both OCR engines with fallback logic...');
    const startTime = Date.now();

    const result = await processDocument(req.file.buffer, {
      matricNumber,
      fullName,
      department
    });

    const duration = Date.now() - startTime;

    res.json({
      engine: 'Combined (Tesseract + Gemini Fallback)',
      duration: `${duration}ms`,
      result,
      note: 'This uses the normal flow: Tesseract first, Gemini if needed'
    });

  } catch (error: any) {
    logger.error('Combined OCR test failed:', error);
    res.status(500).json({
      engine: 'Combined',
      error: error.message
    });
  }
};

/**
 * @swagger
 * /api/test/ocr/compare:
 *   post:
 *     summary: Compare both OCR engines side-by-side
 *     tags: [OCR Testing]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *               - matricNumber
 *               - fullName
 *               - department
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               matricNumber:
 *                 type: string
 *               fullName:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Side-by-side comparison of both engines
 */
export const testCompare = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded' });
    }

    const { matricNumber, fullName, department } = req.body;

    if (!matricNumber || !fullName || !department) {
      return res.status(400).json({ 
        error: 'Missing required fields: matricNumber, fullName, department' 
      });
    }

    logger.info('Comparing both OCR engines...');

    const inputData = { matricNumber, fullName, department };
    const results: any = {
      tesseract: null,
      gemini: null,
      comparison: {}
    };

    // Test Tesseract
    const tesseractStart = Date.now();
    try {
      results.tesseract = {
        result: await processTesseract(req.file.buffer, inputData),
        duration: `${Date.now() - tesseractStart}ms`
      };
    } catch (error: any) {
      results.tesseract = {
        error: error.message,
        duration: `${Date.now() - tesseractStart}ms`
      };
    }

    // Test Gemini
    const geminiStart = Date.now();
    try {
      results.gemini = {
        result: await processGemini(req.file.buffer, inputData),
        duration: `${Date.now() - geminiStart}ms`
      };
    } catch (error: any) {
      results.gemini = {
        error: error.message,
        duration: `${Date.now() - geminiStart}ms`
      };
    }

    // Comparison
    results.comparison = {
      tesseractSuccess: results.tesseract?.result?.success || false,
      geminiSuccess: results.gemini?.result?.success || false,
      tesseractConfidence: results.tesseract?.result?.confidence || 0,
      geminiConfidence: results.gemini?.result?.confidence || 0,
      winner: null
    };

    if (results.tesseract?.result && results.gemini?.result) {
      if (results.tesseract.result.confidence > results.gemini.result.confidence) {
        results.comparison.winner = 'Tesseract';
      } else if (results.gemini.result.confidence > results.tesseract.result.confidence) {
        results.comparison.winner = 'Gemini';
      } else {
        results.comparison.winner = 'Tie';
      }
    }

    res.json(results);

  } catch (error: any) {
    logger.error('Comparison test failed:', error);
    res.status(500).json({
      error: error.message
    });
  }
};
