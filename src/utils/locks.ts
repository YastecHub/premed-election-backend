import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

export const DEFAULT_LOCK_TTL = 8000; // ms

const lockSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});
lockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Lock = mongoose.models.Lock || mongoose.model('Lock', lockSchema);

export async function acquireLock(key: string, ttl = DEFAULT_LOCK_TTL, retries = 6, retryDelay = 200): Promise<string | null> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + ttl);

  try {
    await Lock.create({ key, token, expiresAt });
    return token;
  } catch (err: any) {
    if (err?.code !== 11000) console.warn('acquireLock create error', err);
  }

  for (let i = 0; i < retries; i++) {
    const now = new Date();
    try {
      const replaced = await Lock.findOneAndUpdate(
        { key, expiresAt: { $lte: now } },
        { $set: { token, expiresAt } },
        { new: true }
      ).exec();

      if (replaced) return token;
    } catch (e) {
      console.warn('acquireLock findOneAndUpdate error', e);
    }
    await new Promise(r => setTimeout(r, retryDelay));
  }

  return null;
}

export async function releaseLock(key: string, token: string) {
  try {
    await Lock.findOneAndDelete({ key, token }).exec();
  } catch (e) {
    console.warn('releaseLock error', e);
  }
}
