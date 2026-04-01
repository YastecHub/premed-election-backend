import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CategorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

let Category: any;
try {
  Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
} catch (error) {
  console.error('Error creating Category model:', error);
  Category = undefined;
}

export { Category };