import mongoose from 'mongoose';

const StudentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  targetExamYear: { type: Number, required: true },
  attemptNumber: { type: Number, required: true },
  preparationStartDate: { type: Date },
  currentPreparationLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  primaryPriority: { type: String, enum: ['Prelims', 'Mains', 'Both'], required: true },
  optionalSubject: { type: String, required: true },
  availableStudyHoursPerDay: { type: Number, required: true },
  preferredStudyStartTime: { type: String },
  preferredStudyEndTime: { type: String },
  preferredStudyDays: [{ type: String }],
  preferredStudyMode: { type: String },
  syllabusCompletionLevel: { type: Number, default: 0 },
  currentPreparationStage: { type: String },
  csatPreparationStatus: { type: String },
  mainsAnswerWritingExperience: { type: String },
  currentAffairsPreparationStatus: { type: String },

  // Streak & Timer stats fallback
  streak: { type: Number, default: 0 },
  lastStudyDate: { type: Date },

  // Notification Preferences
  notificationPreferences: {
    revision: { type: Boolean, default: true },
    goal: { type: Boolean, default: true },
    test: { type: Boolean, default: true },
    streak: { type: Boolean, default: true },
    weak_topic: { type: Boolean, default: true },
    mains: { type: Boolean, default: true },
    recommendation: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

export const StudentProfile = mongoose.model('StudentProfile', StudentProfileSchema);
export default StudentProfile;
