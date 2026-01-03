import mongoose from 'mongoose';
import { processDocument } from '../utils/ocr';
import { validateUser, validateAccessCodeLogin } from '../validators';

export const registerSimple = async (payload: any) => {
  validateUser(payload);
  
  const User = mongoose.models.User;
  const existing = await User.findOne({ matricNumber: payload.matricNumber });
  if (existing) {
    const err: any = new Error('Matric number already registered');
    err.status = 400;
    throw err;
  }

  const user = new User(payload);
  await user.save();
  return user;
};

export const registerWithVerification = async (buffer: Buffer, payload: any) => {
  validateUser(payload);
  
  const { matricNumber, fullName, department, email } = payload;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let ocrResult;
    try {
      ocrResult = await processDocument(buffer, { matricNumber, fullName, department });
    } catch (ocrErr: any) {
      await session.abortTransaction();
      session.endSession();
      const err: any = new Error(ocrErr?.message || 'Document verification failed');
      err.status = 400;
      throw err;
    }

    if (!ocrResult || !ocrResult.success) {
      await session.abortTransaction();
      session.endSession();
      const err: any = new Error(ocrResult?.reason || 'OCR check failed');
      err.status = 400;
      throw err;
    }

    const User = mongoose.models.User;
    const existing = await User.findOne({ matricNumber }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      const err: any = new Error('Matric number already registered');
      err.status = 400;
      throw err;
    }

    const user = new User({ matricNumber, fullName, department, email, verificationStatus: 'verified', ocrConfidenceScore: ocrResult.confidence });
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return user;
  } catch (err) {
    try { await session.abortTransaction(); } catch (e) {}
    try { session.endSession(); } catch (e) {}
    throw err;
  }
};

export const loginWithCode = async (payload: any) => {
  validateAccessCodeLogin(payload);
  
  const { code, fullName } = payload;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const AccessCode = mongoose.models.AccessCode;
    const User = mongoose.models.User;

    const accessCode = await AccessCode.findOne({ code }).session(session);
    if (!accessCode) {
      await session.abortTransaction();
      session.endSession();
      const err: any = new Error('Invalid access code');
      err.status = 400;
      throw err;
    }

    if (accessCode.isUsed) {
      await session.abortTransaction();
      session.endSession();
      const err: any = new Error('This access code has already been used');
      err.status = 400;
      throw err;
    }

    const existing = await User.findOne({ matricNumber: code }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      const err: any = new Error('This access code has already been registered');
      err.status = 400;
      throw err;
    }

    accessCode.isUsed = true;
    await accessCode.save({ session });

    const user = new User({
      code: code,
      matricNumber: code,
      fullName: fullName,
      email: `${code}@vip.vote`,
      department: 'Special Unit',
      verificationStatus: 'verified',
      ocrConfidenceScore: 100
    });

    await user.save({ session });
    await session.commitTransaction();
    session.endSession();

    return user;
  } catch (err) {
    try { await session.abortTransaction(); } catch (e) {}
    try { session.endSession(); } catch (e) {}
    throw err;
  }
};

export const verifyDocumentForUser = async (userId: string, buffer: Buffer) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const User = mongoose.models.User;
    const user = await User.findById(userId).session(session);
    if (!user) {
      const err: any = new Error('User not found');
      throw err;
    }

    let ocrResult;
    try {
      ocrResult = await processDocument(buffer, {
        matricNumber: user.matricNumber,
        fullName: user.fullName,
        department: user.department
      });
    } catch (ocrError: any) {
      await session.abortTransaction();
      session.endSession();
      const err: any = new Error(ocrError?.message || 'Document verification failed');
      err.status = 400;
      throw err;
    }

    user.ocrConfidenceScore = ocrResult.confidence ?? 0;
    if (ocrResult.success) {
      user.verificationStatus = 'verified';
      user.rejectionReason = undefined;
    } else {
      user.verificationStatus = 'pending_manual_review';
      user.rejectionReason = ocrResult.reason || 'OCR Check Failed';
    }

    await user.save({ session });
    await session.commitTransaction();
    session.endSession();

    return user;
  } catch (err) {
    try { await session.abortTransaction(); } catch (e) {}
    try { session.endSession(); } catch (e) {}
    throw err;
  }
};
