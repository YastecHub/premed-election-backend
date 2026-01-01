import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'moderator'], default: 'moderator' }
});

export const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
