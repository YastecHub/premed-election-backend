import { Admin, Category, ApprovedStudent } from '../models';
import { logger } from '../utils/logger';
import { APPROVED_STUDENTS } from './approvedStudents';

const DEFAULT_CATEGORIES = [
  'Pre-med Governor',
  'Assistant Premed',
  'Sport Secretary',
  'Media Coordinator',
  'President',
  'Vice President',
  'Secretary',
  'Treasurer'
];

export async function seedInitialData() {
  logger.info('Seed: Admin:', typeof Admin, Admin?.constructor?.name);
  logger.info('Seed: Category:', typeof Category, Category?.constructor?.name);
  logger.info('Seed: ApprovedStudent:', typeof ApprovedStudent, ApprovedStudent?.constructor?.name);

  // Seed categories (positions) on first run only
  if (Category) {
    if (await Category.countDocuments() === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES.map(name => ({ name })));
      logger.info(`Seeded ${DEFAULT_CATEGORIES.length} categories`);
    }
  } else {
    logger.warn('Category model is undefined, skipping category seeding');
  }

  // Seed admin — credentials from env vars, fallback to defaults with a warning
  const adminUsername = process.env.ADMIN_USERNAME || 'superadmin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    logger.warn('Using default admin credentials. Set ADMIN_USERNAME and ADMIN_PASSWORD env vars for production.');
  }
  await Admin.findOneAndUpdate(
    { username: adminUsername },
    { username: adminUsername, password: adminPassword, role: 'super_admin' },
    { upsert: true }
  ).exec();

  // Seed/sync the approved-students whitelist. Idempotent: upserts each entry by matric.
  if (ApprovedStudent) {
    const ops = APPROVED_STUDENTS.map(s => ({
      updateOne: {
        filter: { matricNumber: s.matricNumber },
        update: { $set: { matricNumber: s.matricNumber, fullName: s.fullName } },
        upsert: true
      }
    }));
    if (ops.length > 0) {
      const result = await ApprovedStudent.bulkWrite(ops);
      logger.info(`Approved students synced: ${ops.length} entries (${result.upsertedCount ?? 0} new)`);
    }
  } else {
    logger.warn('ApprovedStudent model is undefined, skipping whitelist seeding');
  }

  logger.info('Seeding complete');
}
