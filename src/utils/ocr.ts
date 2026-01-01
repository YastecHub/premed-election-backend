import Tesseract from 'tesseract.js';
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

export const processDocument = async (buffer: Buffer, inputData: InputData) => {
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
    logger.error("OCR Failed:", error);
    const errorMessage = error?.message || String(error);
    throw new Error(`Document verification failed: ${errorMessage}`);
  }
};
