import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';

export const onboardStudent = async (req, res, next) => {
  try {
    const {
      targetExamYear,
      attemptNumber,
      preparationStartDate,
      currentPreparationLevel,
      primaryPriority,
      optionalSubject,
      availableStudyHoursPerDay,
      preferredStudyStartTime,
      preferredStudyEndTime,
      preferredStudyDays,
      preferredStudyMode,
      syllabusCompletionLevel,
      currentPreparationStage,
      csatPreparationStatus,
      mainsAnswerWritingExperience,
      currentAffairsPreparationStatus
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    let profile = await StudentProfile.findOne({ user: user._id });
    if (!profile) {
      profile = new StudentProfile({ user: user._id });
    }

    profile.targetExamYear = targetExamYear;
    profile.attemptNumber = attemptNumber;
    profile.preparationStartDate = preparationStartDate ? new Date(preparationStartDate) : undefined;
    profile.currentPreparationLevel = currentPreparationLevel;
    profile.primaryPriority = primaryPriority;
    profile.optionalSubject = optionalSubject;
    profile.availableStudyHoursPerDay = availableStudyHoursPerDay;
    profile.preferredStudyStartTime = preferredStudyStartTime;
    profile.preferredStudyEndTime = preferredStudyEndTime;
    profile.preferredStudyDays = preferredStudyDays;
    profile.preferredStudyMode = preferredStudyMode;
    profile.syllabusCompletionLevel = syllabusCompletionLevel || 0;
    profile.currentPreparationStage = currentPreparationStage;
    profile.csatPreparationStatus = csatPreparationStatus;
    profile.mainsAnswerWritingExperience = mainsAnswerWritingExperience;
    profile.currentAffairsPreparationStatus = currentAffairsPreparationStatus;

    await profile.save();

    user.onboardingCompleted = true;
    user.profile = {
      targetYear: targetExamYear,
      attemptNumber,
      optionalSubject,
      dailyHours: availableStudyHoursPerDay,
      preparationLevel: currentPreparationLevel,
      priority: primaryPriority === 'Both' ? 'balanced' : primaryPriority.toLowerCase()
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Student onboarding configuration completed successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
        profile: user.profile
      },
      studentProfile: profile
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, profile } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    if (name) user.name = name;
    if (profile) {
      user.profile = {
        ...user.profile,
        ...profile
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile configuration updated successfully.',
      user
    });
  } catch (error) {
    next(error);
  }
};
