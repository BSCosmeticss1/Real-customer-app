// Feature IDs mirror the frontend sidebar's feature gating (app/app/layout.tsx).
const FEATURE_IDS = [
  'messaging',
  'contacts',
  'inventory',
  'analytics',
  'automation',
  'bookingReporting',
  'finance',
];

// ─── Compute a user's active feature set ───────────────────────────────────────
// Mirrors the frontend's logic exactly:
// - Admins are gated by their own subscription's selectedFeatures (or all, if unset)
// - Staff are gated by the allowedFeatures their admin assigned them (or none, if unset)
exports.getActiveFeatures = (user) => {
  if (user.role === 'ADMIN') {
    const selected = user.subscription?.selectedFeatures;
    return Array.isArray(selected) && selected.length > 0 ? selected : FEATURE_IDS;
  }
  const allowed = user.allowedFeatures;
  return Array.isArray(allowed) && allowed.length > 0 ? allowed : [];
};

// ─── Require a feature to be active for the current user ───────────────────────
exports.requireFeature = (featureId) => (req, res, next) => {
  const active = exports.getActiveFeatures(req.user);
  if (!active.includes(featureId)) {
    return res.status(403).json({
      success: false,
      message: `The "${featureId}" feature is not enabled for your account.`,
    });
  }
  next();
};

exports.FEATURE_IDS = FEATURE_IDS;
