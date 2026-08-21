const { prisma } = require('./src/config/db');

const TARGET_EMAIL = 'oluwaseunpaul98@gmail.com';

const ALL_FEATURES = [
  'messaging',
  'contacts',
  'inventory',
  'analytics',
  'automation',
  'bookingReporting',
  'finance',
];

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL.toLowerCase() },
  });

  if (!user) {
    console.error(`User not found: ${TARGET_EMAIL}`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      role: 'ADMIN',
      allowedFeatures: ALL_FEATURES,
      subscription: {
        plan: 'enterprise',
        status: 'active',
        selectedFeatures: ALL_FEATURES,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  });

  delete updated.password;
  console.log('Updated user:', {
    id: updated.id,
    email: updated.email,
    role: updated.role,
    allowedFeatures: updated.allowedFeatures,
    subscription: updated.subscription,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
