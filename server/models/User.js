import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  isActive: { type: Boolean, default: true },
  onboardingCompleted: { type: Boolean, default: false },
  profile: {
    targetYear: { type: Number, default: () => new Date().getFullYear() + 1 },
    attemptNumber: { type: Number, default: 1 },
    optionalSubject: { type: String, default: '' },
    dailyHours: { type: Number, default: 4 },
    preparationLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    priority: { type: String, enum: ['prelims', 'mains', 'balanced'], default: 'balanced' },
    studyPreferences: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password helper
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', UserSchema);
export default User;
