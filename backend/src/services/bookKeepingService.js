const { prisma } = require('../config/db');

const logBookKeeping = async (userId, module, entityType, entityId, action, description, metadata = {}, performedBy) => {
  try {
    await prisma.bookKeeping.create({
      data: {
        userId,
        module,
        entityType,
        entityId,
        action,
        description,
        metadata,
        performedBy: performedBy || 'system',
      },
    });
  } catch (err) {
    console.error('[BookKeeping] Failed to create record:', err.message, {
      userId, module, entityType, entityId, action, description
    });
  }
};

module.exports = { logBookKeeping };
