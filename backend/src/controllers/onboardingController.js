const { prisma } = require('../config/db');

// @route PUT /onboarding/details
exports.updateOnboardingDetails = async (req, res, next) => {
  try {
    const { businessName, businessPhone, businessAddress, website, currency, timezone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        settings: {
          businessName,
          businessPhone,
          businessAddress,
          website,
          currency: currency || 'NGN',
          timezone: timezone || 'Africa/Lagos',
        },
        onboardingStatus: 'ONBOARDING',
      },
    });

    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// @route GET /onboarding/status
exports.getOnboardingStatus = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { onboardingStatus: true, isVerified: true, subscription: true },
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};
