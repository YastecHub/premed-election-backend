import Tesseract = require('tesseract.js');
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from './logger';

type DepartmentMapping = { [department: string]: string[] };

const DEPARTMENT_KEYWORDS: DepartmentMapping = {
  'Medicine & Surgery (MBBS)': ['MBBS', 'Surgery', 'Medical', 'Clinical', 'Medicine'],
  'Pharmacy': ['Doctor of Pharmacy', 'Pharm.D', 'Pharmacology', 'B.Pharm', 'Pharmacy'],
  'Pharmacology': ['Pharmacology', 'Pharmaceutical'],
  'Nursing Science': ['Nursing', 'B.N.Sc', 'Midwifery', 'Nurse'],
  'Medical Laboratory Science': ['Laboratory', 'MLT', 'Medical Lab', 'B.M.L.S'],
  'Radiography': ['Radiography', 'Radiology', 'X-ray', 'Imaging'],
  'Physiology': ['Physiology', 'Physiological'],
  'Anatomy': ['Anatomy', 'Anatomical'],
  'Physiotherapy': ['Physiotherapy', 'B.Physio', 'Rehabilitation', 'Physical Therapy'],
  'Dentistry': ['BDS', 'Dental', 'Oral', 'Dentistry'],
};

interface InputData {
  matricNumber: string;
  fullName: string;
  department: string;
}

interface OCRResult {
  success: boolean;
  confidence: number;
  reason: string | null;
  extractedText?: string;
}

const OCR_CONFIDENCE_THRESHOLD = parseFloat(process.env.OCR_CONFIDENCE_THRESHOLD || '0.7');
const ENABLE_GEMINI_FALLBACK = process.env.ENABLE_GEMINI_FALLBACK !== 'false';

const processTesseract = async (buffer: Buffer, inputData: InputData): Promise<OCRResult> => {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error("Document file is empty");
    }

    const bufferStart = buffer.toString('utf8', 0, 5);
    if (bufferStart.includes('%PDF')) {
      throw new Error("PDF files are not supported. Please upload an image file (JPG, PNG) instead.");
    }

    const magicNumbers = buffer.slice(0, 4);
    const isPNG = magicNumbers[0] === 0x89 && magicNumbers[1] === 0x50;
    const isJPEG = magicNumbers[0] === 0xFF && magicNumbers[1] === 0xD8;
    const isGIF = magicNumbers[0] === 0x47 && magicNumbers[1] === 0x49;
    
    if (!isPNG && !isJPEG && !isGIF) {
      throw new Error("Invalid image file. Please upload JPG, PNG, or GIF image.");
    }

    if (isJPEG) {
      if (buffer.length < 4) {
        throw new Error('Corrupted JPEG: file too small');
      }
      const eoi1 = buffer[buffer.length - 2];
      const eoi2 = buffer[buffer.length - 1];
      if (eoi1 !== 0xFF || eoi2 !== 0xD9) {
        throw new Error('Corrupted JPEG: premature end of file');
      }
    }

    const result = await Tesseract.recognize(buffer, 'eng');
    const extractedText = result.data.text;
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error("No text found in document. Please ensure the document is clear and readable.");
    }

    const normalizedText = extractedText.toLowerCase();
    const normalizedMatric = inputData.matricNumber.trim().toLowerCase();
    const normalizedName = inputData.fullName.trim().toLowerCase();
    const normalizedDept = inputData.department.trim();

    const matricMatch = normalizedText.includes(normalizedMatric);
    if (!matricMatch) {
      return {
        success: false,
        confidence: result.data.confidence / 100,
        reason: `Matric number ${inputData.matricNumber} not found in document.`
      };
    }

    const nameTokens = normalizedName.split(/\s+/).filter(t => t.length > 2);
    const foundTokens = nameTokens.filter(token => normalizedText.includes(token));
    const matchRatio = foundTokens.length / nameTokens.length;
    const isNameValid = nameTokens.length === 1 ? matchRatio === 1 : matchRatio >= 0.5;

    if (!isNameValid) {
      return {
        success: false,
        confidence: result.data.confidence / 100,
        reason: `Name mismatch. Found ${foundTokens.length}/${nameTokens.length} name parts.`
      };
    }

    const keywords = DEPARTMENT_KEYWORDS[normalizedDept as keyof typeof DEPARTMENT_KEYWORDS];
    
    if (!keywords) {
      return {
        success: false,
        confidence: result.data.confidence / 100,
        reason: `Department "${inputData.department}" is not recognized. Please verify manually.`
      };
    }

    const isDeptValid = keywords.some(k => normalizedText.includes(k.toLowerCase()));

    if (!isDeptValid) {
      return {
        success: false,
        confidence: result.data.confidence / 100,
        reason: `Department keywords for ${inputData.department} not found in document. Manual review required.`
      };
    }

    return {
      success: true,
      confidence: result.data.confidence / 100,
      reason: null
    };

  } catch (error: any) {
    logger.error("Tesseract OCR Failed:", error);
    throw error;
  }
};

const processGemini = async (buffer: Buffer, inputData: InputData): Promise<OCRResult> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    logger.info('Using Gemini AI fallback for OCR');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const base64Image = buffer.toString('base64');
    const mimeType = buffer[0] === 0x89 && buffer[1] === 0x50 ? 'image/png' : 
                     buffer[0] === 0xFF && buffer[1] === 0xD8 ? 'image/jpeg' : 'image/gif';

    const prompt = `Extract all visible text from this student ID card image. Return only the extracted text, nothing else.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const extractedText = response.text();
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text extracted by Gemini');
    }

    // Now do the SAME validation as Tesseract
    const normalizedText = extractedText.toLowerCase();
    const normalizedMatric = inputData.matricNumber.trim().toLowerCase();
    const normalizedName = inputData.fullName.trim().toLowerCase();
    const normalizedDept = inputData.department.trim();

    // Check matric number
    const matricMatch = normalizedText.includes(normalizedMatric);
    if (!matricMatch) {
      return {
        success: false,
        confidence: 0.85,
        reason: `Matric number ${inputData.matricNumber} not found in document.`,
        extractedText
      };
    }

    // Check name
    const nameTokens = normalizedName.split(/\s+/).filter(t => t.length > 2);
    const foundTokens = nameTokens.filter(token => normalizedText.includes(token));
    const matchRatio = foundTokens.length / nameTokens.length;
    const isNameValid = nameTokens.length === 1 ? matchRatio === 1 : matchRatio >= 0.5;

    if (!isNameValid) {
      return {
        success: false,
        confidence: 0.85,
        reason: `Name mismatch. Found ${foundTokens.length}/${nameTokens.length} name parts.`,
        extractedText
      };
    }

    // Check department
    const keywords = DEPARTMENT_KEYWORDS[normalizedDept as keyof typeof DEPARTMENT_KEYWORDS];
    
    if (!keywords) {
      return {
        success: false,
        confidence: 0.85,
        reason: `Department "${inputData.department}" is not recognized. Please verify manually.`,
        extractedText
      };
    }

    const isDeptValid = keywords.some(k => normalizedText.includes(k.toLowerCase()));

    if (!isDeptValid) {
      return {
        success: false,
        confidence: 0.85,
        reason: `Department keywords for ${inputData.department} not found in document. Manual review required.`,
        extractedText
      };
    }

    return {
      success: true,
      confidence: 0.90,
      reason: null,
      extractedText
    };

  } catch (error: any) {
    logger.error('Gemini OCR Failed:', error);
    throw error;
  }
};

export const processDocument = async (buffer: Buffer, inputData: InputData): Promise<OCRResult> => {
  let tesseractResult: OCRResult | null = null;
  let tesseractError: any = null;

  try {
    tesseractResult = await processTesseract(buffer, inputData);
    
    if (tesseractResult.success && tesseractResult.confidence >= OCR_CONFIDENCE_THRESHOLD) {
      logger.info(`Tesseract OCR successful with confidence: ${tesseractResult.confidence}`);
      return tesseractResult;
    }

    logger.warn(`Tesseract result: success=${tesseractResult.success}, confidence=${tesseractResult.confidence}. Trying Gemini fallback...`);
  } catch (error: any) {
    tesseractError = error;
    logger.warn('Tesseract failed, attempting Gemini fallback:', error.message);
  }

  if (ENABLE_GEMINI_FALLBACK) {
    try {
      const geminiResult = await processGemini(buffer, inputData);
      
      if (geminiResult.success) {
        logger.info(`Gemini OCR successful with confidence: ${geminiResult.confidence}`);
        return geminiResult;
      }

      if (tesseractResult) {
        logger.warn('Both OCR methods had issues. Returning Tesseract result for manual review.');
        return tesseractResult;
      }

      throw new Error(`Both OCR methods failed. Tesseract: ${tesseractError?.message || 'Unknown error'}. Gemini: ${geminiResult.reason}`);
    } catch (geminiError: any) {
      logger.error('Gemini fallback also failed:', geminiError);
      
      if (tesseractResult) {
        logger.warn('Gemini failed but Tesseract has a result. Returning Tesseract result.');
        return tesseractResult;
      }

      throw new Error(`Document verification failed. Tesseract: ${tesseractError?.message || 'Failed'}. Gemini: ${geminiError.message}`);
    }
  }

  if (tesseractResult) {
    return tesseractResult;
  }

  throw tesseractError || new Error('OCR processing failed');
};

// Export individual processors for testing
export { processTesseract, processGemini };
