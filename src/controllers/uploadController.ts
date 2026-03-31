import { Request, Response, NextFunction } from 'express';
import { cloudinary } from '../config/cloudinary';
import { success } from '../utils/response';
import fs from 'fs';

export const uploadImage = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.file || !req.file.path) {
      const err: any = new Error('No file uploaded');
      err.status = 400;
      throw err;
    }

    const localFilePath = req.file.path as string;

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: 'candidates',
        resource_type: 'image',
      });

      // Delete local file
      await fs.promises.unlink(localFilePath);

      return success(res, {
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (uploadError) {
      // Clean up local file on error
      try {
        await fs.promises.unlink(localFilePath);
      } catch (e) {
        // Ignore cleanup errors
      }
      throw uploadError;
    }
  } catch (err) {
    return next(err);
  }
};
