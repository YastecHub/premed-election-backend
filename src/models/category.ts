import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CategorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);