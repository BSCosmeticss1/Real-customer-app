const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Connected Successfully via Prisma!');
  } catch (error) {
    console.error('❌ PostgreSQL Connection Failed');
    console.error(error);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
