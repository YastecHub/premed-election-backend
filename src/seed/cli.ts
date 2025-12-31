import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedInitialData } from './index';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/premed_election';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    await seedInitialData();
    console.log('Seeding completed');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}
